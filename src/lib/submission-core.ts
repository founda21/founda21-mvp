import { prisma } from "@/lib/prisma";
import { getCheckpoint } from "@/lib/checkpoints";
import { recomputeStageStatus } from "@/lib/stage-gating";
import { scoreSubmission, ScoringUnavailableError } from "@/lib/scoring";
import { notifySubmissionScored } from "@/lib/notifications";
import { getStageCooldown } from "@/lib/attempts";
import { checkRateLimit } from "@/lib/rate-limit";
import type { ImageAttachment } from "@/lib/scoring/gemini";
import { VentureType } from "@/generated/prisma/enums";

// Every submission triggers a paid Gemini call — this caps genuine
// abuse/cost-runaway (bulk resubmission scripting) while comfortably
// clearing any real usage pattern (21 checkpoints, occasional resubmits).
const SUBMISSION_RATE_LIMIT = 15;
const SUBMISSION_RATE_WINDOW_MS = 60 * 60 * 1000;

// Shared by every checkpoint's finalization path (standard text/file
// submissions and the CP21 live Q&A session): creates the Submission row,
// gathers prior-checkpoint artifacts for cross-checking, scores it, and
// records the Score — or rolls back the submission on failure so a founder
// doesn't burn an attempt number on a scoring-service error.
export async function nextAttemptNumber(founderId: string, checkpointId: number): Promise<number> {
  const lastAttempt = await prisma.submission.findFirst({
    where: { founderId, checkpointId },
    orderBy: { attemptNumber: "desc" },
  });
  return (lastAttempt?.attemptNumber ?? 0) + 1;
}

export async function getPriorArtifacts(founderId: string, excludeCheckpointId: number) {
  const otherSubmissions = await prisma.submission.findMany({
    where: { founderId, checkpointId: { not: excludeCheckpointId } },
    orderBy: { attemptNumber: "desc" },
  });
  const priorByCheckpoint = new Map<number, (typeof otherSubmissions)[number]>();
  for (const s of otherSubmissions) {
    const existing = priorByCheckpoint.get(s.checkpointId);
    if (!existing || s.attemptNumber > existing.attemptNumber) priorByCheckpoint.set(s.checkpointId, s);
  }
  return Array.from(priorByCheckpoint.values()).map((s) => ({
    checkpointId: s.checkpointId,
    name: getCheckpoint(s.checkpointId).name,
    content: s.artifactContent,
  }));
}

export async function scoreAndSaveSubmission(
  founderId: string,
  ventureType: VentureType,
  checkpointId: number,
  artifactContent: string,
  attemptNumber: number,
  imageAttachment?: ImageAttachment,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const checkpoint = getCheckpoint(checkpointId);

  const rateLimit = await checkRateLimit(`submit:${founderId}`, SUBMISSION_RATE_LIMIT, SUBMISSION_RATE_WINDOW_MS);
  if (!rateLimit.ok) {
    return {
      ok: false,
      error: `Too many submissions in a short time. Try again after ${rateLimit.retryAfter.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}.`,
    };
  }

  // System integrity fix 2 — server-side retake cooldown, the actual
  // enforcement point (checked here regardless of which caller/UI reached
  // this function, so it can't be bypassed by hitting a different action).
  const cooldownUntil = await getStageCooldown(founderId, checkpoint.stage);
  if (cooldownUntil) {
    return {
      ok: false,
      error: `This stage failed its last full attempt and is in a 14-day cooldown. You can retry from ${cooldownUntil.toLocaleDateString(
        "en-ZA",
        { year: "numeric", month: "long", day: "numeric" },
      )}.`,
    };
  }

  const submission = await prisma.submission.create({
    data: {
      founderId,
      checkpointId,
      artifactType: checkpoint.artifactType,
      artifactContent,
      attemptNumber,
    },
  });

  const priorArtifacts = await getPriorArtifacts(founderId, checkpointId);

  try {
    const { output, modelVersion, frameworkVersion } = await scoreSubmission({
      checkpointId,
      artifactContent,
      ventureType,
      priorArtifacts,
      imageAttachment,
    });

    await prisma.score.create({
      data: {
        submissionId: submission.id,
        checkpointScore: output.checkpoint_score,
        passed: output.passed,
        dimensionsJson: JSON.parse(JSON.stringify(output)),
        summary: output.summary,
        topPriorityFix: output.top_priority_fix,
        modelVersion,
        frameworkVersion,
      },
    });

    await recomputeStageStatus(founderId);

    try {
      await notifySubmissionScored({
        founderId,
        checkpointId,
        checkpointName: checkpoint.name,
        score: output.checkpoint_score,
        passed: output.passed,
      });
    } catch (error) {
      console.error(`notifySubmissionScored failed for founder ${founderId}:`, error);
    }

    return { ok: true };
  } catch (error) {
    await prisma.submission.delete({ where: { id: submission.id } });

    // Founders never see raw provider errors — ScoringUnavailableError's own
    // message is already the clean, user-facing one; the full technical
    // detail is logged inside scoreOnce (§ scoring/index.ts) for anyone
    // debugging later. Anything else is an unexpected failure, not a known
    // transient one, so it gets a generic message rather than leaking
    // internals (stack traces, schema-validation detail, etc.) to the founder.
    if (error instanceof ScoringUnavailableError) {
      return { ok: false, error: error.message };
    }
    console.error(`Scoring failed for founder ${founderId}, checkpoint ${checkpointId}:`, error);
    return {
      ok: false,
      error: "Something went wrong while scoring your submission. Please try again — if this keeps happening, contact your funder.",
    };
  }
}
