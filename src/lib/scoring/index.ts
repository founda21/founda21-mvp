import { getCheckpoint, type Checkpoint } from "@/lib/checkpoints";
import { VentureType } from "@/generated/prisma/enums";
import { scoringOutputSchema, type ScoringOutput } from "./schema";
import { buildSystemPrompt, buildUserContent } from "./prompt";
import { callGemini, type ImageAttachment } from "./gemini";

// v0.2: grounded SA Reality Fit for the 7 checkpoints that previously had no
// real local anchor, redefined Investor Credibility as a distinct scrutiny/
// self-awareness test, added a calibration anchor for banding (§ checkpoints.ts,
// scoring/prompt.ts). Scores from v0.1 are not directly comparable to v0.2.
export const FRAMEWORK_VERSION = "v0.2";
const MAX_ATTEMPTS = 4;
const RETRY_DELAY_MS = 5000;

// Reliability fix (§ scoring regression harness — scripts/scoring-regression.ts
// measured a 20% pass/fail flip rate re-scoring identical inputs). A single
// call's score can land close enough to the threshold that ordinary model
// variance flips the outcome. Submissions within this many points of the
// threshold get a second independent call, averaged in — this never touches
// the prompt, schema, or Gemini call itself, only how many times it's asked
// and how the results are combined.
const BORDERLINE_MARGIN = 12;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Thrown when every retry hit a transient provider-side failure (Gemini 503
// "high demand", timeouts, etc.) rather than something wrong with the
// submission itself — callers use this to show founders a clean "try again
// shortly" message instead of a raw provider stack trace.
export class ScoringUnavailableError extends Error {
  constructor(cause: unknown) {
    super("The scoring service is temporarily unavailable. Please try again in a few minutes.");
    this.name = "ScoringUnavailableError";
    this.cause = cause;
  }
}

function isTransientProviderError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /503|overloaded|high demand|UNAVAILABLE|ECONNRESET|ETIMEDOUT|fetch failed|timed out/i.test(message);
}

export type ScoringResult = {
  output: ScoringOutput;
  modelVersion: string;
  frameworkVersion: string;
};

function bandForScore(score: number): string {
  if (score <= 3) return "Absent";
  if (score <= 7) return "Minimal";
  if (score <= 11) return "Adequate";
  if (score <= 15) return "Strong";
  return "Exceptional";
}

// One Gemini call + validation + the server-authoritative recompute of
// total/pass (§10 — never trust the model's own arithmetic). Retries on
// transient failures (e.g. Gemini 503s), same as before this change.
async function scoreOnce(
  checkpoint: Checkpoint,
  systemPrompt: string,
  userContent: string,
  images: ImageAttachment[] | undefined,
): Promise<{ output: ScoringOutput; modelVersion: string }> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const attemptStart = Date.now();
    try {
      const { raw, modelVersion } = await callGemini(systemPrompt, userContent, images);
      console.error(`[scoring] CP${checkpoint.id} attempt ${attempt}/${MAX_ATTEMPTS} succeeded in ${Date.now() - attemptStart}ms`);
      const parsed = scoringOutputSchema.parse(raw);

      const computedScore = parsed.dimensions.reduce((sum, d) => sum + d.score, 0);
      const normalized: ScoringOutput = {
        ...parsed,
        checkpoint_id: checkpoint.id,
        checkpoint_score: computedScore,
        passed: computedScore >= checkpoint.passThreshold,
      };

      return { output: normalized, modelVersion };
    } catch (error) {
      lastError = error;
      const elapsed = Date.now() - attemptStart;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[scoring] CP${checkpoint.id} attempt ${attempt}/${MAX_ATTEMPTS} failed after ${elapsed}ms: ${message.slice(0, 200)}`);
      if (attempt < MAX_ATTEMPTS) {
        const delay = RETRY_DELAY_MS * attempt;
        console.error(`[scoring] CP${checkpoint.id} retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  console.error(`Scoring failed after ${MAX_ATTEMPTS} attempts for checkpoint ${checkpoint.id}:`, lastError);
  if (isTransientProviderError(lastError)) {
    throw new ScoringUnavailableError(lastError);
  }
  throw new Error(`Scoring failed after ${MAX_ATTEMPTS} attempts: ${String(lastError)}`);
}

// Averages multiple independent scoring calls dimension-by-dimension and
// recomputes the total/pass from the averaged dimensions — that's the
// number that actually gates the outcome, so it's the one worth making more
// reliable. Keeps the FIRST call's qualitative text (reasoning, summary,
// top_priority_fix): there's no sound way to "average" prose, and the
// founder is better served by one coherent set of feedback than a stitched-
// together blend of two or three drafts.
function averageOutputs(checkpoint: Checkpoint, ...outputs: ScoringOutput[]): ScoringOutput {
  const [first] = outputs;
  const dimensions = first.dimensions.map((dim, i) => {
    const avgScore = Math.round(outputs.reduce((sum, o) => sum + o.dimensions[i].score, 0) / outputs.length);
    return { ...dim, score: avgScore, band: bandForScore(avgScore) };
  });
  const checkpoint_score = dimensions.reduce((sum, d) => sum + d.score, 0);
  return {
    ...first,
    dimensions,
    checkpoint_score,
    passed: checkpoint_score >= checkpoint.passThreshold,
  };
}

export async function scoreSubmission(params: {
  checkpointId: number;
  artifactContent: string;
  ventureType: VentureType;
  priorArtifacts: { checkpointId: number; name: string; content: string }[];
  imageAttachment?: ImageAttachment;
}): Promise<ScoringResult> {
  const checkpoint = getCheckpoint(params.checkpointId);
  const systemPrompt = buildSystemPrompt(checkpoint, params.ventureType);
  const userContent = buildUserContent(
    checkpoint,
    params.artifactContent,
    params.priorArtifacts,
    Boolean(params.imageAttachment),
  );
  const images = params.imageAttachment ? [params.imageAttachment] : undefined;

  const first = await scoreOnce(checkpoint, systemPrompt, userContent, images);

  const distanceFromThreshold = Math.abs(first.output.checkpoint_score - checkpoint.passThreshold);
  if (distanceFromThreshold > BORDERLINE_MARGIN) {
    return { output: first.output, modelVersion: first.modelVersion, frameworkVersion: FRAMEWORK_VERSION };
  }

  // Borderline — get a second independent read before finalizing pass/fail.
  const second = await scoreOnce(checkpoint, systemPrompt, userContent, images);

  if (first.output.passed === second.output.passed) {
    const averaged = averageOutputs(checkpoint, first.output, second.output);
    return { output: averaged, modelVersion: first.modelVersion, frameworkVersion: FRAMEWORK_VERSION };
  }

  // The two independent reads disagree on pass/fail outright — exactly the
  // flip scenario this exists to catch. A third call breaks the tie rather
  // than averaging just two readings that are already in conflict.
  const third = await scoreOnce(checkpoint, systemPrompt, userContent, images);
  const averaged = averageOutputs(checkpoint, first.output, second.output, third.output);
  return { output: averaged, modelVersion: first.modelVersion, frameworkVersion: FRAMEWORK_VERSION };
}
