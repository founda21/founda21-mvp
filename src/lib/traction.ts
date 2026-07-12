import { VentureType } from "@/generated/prisma/enums";
import { TRACTION_MINIMUMS } from "@/lib/checkpoints";

// Checkpoint 11 (Demonstrated Traction) is submitted as JSON inside
// Submission.artifactContent so Stage 2 gating can check type-specific
// traction minimums (§9) programmatically, alongside the free-text narrative.
export type TractionSubmission = {
  narrative: string;
  evidenceLink?: string;
  b2c?: { signups: number; mau: number };
  b2b?: { pilots: number; payingClients: number };
  hardware?: { unitsShipped?: number; notes?: string };
};

export function parseTractionSubmission(raw: string): TractionSubmission | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as TractionSubmission;
  } catch {
    // Not JSON — treat as no structured traction data.
  }
  return null;
}

export type TractionStatus = {
  met: boolean;
  detail: string;
};

export function meetsTractionMinimums(
  ventureType: VentureType,
  data: TractionSubmission | null,
): TractionStatus {
  if (ventureType === "B2C") {
    const minimums = TRACTION_MINIMUMS.B2C;
    const signups = data?.b2c?.signups ?? 0;
    const mau = data?.b2c?.mau ?? 0;
    return {
      met: signups >= minimums.signups && mau >= minimums.mau,
      detail: `${signups}/${minimums.signups} signups, ${mau}/${minimums.mau} MAU`,
    };
  }

  if (ventureType === "B2B") {
    const minimums = TRACTION_MINIMUMS.B2B;
    const pilots = data?.b2b?.pilots ?? 0;
    const payingClients = data?.b2b?.payingClients ?? 0;
    return {
      met: pilots >= minimums.pilotsMin || payingClients >= minimums.payingClientsMin,
      detail: `${pilots} pilots (need ${minimums.pilotsMin}–${minimums.pilotsMax}) or ${payingClients} paying clients (need ${minimums.payingClientsMin}–${minimums.payingClientsMax})`,
    };
  }

  // Hardware minimums are not specified in the build spec (§9 flags this as
  // "confirm against framework doc"). Until confirmed, don't block Hardware
  // ventures on traction.
  return { met: true, detail: "Hardware traction minimums not yet specified in the framework — not enforced." };
}
