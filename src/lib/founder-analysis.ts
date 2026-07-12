import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { CHECKPOINTS } from "@/lib/checkpoints";
import { callGemini } from "@/lib/scoring/gemini";
import type { ScoringOutput } from "@/lib/scoring/schema";

// A SEPARATE Gemini call from the 21-checkpoint scoring engine (§ non-
// negotiable rule 4 — the scoring prompt/schema/engine itself never changes).
// This synthesizes already-scored checkpoint results into a funder-facing
// investment read. It never re-scores a checkpoint and never feeds back into
// checkpoint_score/passed — it's a read of the output, not an input.

const RECOMMENDATIONS = ["fund", "fund_with_conditions", "not_yet", "pass"] as const;
export type Recommendation = (typeof RECOMMENDATIONS)[number];

export const RECOMMENDATION_LABELS: Record<Recommendation, string> = {
  fund: "Fund",
  fund_with_conditions: "Fund with conditions",
  not_yet: "Not yet investable",
  pass: "Pass",
};

const analysisSchema = z.object({
  recommendation: z.enum(RECOMMENDATIONS),
  recommendation_summary: z.string().min(1),
  strengths: z.array(z.string().min(1)).min(1).max(8),
  weaknesses: z.array(z.string().min(1)).min(1).max(8),
  narrative: z.string().min(1),
});

export type FounderAnalysis = z.infer<typeof analysisSchema>;

function buildSystemPrompt(): string {
  return `You are an experienced South African startup investment analyst advising a funder (accelerator, DFI, corporate ESD programme, or impact investor) on whether to fund a founder who has been assessed against the Founda21 21-checkpoint readiness standard.

You are given every checkpoint this founder has attempted so far — its score out of 100, whether it passed, and the scoring engine's own summary of that submission. You are NOT scoring anything yourself and must not invent facts beyond what's given. Base your analysis strictly on the provided checkpoint evidence.

Produce a funder-facing investment read: an overall recommendation, the concrete strengths that support it, the concrete weaknesses/risks that temper it, and a short narrative a busy funder could read in 30 seconds to decide whether to look closer.

Be honest and specific — cite checkpoint numbers where relevant, don't just restate generic startup advice. A founder with many passed checkpoints but a few serious unresolved gaps should not automatically get "fund" — weigh the real risks. A founder still early or with checkpoints not yet attempted should usually be "not_yet" rather than "pass", unless the gaps are fundamental (dishonest evidence, incoherent business logic, no real founder-problem fit).

Return ONLY a JSON object matching this schema, no preamble, no markdown, no commentary outside the JSON:
{
  "recommendation": "fund" | "fund_with_conditions" | "not_yet" | "pass",
  "recommendation_summary": "1-2 sentence verdict",
  "strengths": ["3 to 6 specific strengths, each grounded in checkpoint evidence, most important first"],
  "weaknesses": ["3 to 6 specific weaknesses or risks, each grounded in checkpoint evidence, most important first"],
  "narrative": "a short paragraph a funder could read in 30 seconds"
}`;
}

function buildUserContent(params: {
  ventureName: string;
  ventureType: string;
  ventureStage: string | null;
  currentStage: number;
  checkpointResults: { id: number; name: string; stage: number; score: number | null; passed: boolean; summary: string | null }[];
}): string {
  const rows = params.checkpointResults
    .map((c) => {
      if (c.score === null) return `CP${c.id} (${c.name}, Stage ${c.stage}): not attempted`;
      return `CP${c.id} (${c.name}, Stage ${c.stage}): ${c.score}/100, ${c.passed ? "passed" : "below threshold"} — ${c.summary}`;
    })
    .join("\n");

  return `Venture: ${params.ventureName} (${params.ventureType}), self-reported stage: ${params.ventureStage ?? "not stated"}, currently on Founda21 Stage ${params.currentStage}.

Checkpoint results:
${rows}`;
}

// Called from recomputeStageStatus (§ stage-gating.ts) after every checkpoint
// submission, alongside generateInstitutionalReports. Wrapped in try/catch by
// the caller — a failure here must never block a founder's own checkpoint
// submission from succeeding.
export async function generateFounderAnalysis(founderId: string): Promise<void> {
  const founder = await prisma.founder.findUniqueOrThrow({
    where: { id: founderId },
    include: { submissions: { include: { score: true }, orderBy: { attemptNumber: "asc" } } },
  });

  const latestByCheckpoint = new Map<number, (typeof founder.submissions)[number]>();
  for (const submission of founder.submissions) {
    const existing = latestByCheckpoint.get(submission.checkpointId);
    if (!existing || submission.attemptNumber > existing.attemptNumber) {
      latestByCheckpoint.set(submission.checkpointId, submission);
    }
  }

  const checkpointResults = CHECKPOINTS.map((c) => {
    const submission = latestByCheckpoint.get(c.id);
    const output = submission?.score?.dimensionsJson as ScoringOutput | undefined;
    return {
      id: c.id,
      name: c.name,
      stage: c.stage,
      score: output?.checkpoint_score ?? null,
      passed: output?.passed ?? false,
      summary: output?.summary ?? null,
    };
  });

  // Nothing scored yet — no meaningful analysis to generate.
  if (checkpointResults.every((c) => c.score === null)) return;

  const systemPrompt = buildSystemPrompt();
  const userContent = buildUserContent({
    ventureName: founder.ventureName,
    ventureType: founder.ventureType,
    ventureStage: founder.ventureStage,
    currentStage: founder.currentStage,
    checkpointResults,
  });

  const { raw, modelVersion } = await callGemini(systemPrompt, userContent);
  const parsed = analysisSchema.parse(raw);

  await prisma.founder.update({
    where: { id: founderId },
    data: {
      analysis: parsed,
      analysisModelVersion: modelVersion,
      analysisGeneratedAt: new Date(),
    },
  });
}
