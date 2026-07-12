// Structured-proof checkpoints (§ getProofMode) are submitted as JSON inside
// Submission.artifactContent, mirroring the CP11 traction pattern — this
// keeps the raw data parseable for resubmission pre-fill, while Gemini reads
// the JSON directly just as well as prose (already proven by CP21's Q&A
// transcript, which is submitted the same way).

export type RecordingProof = { recordingLink: string; statement: string };
export type OnlinePresenceProof = { website: string; social: string; trustSignals: string };
export type TeamMember = { name: string; role: string; linkedin: string };
export type TeamProof = { members: TeamMember[]; gaps: string };
export type UnitEconomicsProof = {
  cac: number;
  ltv: number;
  grossMarginPct: number;
  contributionMarginPct: number;
  methodology: string;
};
export type Milestone = { title: string; date: string; owner: string };
export type RoadmapProof = { milestones: Milestone[] };
export type DataRoomProof = { dataRoomLink: string; narrative: string };

export type StructuredProof =
  | { checkpointId: 7; data: RecordingProof }
  | { checkpointId: 10; data: OnlinePresenceProof }
  | { checkpointId: 12; data: TeamProof }
  | { checkpointId: 14; data: UnitEconomicsProof }
  | { checkpointId: 18; data: RoadmapProof }
  | { checkpointId: 20; data: DataRoomProof };

export function parseStructuredProof<T>(raw: string | undefined): T | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as T;
  } catch {
    // Not JSON — no prior structured data (e.g. first attempt).
  }
  return null;
}
