import { prisma } from "@/lib/prisma";
import {
  CHECKPOINTS,
  checkpointsForStage,
  STAGE_AVERAGE_THRESHOLDS,
  STAGE_MIN_VENTURE_STAGE,
  type Stage,
} from "@/lib/checkpoints";
import { VentureType } from "@/generated/prisma/enums";
import { ventureStageRank } from "@/lib/venture-stage";
import { parseTractionSubmission, meetsTractionMinimums, type TractionStatus } from "@/lib/traction";
import { generateFounderAnalysis } from "@/lib/founder-analysis";
import { notifyStageMilestone } from "@/lib/notifications";
import { maybeRecordStageAttempt } from "@/lib/attempts";

export function canAccessCheckpoint(
  founder: { currentStage: number; ventureStage?: string | null },
  checkpointId: number,
): boolean {
  const checkpoint = CHECKPOINTS.find((c) => c.id === checkpointId);
  if (!checkpoint) return false;
  if (checkpoint.stage > founder.currentStage) return false;

  const founderRank = ventureStageRank(founder.ventureStage);
  if (founderRank === null) return true; // no declared stage — not retroactively gated

  const requiredRank = ventureStageRank(STAGE_MIN_VENTURE_STAGE[checkpoint.stage]);
  if (requiredRank !== null && founderRank < requiredRank) return false;

  return true;
}

// Distinguishes *why* a checkpoint is locked, for UI messaging — sequential
// (finish earlier checkpoints/stages first) vs venture-stage (self-reported
// stage isn't far enough along yet to realistically attempt it).
export function checkpointLockReason(
  founder: { currentStage: number; ventureStage?: string | null },
  checkpointId: number,
): "sequential" | "venture-stage" | null {
  const checkpoint = CHECKPOINTS.find((c) => c.id === checkpointId);
  if (!checkpoint) return null;
  if (checkpoint.stage > founder.currentStage) return "sequential";

  const founderRank = ventureStageRank(founder.ventureStage);
  if (founderRank === null) return null;

  const requiredRank = ventureStageRank(STAGE_MIN_VENTURE_STAGE[checkpoint.stage]);
  if (requiredRank !== null && founderRank < requiredRank) return "venture-stage";

  return null;
}

async function latestSubmissionsByCheckpoint(founderId: string, checkpointIds: number[]) {
  const submissions = await prisma.submission.findMany({
    where: { founderId, checkpointId: { in: checkpointIds } },
    include: { score: true },
  });

  const map = new Map<number, (typeof submissions)[number]>();
  for (const submission of submissions) {
    const existing = map.get(submission.checkpointId);
    if (!existing || submission.attemptNumber > existing.attemptNumber) {
      map.set(submission.checkpointId, submission);
    }
  }
  return map;
}

export type CheckpointProgress = {
  checkpointId: number;
  name: string;
  score: number | null;
  passed: boolean;
  threshold: number;
};

export type StageProgress = {
  stage: Stage;
  checkpoints: CheckpointProgress[];
  allCheckpointsPassed: boolean;
  stageAverage: number | null;
  averageThreshold: number | null;
  averageMet: boolean;
  tractionStatus: TractionStatus | null;
  passed: boolean;
};

export async function getStageProgress(
  founder: { id: string; ventureType: VentureType },
  stage: Stage,
): Promise<StageProgress> {
  const checkpoints = checkpointsForStage(stage);
  const submissionsMap = await latestSubmissionsByCheckpoint(
    founder.id,
    checkpoints.map((c) => c.id),
  );

  const checkpointProgress: CheckpointProgress[] = checkpoints.map((c) => {
    const submission = submissionsMap.get(c.id);
    return {
      checkpointId: c.id,
      name: c.name,
      score: submission?.score?.checkpointScore ?? null,
      passed: submission?.score?.passed ?? false,
      threshold: c.passThreshold,
    };
  });

  const allCheckpointsPassed = checkpointProgress.every((c) => c.passed);

  // Only a meaningful "stage average" once every checkpoint has been scored —
  // matches the spec's "every checkpoint >= X AND stage average >= Y" phrasing.
  const allScored = checkpointProgress.every((c) => c.score !== null);
  const stageAverage = allScored
    ? Math.round(
        (checkpointProgress.reduce((sum, c) => sum + (c.score ?? 0), 0) / checkpointProgress.length) * 10,
      ) / 10
    : null;

  // Stage 2 has no explicit stage-average bar in the spec — only per-checkpoint
  // thresholds plus traction minimums.
  const averageThreshold = stage === 2 ? null : STAGE_AVERAGE_THRESHOLDS[stage];
  const averageMet = averageThreshold === null ? true : stageAverage !== null && stageAverage >= averageThreshold;

  let tractionStatus: TractionStatus | null = null;
  if (stage === 2) {
    const tractionSubmission = submissionsMap.get(11);
    const traction = tractionSubmission ? parseTractionSubmission(tractionSubmission.artifactContent) : null;
    tractionStatus = meetsTractionMinimums(founder.ventureType, traction);
  }

  const passed = allCheckpointsPassed && averageMet && (tractionStatus?.met ?? true);

  return {
    stage,
    checkpoints: checkpointProgress,
    allCheckpointsPassed,
    stageAverage,
    averageThreshold,
    averageMet,
    tractionStatus,
    passed,
  };
}

// Re-evaluates the founder's current (active) stage after a new score lands,
// updates StageStatus, and advances currentStage + opens the next stage if
// passed. Earlier stages are not re-evaluated once passed — they're locked-in
// milestones per §9.
export async function recomputeStageStatus(founderId: string): Promise<void> {
  const founder = await prisma.founder.findUniqueOrThrow({ where: { id: founderId } });
  const stage = Math.min(founder.currentStage, 3) as Stage;

  const progress = await getStageProgress({ id: founder.id, ventureType: founder.ventureType }, stage);

  // Fetched before the upsert so we can tell a genuine pass -> passed
  // transition apart from re-evaluating an already-passed stage (e.g. a
  // founder improving an already-passing checkpoint's score) — only the
  // former should notify funders.
  const priorStatus = await prisma.stageStatus.findUnique({ where: { founderId_stage: { founderId, stage } } });
  const justPassed = progress.passed && priorStatus?.status !== "passed";

  await prisma.stageStatus.upsert({
    where: { founderId_stage: { founderId, stage } },
    update: {
      status: progress.passed ? "passed" : "in_progress",
      stageAverage: progress.stageAverage ?? undefined,
      passedAt: progress.passed ? new Date() : undefined,
    },
    create: {
      founderId,
      stage,
      status: progress.passed ? "passed" : "in_progress",
      stageAverage: progress.stageAverage ?? undefined,
      passedAt: progress.passed ? new Date() : undefined,
    },
  });

  // A funder-facing AI read, not part of scoring — must never block a
  // founder's own submission from succeeding if Gemini errors here.
  try {
    await generateFounderAnalysis(founderId);
  } catch (error) {
    console.error(`generateFounderAnalysis failed for founder ${founderId}:`, error);
  }

  if (justPassed) {
    try {
      await notifyStageMilestone(founderId, stage, stage === 3);
    } catch (error) {
      console.error(`notifyStageMilestone failed for founder ${founderId}:`, error);
    }
  }

  // Permanent stage-attempt record + retake-cooldown trigger (§ system
  // integrity fix 2) — never blocks the founder's own submission if this
  // fails; the attempt just won't be recorded that round.
  try {
    await maybeRecordStageAttempt(founderId, stage, progress);
  } catch (error) {
    console.error(`maybeRecordStageAttempt failed for founder ${founderId} stage ${stage}:`, error);
  }

  if (progress.passed && stage < 3) {
    const nextStage = ((stage + 1) as Stage);
    await prisma.founder.update({ where: { id: founderId }, data: { currentStage: nextStage } });
    await prisma.stageStatus.upsert({
      where: { founderId_stage: { founderId, stage: nextStage } },
      update: {},
      create: { founderId, stage: nextStage, status: "in_progress" },
    });
  }
}
