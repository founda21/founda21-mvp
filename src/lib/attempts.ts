import { prisma } from "@/lib/prisma";
import { FRAMEWORK_VERSION } from "@/lib/scoring/index";
import type { StageProgress } from "@/lib/stage-gating";
import { generateConsistencyFlags } from "@/lib/consistency-check";
import { generateSimilarityFlags } from "@/lib/similarity-check";

// System integrity fix 2 — retake policy. A permanent, append-only record of
// each time a stage is fully evaluated (every checkpoint in it scored at
// least once). Deliberately separate from Score/StageStatus: those still
// carry numeric scores for the founder's own immediate per-checkpoint
// feedback (existing, unchanged product behavior) — AssessmentAttempt and
// everything built from it are qualitative only (pass/fail + gap category),
// because this is the surface the retake-cooldown / anti-gaming rules read.

export const COOLDOWN_DAYS = 14;

export type GapCategory = "not_attempted" | "close" | "moderate_gap" | "significant_gap" | "passed";

export type CheckpointOutcome = {
  checkpointId: number;
  name: string;
  passed: boolean;
  gapCategory: GapCategory;
};

function classifyGap(score: number | null, passed: boolean, threshold: number): GapCategory {
  if (score === null) return "not_attempted";
  if (passed) return "passed";
  const gap = threshold - score;
  if (gap <= 10) return "close";
  if (gap <= 25) return "moderate_gap";
  return "significant_gap";
}

// Null = no active cooldown (either never failed, or the 14 days have
// passed). Checked server-side before every submission — this is the actual
// enforcement point, not just a UI hint.
export async function getStageCooldown(founderId: string, stage: number): Promise<Date | null> {
  const lastAttempt = await prisma.assessmentAttempt.findFirst({
    where: { founderId, stage },
    orderBy: { attemptNumber: "desc" },
  });
  if (!lastAttempt || lastAttempt.result !== "fail") return null;

  const unlockAt = new Date(lastAttempt.scoredAt.getTime() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
  return unlockAt > new Date() ? unlockAt : null;
}

// Called from recomputeStageStatus once every checkpoint in a stage has a
// score. Self-limiting against duplicate rows: while a stage is still being
// worked on (not yet fully scored) nothing is recorded; once a failed
// attempt IS recorded, the cooldown check blocks further submissions until
// it expires, so there's no way to spam new attempt rows via resubmission
// churn. A P2002 race (two calls recording the same attemptNumber at once)
// is swallowed as "already recorded."
export async function maybeRecordStageAttempt(founderId: string, stage: number, progress: StageProgress): Promise<void> {
  const allScored = progress.checkpoints.every((c) => c.score !== null);
  if (!allScored) return;

  const priorAttempts = await prisma.assessmentAttempt.count({ where: { founderId, stage } });
  const attemptNumber = priorAttempts + 1;

  const perCheckpointOutcome: CheckpointOutcome[] = progress.checkpoints.map((c) => ({
    checkpointId: c.checkpointId,
    name: c.name,
    passed: c.passed,
    gapCategory: classifyGap(c.score, c.passed, c.threshold),
  }));

  const latestScore = await prisma.score.findFirst({
    where: { submission: { founderId } },
    orderBy: { createdAt: "desc" },
  });
  const modelVersion = latestScore?.modelVersion ?? "n/a";

  // Anti-gaming flags (§ fix 3.2/3.3) — separate calls, never fed back into
  // scoring, never block this attempt from being recorded if they fail.
  let consistencyFlags: unknown = null;
  try {
    consistencyFlags = await generateConsistencyFlags(founderId, stage);
  } catch (error) {
    console.error(`generateConsistencyFlags failed for founder ${founderId} stage ${stage}:`, error);
  }

  let similarityFlags: unknown = null;
  try {
    similarityFlags = await generateSimilarityFlags(founderId, stage);
  } catch (error) {
    console.error(`generateSimilarityFlags failed for founder ${founderId} stage ${stage}:`, error);
  }

  try {
    await prisma.assessmentAttempt.create({
      data: {
        founderId,
        stage,
        attemptNumber,
        result: progress.passed ? "pass" : "fail",
        perCheckpointOutcome: JSON.parse(JSON.stringify(perCheckpointOutcome)),
        consistencyFlags: consistencyFlags ? JSON.parse(JSON.stringify(consistencyFlags)) : undefined,
        similarityFlags: similarityFlags ? JSON.parse(JSON.stringify(similarityFlags)) : undefined,
        frameworkVersion: FRAMEWORK_VERSION,
        modelVersion,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) return; // already recorded this attempt number — fine
    throw error;
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "P2002";
}

// Founder-facing summary of the most recent FAILED attempt for a stage,
// while its cooldown is still active. Deliberately shaped with no numeric
// score field anywhere — not hidden in the UI, absent from the type/query
// itself — so there's nothing to accidentally leak by rendering more of
// this object later.
export type StageAttemptSummary = {
  attemptNumber: number;
  scoredAt: Date;
  cooldownUntil: Date;
  checkpointOutcomes: CheckpointOutcome[];
};

export async function getActiveCooldownSummary(founderId: string, stage: number): Promise<StageAttemptSummary | null> {
  const lastAttempt = await prisma.assessmentAttempt.findFirst({
    where: { founderId, stage },
    orderBy: { attemptNumber: "desc" },
  });
  if (!lastAttempt || lastAttempt.result !== "fail") return null;

  const cooldownUntil = new Date(lastAttempt.scoredAt.getTime() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
  if (cooldownUntil <= new Date()) return null;

  return {
    attemptNumber: lastAttempt.attemptNumber,
    scoredAt: lastAttempt.scoredAt,
    cooldownUntil,
    checkpointOutcomes: lastAttempt.perCheckpointOutcome as unknown as CheckpointOutcome[],
  };
}
