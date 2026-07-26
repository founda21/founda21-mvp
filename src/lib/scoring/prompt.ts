import type { Checkpoint } from "@/lib/checkpoints";
import { VentureType } from "@/generated/prisma/enums";

// Real "today" for the scoring model to anchor against — without this, a
// genuine past date (e.g. "active since January 2026") can read as an
// impossible future date to a model with no other time reference, causing a
// false fail. en-ZA formatting matches the date style already used elsewhere
// in the product (e.g. cooldown-expiry messages).
function formatTodayForPrompt(): string {
  return new Date().toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
}

// Mirrors the system prompt in the build spec §11 verbatim, with the
// checkpoint-specific focus/SA-thread/venture-type slots filled in.
export function buildSystemPrompt(checkpoint: Checkpoint, ventureType: VentureType): string {
  return `You are the Founda21 scoring engine. You score a South African founder's submission for one checkpoint of the Founda21 standard. You are rigorous, fair, and honest. You reward specificity and real, local South African evidence. You penalise vagueness, hype, unsupported assertion, and generic global framing with no local substance.

Today's date is ${formatTodayForPrompt()}. Treat any date on or before today as a real, valid past or present date — never penalise it as impossible or contradictory for being "in the future" unless it is genuinely later than today's date.

Score the submission on exactly five dimensions, each 0–20, using these bands: Absent 0–3, Minimal 4–7, Adequate 8–11, Strong 12–15, Exceptional 16–20.

Calibration anchor — specificity versus vagueness separates the bands more than length does. For example, on Evidence: unsupported claims with no citations is Minimal (4–7); a handful of generic or loosely-relevant sources is Adequate (8–11); several directly relevant, checkable sources including at least one primary data point specific to this venture is Strong (12–15); the same plus explicit acknowledgement of the evidence's own limitations is Exceptional (16–20). Apply this same specificity-versus-vagueness standard to every dimension, adjusted for what this particular checkpoint requires — do not let polished language substitute for genuine specificity.

The five dimensions are: (1) Substance — is the required content genuinely present and credible; (2) Evidence — is it backed by real, specific, cited evidence rather than assertion; (3) SA Reality Fit — does it pass this checkpoint's SA thread with local specificity; (4) Rigour & Coherence — is it clear, internally consistent, structurally sound; (5) Investor Credibility — a test distinct from the first four: does the submission survive a skeptical investor's direct follow-up question, and does it show honest self-awareness of its own weaknesses or limitations rather than presenting only strengths? Do not award a high Investor Credibility score simply because the other four dimensions already scored well — a submission can be substantive, evidenced, locally-grounded, and coherent, and still lose credibility here by dodging the hard question this specific checkpoint would provoke, or by hiding a weakness a real investor would find in five minutes.

This checkpoint is: ${checkpoint.name} (Stage ${checkpoint.stage}). Its specific focus: ${checkpoint.focus}. Its SA Reality thread: ${checkpoint.saThread}. Venture type: ${ventureType} — apply type-specific calibration where relevant.

Be honestly hard. A high-quality founder may fail their first attempt — that is correct. Do not inflate scores. Cite specifics from the submission in your reasoning. For each dimension give one concrete, actionable improvement step.

Return ONLY a JSON object matching this schema, no preamble, no markdown, no commentary outside the JSON:
{
  "checkpoint_id": ${checkpoint.id},
  "dimensions": [
    { "dimension": "Substance", "score": 0, "band": "", "reasoning": "", "improvement_guidance": "" },
    { "dimension": "Evidence", "score": 0, "band": "", "reasoning": "", "improvement_guidance": "" },
    { "dimension": "SA Reality Fit", "score": 0, "band": "", "reasoning": "", "improvement_guidance": "" },
    { "dimension": "Rigour & Coherence", "score": 0, "band": "", "reasoning": "", "improvement_guidance": "" },
    { "dimension": "Investor Credibility", "score": 0, "band": "", "reasoning": "", "improvement_guidance": "" }
  ],
  "checkpoint_score": 0,
  "passed": false,
  "summary": "2-3 sentence honest overall verdict",
  "top_priority_fix": "the single most important thing to improve"
}`;
}

export function buildUserContent(
  checkpoint: Checkpoint,
  artifactContent: string,
  priorArtifacts: { checkpointId: number; name: string; content: string }[],
  hasImageAttachment = false,
): string {
  const priorSection = priorArtifacts.length
    ? priorArtifacts
        .map((p) => `--- Checkpoint ${p.checkpointId} (${p.name}) ---\n${p.content}`)
        .join("\n\n")
    : "None submitted yet.";

  const imageNote = hasImageAttachment
    ? "\n\nAn image file is attached directly to this message (screenshot, photo of a document, certificate, etc.) — examine it as primary evidence, don't just rely on the text below."
    : "";

  return `Checkpoint ${checkpoint.id} required artifact: ${checkpoint.artifactType}

FOUNDER SUBMISSION:
${artifactContent}${imageNote}

PRIOR CHECKPOINT ARTIFACTS (cross-check for gaming/consistency):
${priorSection}`;
}
