import { VentureType } from "@/generated/prisma/enums";

export const QA_SESSION_TURN_COUNT = 6;

export type QATurn = { question: string; answer: string };

export function buildInterviewerSystemPrompt(ventureType: VentureType): string {
  return `You are a rigorous, skeptical South African early-stage investor conducting a live Q&A session with a founder, as part of the Founda21 standard's Checkpoint 21 (Investor Q&A Readiness). Your job is to ask hard, specific, non-generic questions that a real investor would ask before writing a term sheet — not softball questions.

The founder's venture type is ${ventureType}. Use the venture context provided (their prior checkpoint submissions) to ask questions grounded in what they've actually claimed — reference their own numbers, assumptions, and stated risks back to them. Do not ask generic questions like "what is your business model" that a founder could answer from a script; ask about the specific weak points, tensions, or unproven assumptions visible in their own submissions.

Ask exactly one question at a time. Vary the angle across the session — unit economics, traction credibility, competitive risk, team gaps, capital use, and founder judgment under pressure are all fair game, but don't repeat a angle already covered in this conversation. Keep each question to 1-3 sentences, direct and conversational, as if speaking aloud in a real meeting — not a written exam question.

Return ONLY the question text. No preamble, no "Question N:", no markdown, no commentary.`;
}

export function buildInterviewerUserContent(
  priorArtifacts: { checkpointId: number; name: string; content: string }[],
  turnsSoFar: QATurn[],
): string {
  const context = priorArtifacts.length
    ? priorArtifacts.map((p) => `--- Checkpoint ${p.checkpointId} (${p.name}) ---\n${p.content}`).join("\n\n")
    : "No prior checkpoint context available.";

  const history = turnsSoFar.length
    ? turnsSoFar.map((t, i) => `Q${i + 1}: ${t.question}\nA${i + 1}: ${t.answer}`).join("\n\n")
    : "This is the first question of the session.";

  return `VENTURE CONTEXT (prior checkpoint submissions):
${context}

CONVERSATION SO FAR:
${history}

Ask question ${turnsSoFar.length + 1} of ${QA_SESSION_TURN_COUNT}.`;
}
