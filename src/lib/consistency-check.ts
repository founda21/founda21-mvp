import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkpointsForStage, type Stage } from "@/lib/checkpoints";
import { callGemini } from "@/lib/scoring/gemini";

// System integrity fix 3.2 — a SEPARATE Gemini call from the 21-checkpoint
// scoring engine (§ non-negotiable rule: the scoring prompt/schema/engine
// itself never changes, and this call never receives or emits scores).
// Cross-checks a founder's OWN answers across one stage for internal
// contradictions only. Flag-only — never blocks or rescores anything.

const consistencyFlagSchema = z.object({
  checkpointA: z.number(),
  checkpointB: z.number(),
  description: z.string().min(1),
});

const consistencyOutputSchema = z.object({
  contradictions: z.array(consistencyFlagSchema),
});

export type ConsistencyFlag = z.infer<typeof consistencyFlagSchema>;

function buildSystemPrompt(): string {
  return `You are auditing a startup founder's own written answers across one stage of a readiness assessment for INTERNAL CONTRADICTIONS only — not quality, not completeness, not scoring.

You will be given the founder's own submitted answers for several checkpoints in one stage. Find places where the founder says two things that cannot both be true — e.g. claims paying customers in one answer and "pre-revenue" elsewhere; states the team is 2 people in one place and names 4 people elsewhere; gives conflicting dates, numbers, or facts for the same thing.

Only flag genuine contradictions between the founder's OWN statements — not weak arguments, not missing evidence, not opinions you disagree with, not stylistic inconsistency. If there are no contradictions, return an empty list.

Return ONLY a JSON object matching this schema, no preamble, no markdown, no commentary outside the JSON:
{
  "contradictions": [
    { "checkpointA": <checkpoint id, number>, "checkpointB": <checkpoint id, number>, "description": "one-line description of what conflicts" }
  ]
}`;
}

function buildUserContent(answers: { checkpointId: number; name: string; content: string }[]): string {
  return answers.map((a) => `CP${a.checkpointId} (${a.name}):\n${a.content}`).join("\n\n---\n\n");
}

// Called once per fully-scored stage from maybeRecordStageAttempt (§
// attempts.ts). Returns null when there's nothing meaningful to cross-check
// (fewer than two answered checkpoints).
export async function generateConsistencyFlags(founderId: string, stage: number): Promise<ConsistencyFlag[] | null> {
  const checkpoints = checkpointsForStage(stage as Stage);
  const submissions = await prisma.submission.findMany({
    where: { founderId, checkpointId: { in: checkpoints.map((c) => c.id) } },
    orderBy: { attemptNumber: "desc" },
  });

  const latestByCheckpoint = new Map<number, (typeof submissions)[number]>();
  for (const s of submissions) {
    const existing = latestByCheckpoint.get(s.checkpointId);
    if (!existing || s.attemptNumber > existing.attemptNumber) latestByCheckpoint.set(s.checkpointId, s);
  }

  const answers = checkpoints
    .map((c) => {
      const submission = latestByCheckpoint.get(c.id);
      return submission ? { checkpointId: c.id, name: c.name, content: submission.artifactContent } : null;
    })
    .filter((a): a is { checkpointId: number; name: string; content: string } => a !== null);

  if (answers.length < 2) return null;

  const systemPrompt = buildSystemPrompt();
  const userContent = buildUserContent(answers);

  const { raw } = await callGemini(systemPrompt, userContent);
  const parsed = consistencyOutputSchema.parse(raw);
  return parsed.contradictions;
}
