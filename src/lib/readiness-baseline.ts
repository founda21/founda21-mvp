import { prisma } from "@/lib/prisma";
import { CHECKPOINTS } from "@/lib/checkpoints";
import type { ScoringOutput } from "@/lib/scoring/schema";

export type CheckpointResult = { score: number | null; passed: boolean };
export type CheckpointResultMap = Record<number, CheckpointResult>;

export type ReadinessSnapshot = {
  stage: number;
  checkpointsPassed: number;
  totalPoints: number;
  checkpointResults: CheckpointResultMap;
};

// Single source of truth for "what does this founder's readiness look like
// right now" — used both to capture a ReadinessBaseline at the moment a
// CohortMembership is created and to compute the live state a funder compares
// it against later. Keeping one function means the two numbers are always
// computed the same way and can never silently drift apart.
export async function computeCurrentReadiness(founderId: string): Promise<ReadinessSnapshot> {
  const founder = await prisma.founder.findUniqueOrThrow({
    where: { id: founderId },
    select: {
      currentStage: true,
      submissions: { include: { score: true }, orderBy: { attemptNumber: "asc" } },
    },
  });

  const latestByCheckpoint = new Map<number, (typeof founder.submissions)[number]>();
  for (const submission of founder.submissions) {
    const existing = latestByCheckpoint.get(submission.checkpointId);
    if (!existing || submission.attemptNumber > existing.attemptNumber) {
      latestByCheckpoint.set(submission.checkpointId, submission);
    }
  }

  const checkpointResults: CheckpointResultMap = {};
  let checkpointsPassed = 0;
  let totalPoints = 0;
  for (const checkpoint of CHECKPOINTS) {
    const submission = latestByCheckpoint.get(checkpoint.id);
    const output = submission?.score?.dimensionsJson as ScoringOutput | undefined;
    const score = output?.checkpoint_score ?? null;
    const passed = output?.passed ?? false;
    checkpointResults[checkpoint.id] = { score, passed };
    if (score !== null) totalPoints += score;
    if (passed) checkpointsPassed++;
  }

  return { stage: founder.currentStage, checkpointsPassed, totalPoints, checkpointResults };
}

// Writes the permanent, one-time baseline for a just-created CohortMembership
// (§ ensureCohortMembership). Never called again for that membership after —
// a baseline is a fact about day one, not something that gets refreshed.
export async function captureReadinessBaseline(founderId: string, membershipId: string): Promise<void> {
  const snapshot = await computeCurrentReadiness(founderId);
  await prisma.readinessBaseline.create({
    data: {
      membershipId,
      stage: snapshot.stage,
      checkpointsPassed: snapshot.checkpointsPassed,
      totalPoints: snapshot.totalPoints,
      checkpointResults: snapshot.checkpointResults,
    },
  });
}

export type ReadinessProgress = {
  baselineCapturedAt: Date;
  baseline: ReadinessSnapshot;
  current: ReadinessSnapshot;
  checkpointsPassedDelta: number;
  totalPointsDelta: number;
  stageDelta: number;
  newlyPassedCheckpointIds: number[];
};

// Diffs a stored baseline against the founder's live state — the "since you
// joined us" number a funder actually reads. Pure function so the UI and the
// CSV export compute the exact same deltas from the exact same inputs.
export function computeReadinessProgress(
  baseline: { capturedAt: Date; stage: number; checkpointsPassed: number; totalPoints: number; checkpointResults: unknown },
  current: ReadinessSnapshot,
): ReadinessProgress {
  const baselineResults = baseline.checkpointResults as CheckpointResultMap;
  const baselineSnapshot: ReadinessSnapshot = {
    stage: baseline.stage,
    checkpointsPassed: baseline.checkpointsPassed,
    totalPoints: baseline.totalPoints,
    checkpointResults: baselineResults,
  };

  const newlyPassedCheckpointIds = CHECKPOINTS.filter((c) => {
    const wasPassed = baselineResults[c.id]?.passed ?? false;
    const isPassed = current.checkpointResults[c.id]?.passed ?? false;
    return isPassed && !wasPassed;
  }).map((c) => c.id);

  return {
    baselineCapturedAt: baseline.capturedAt,
    baseline: baselineSnapshot,
    current,
    checkpointsPassedDelta: current.checkpointsPassed - baseline.checkpointsPassed,
    totalPointsDelta: current.totalPoints - baseline.totalPoints,
    stageDelta: current.stage - baseline.stage,
    newlyPassedCheckpointIds,
  };
}
