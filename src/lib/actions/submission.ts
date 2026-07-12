"use server";

import { redirect } from "next/navigation";
import { requireFounder } from "@/lib/auth";
import { canAccessCheckpoint } from "@/lib/stage-gating";
import { getProofMode } from "@/lib/checkpoints";
import { extractFile, validateUploadedFile } from "@/lib/file-extract";
import { uploadArtifactFile } from "@/lib/artifact-storage";
import { scoreAndSaveSubmission, nextAttemptNumber } from "@/lib/submission-core";
import type { ImageAttachment } from "@/lib/scoring/gemini";
import type { TractionSubmission } from "@/lib/traction";

const TRACTION_CHECKPOINT_ID = 11;

type ArtifactBuildResult =
  | { ok: true; narrative: string; imageAttachment?: ImageAttachment }
  | { ok: false; error: string };

function parseJsonArray(raw: FormDataEntryValue | null): unknown[] {
  if (typeof raw !== "string") return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Client-side <input type="number" min={0}> isn't a security boundary — a
// direct form POST can send anything. Treat NaN/negative/non-finite as 0
// rather than letting garbage values (or a negative CAC/margin) reach the
// scorer and stage-gating traction-minimum checks.
function parseNonNegativeNumber(raw: FormDataEntryValue | null): number {
  const value = Number(raw ?? 0);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

// Structured-proof checkpoints (§ getProofMode) each have their own fixed
// field set instead of one free-text box — any supplementary text/link/file
// evidence collected via the shared toolbar rides along in `supportingEvidence`.
function buildStructuredPayload(checkpointId: number, formData: FormData, supportingEvidence: string): unknown {
  switch (checkpointId) {
    case 7:
      return {
        recordingLink: String(formData.get("recordingLink") ?? "").trim(),
        statement: String(formData.get("statement") ?? "").trim(),
        supportingEvidence: supportingEvidence || undefined,
      };
    case 10:
      return {
        website: String(formData.get("website") ?? "").trim(),
        social: String(formData.get("social") ?? "").trim(),
        trustSignals: String(formData.get("trustSignals") ?? "").trim(),
        supportingEvidence: supportingEvidence || undefined,
      };
    case 12:
      return {
        members: parseJsonArray(formData.get("teamJson")),
        gaps: String(formData.get("teamGaps") ?? "").trim(),
        supportingEvidence: supportingEvidence || undefined,
      };
    case 14:
      return {
        cac: parseNonNegativeNumber(formData.get("cac")),
        ltv: parseNonNegativeNumber(formData.get("ltv")),
        grossMarginPct: parseNonNegativeNumber(formData.get("grossMarginPct")),
        contributionMarginPct: parseNonNegativeNumber(formData.get("contributionMarginPct")),
        methodology: String(formData.get("methodology") ?? "").trim(),
        supportingEvidence: supportingEvidence || undefined,
      };
    case 18:
      return {
        milestones: parseJsonArray(formData.get("milestonesJson")),
        supportingEvidence: supportingEvidence || undefined,
      };
    case 20:
      return {
        dataRoomLink: String(formData.get("dataRoomLink") ?? "").trim(),
        narrative: String(formData.get("dataRoomNarrative") ?? "").trim(),
        supportingEvidence: supportingEvidence || undefined,
      };
    default:
      return { supportingEvidence };
  }
}

async function buildArtifactContent(
  checkpointId: number,
  ventureType: string,
  formData: FormData,
  founderId: string,
  attemptNumber: number,
): Promise<ArtifactBuildResult> {
  let narrative = String(formData.get("narrative") ?? "").trim();
  let imageAttachment: ImageAttachment | undefined;

  const linkUrl = String(formData.get("linkUrl") ?? "").trim();
  if (linkUrl) {
    const prefix = `[Link: ${linkUrl}]\n\n`;
    narrative = narrative ? `${prefix}${narrative}` : prefix.trim();
  }

  const file = formData.get("artifactFile");
  const hasFile = file instanceof File && file.size > 0;
  if (hasFile) {
    const validation = validateUploadedFile(file as File);
    if (!validation.ok) {
      return { ok: false, error: validation.error };
    }

    const extracted = await extractFile(file as File);
    const storagePath = await uploadArtifactFile(founderId, checkpointId, attemptNumber, file as File);

    if (extracted.kind === "image") {
      imageAttachment = { mimeType: extracted.mimeType, base64: extracted.base64 };
      const prefix = `[Uploaded image: ${(file as File).name}, stored at ${storagePath}]\n\n`;
      narrative = narrative ? `${prefix}${narrative}` : prefix.trim();
    } else {
      const prefix = `[Uploaded file: ${(file as File).name}, stored at ${storagePath}]\n\n`;
      narrative = narrative
        ? `${prefix}${extracted.text}\n\n---\n\n${narrative}`
        : `${prefix}${extracted.text}`;
    }
  }

  const proofMode = getProofMode(checkpointId);
  if (proofMode === "file-required" && !hasFile) {
    return {
      ok: false,
      error: "This checkpoint requires an uploaded document — use the Upload file button, a written description alone won't pass.",
    };
  }

  if (checkpointId === TRACTION_CHECKPOINT_ID) {
    const evidenceLink = String(formData.get("evidenceLink") ?? "").trim();
    // System integrity fix 3.1 — artifact-first evidence. Traction claims
    // (signups/MAU, pilots/paying clients, units shipped) are exactly the
    // kind of thing that can and should be backed by a verifiable
    // link/document (analytics dashboard, LOI, invoice, payment processor
    // stats) rather than prose alone — this was previously optional.
    if (!evidenceLink) {
      return {
        ok: false,
        error: "Traction claims need a verifiable evidence link (analytics dashboard, LOI, invoice, payment processor stats, etc.) — a narrative alone won't pass.",
      };
    }
    const traction: TractionSubmission = {
      narrative,
      evidenceLink,
    };
    if (ventureType === "B2C") {
      traction.b2c = {
        signups: parseNonNegativeNumber(formData.get("signups")),
        mau: parseNonNegativeNumber(formData.get("mau")),
      };
    } else if (ventureType === "B2B") {
      traction.b2b = {
        pilots: parseNonNegativeNumber(formData.get("pilots")),
        payingClients: parseNonNegativeNumber(formData.get("payingClients")),
      };
    } else {
      traction.hardware = {
        unitsShipped: parseNonNegativeNumber(formData.get("unitsShipped")),
        notes: String(formData.get("hardwareNotes") ?? "").trim(),
      };
    }
    return { ok: true, narrative: JSON.stringify(traction), imageAttachment };
  }

  if (proofMode === "structured") {
    const payload = buildStructuredPayload(checkpointId, formData, narrative);
    return { ok: true, narrative: JSON.stringify(payload), imageAttachment };
  }

  return { ok: true, narrative, imageAttachment };
}

export async function submitArtifact(checkpointId: number, formData: FormData) {
  const { founder } = await requireFounder();

  if (!canAccessCheckpoint(founder, checkpointId)) {
    redirect(`/founder/checkpoint/${checkpointId}?error=${encodeURIComponent("This checkpoint isn't unlocked yet.")}`);
  }

  const attemptNumber = await nextAttemptNumber(founder.id, checkpointId);

  let built: ArtifactBuildResult;
  try {
    built = await buildArtifactContent(checkpointId, founder.ventureType, formData, founder.id, attemptNumber);
  } catch (error) {
    redirect(
      `/founder/checkpoint/${checkpointId}?error=${encodeURIComponent(
        `Couldn't read the uploaded file: ${error instanceof Error ? error.message : "unknown error"}.`,
      )}`,
    );
  }

  if (!built.ok) {
    redirect(`/founder/checkpoint/${checkpointId}?error=${encodeURIComponent(built.error)}`);
  }

  if (!built.narrative.trim()) {
    redirect(`/founder/checkpoint/${checkpointId}?error=${encodeURIComponent("Submission can't be empty — paste content, add a link, or upload a file.")}`);
  }

  const result = await scoreAndSaveSubmission(
    founder.id,
    founder.ventureType,
    checkpointId,
    built.narrative,
    attemptNumber,
    built.imageAttachment,
  );
  if (!result.ok) {
    redirect(`/founder/checkpoint/${checkpointId}?error=${encodeURIComponent(result.error)}`);
  }

  redirect(`/founder/checkpoint/${checkpointId}?submitted=1`);
}
