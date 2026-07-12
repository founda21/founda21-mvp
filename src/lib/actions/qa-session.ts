"use server";

import { requireFounder } from "@/lib/auth";
import { canAccessCheckpoint } from "@/lib/stage-gating";
import { getPriorArtifacts, scoreAndSaveSubmission, nextAttemptNumber } from "@/lib/submission-core";
import { callGeminiText } from "@/lib/scoring/gemini";
import {
  buildInterviewerSystemPrompt,
  buildInterviewerUserContent,
  type QATurn,
} from "@/lib/scoring/interviewer-prompt";

const CP21 = 21;

export async function getNextInvestorQuestion(turnsSoFar: QATurn[]): Promise<string> {
  const { founder } = await requireFounder();
  if (!canAccessCheckpoint(founder, CP21)) {
    throw new Error("Checkpoint 21 isn't unlocked yet.");
  }

  const priorArtifacts = await getPriorArtifacts(founder.id, CP21);
  const systemPrompt = buildInterviewerSystemPrompt(founder.ventureType);
  const userContent = buildInterviewerUserContent(priorArtifacts, turnsSoFar);

  return callGeminiText(systemPrompt, userContent);
}

export async function finalizeQASession(
  turns: QATurn[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { founder } = await requireFounder();
  if (!canAccessCheckpoint(founder, CP21)) {
    return { ok: false, error: "Checkpoint 21 isn't unlocked yet." };
  }

  const artifactContent = JSON.stringify({ turns });
  const attemptNumber = await nextAttemptNumber(founder.id, CP21);

  const result = await scoreAndSaveSubmission(
    founder.id,
    founder.ventureType,
    CP21,
    artifactContent,
    attemptNumber,
  );

  return result;
}
