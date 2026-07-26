export function ventureStageLabel(value: string | null | undefined): string {
  return VENTURE_STAGE_OPTIONS.find((o) => o.value === value)?.label ?? "Not specified";
}

const VENTURE_STAGE_RANK: Record<string, number> = {
  IDEA: 0,
  PRE_SEED: 1,
  SEED: 2,
  SERIES_A_PLUS: 3,
};

// Founders who joined before venture stage existed have no value recorded —
// treat that as unranked (no additional gating) rather than defaulting to
// the most restrictive tier, so pre-existing accounts aren't retroactively
// locked out of checkpoints they may have already passed.
export function ventureStageRank(value: string | null | undefined): number | null {
  if (!value) return null;
  return VENTURE_STAGE_RANK[value] ?? null;
}

export const VENTURE_STAGE_OPTIONS = [
  {
    value: "IDEA",
    label: "Idea stage",
    description:
      "You have a problem and a hypothesis, but haven't built or tested a solution with real users yet.",
  },
  {
    value: "PRE_SEED",
    label: "Pre-seed",
    description:
      "You have an early prototype or MVP and some initial user feedback, but little or no funding raised yet.",
  },
  {
    value: "SEED",
    label: "Seed",
    description:
      "You have real traction, paying customers or meaningful usage, and are raising or have raised a seed round.",
  },
  {
    value: "SERIES_A_PLUS",
    label: "Series A or later",
    description:
      "You have significant revenue or scale and want to formalize investor-readiness ahead of a later round.",
  },
] as const;
