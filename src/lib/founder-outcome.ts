import type { CapitalType } from "@/generated/prisma/enums";

export const CAPITAL_TYPE_OPTIONS = [
  { value: "equity", label: "Equity" },
  { value: "debt", label: "Debt" },
  { value: "grant", label: "Grant" },
  { value: "esd_grant", label: "ESD grant" },
  { value: "none", label: "None yet" },
] as const;

const VALID_CAPITAL_TYPES = new Set(CAPITAL_TYPE_OPTIONS.map((o) => o.value));

export type OutcomeIntakeFields = {
  capitalRaisedZar: number;
  capitalType: CapitalType[];
  monthlyRevenueZar: number;
  headcount: number;
  stillOperating: boolean;
  graduatedToSupplier: boolean;
};

// Captured once at intake (snapshotDate = signup time) and re-polled at
// T+6/T+12 later — never read by the scoring engine (§ non-negotiable rule 1).
export function parseOutcomeIntakeForm(formData: FormData): OutcomeIntakeFields | { error: string } {
  const capitalRaisedZar = Number(formData.get("capitalRaisedZar") ?? 0);
  const monthlyRevenueZar = Number(formData.get("monthlyRevenueZar") ?? 0);
  const headcount = Number(formData.get("headcount") ?? 0);
  const capitalType = formData
    .getAll("capitalType")
    .map(String)
    .filter((v): v is CapitalType => VALID_CAPITAL_TYPES.has(v as CapitalType));

  if (
    !Number.isFinite(capitalRaisedZar) ||
    capitalRaisedZar < 0 ||
    !Number.isFinite(monthlyRevenueZar) ||
    monthlyRevenueZar < 0 ||
    !Number.isFinite(headcount) ||
    headcount < 0
  ) {
    return { error: "Outcome figures must be zero or positive numbers." };
  }

  return {
    capitalRaisedZar: Math.round(capitalRaisedZar),
    capitalType,
    monthlyRevenueZar: Math.round(monthlyRevenueZar),
    headcount: Math.round(headcount),
    stillOperating: formData.get("stillOperating") === "yes",
    graduatedToSupplier: formData.get("graduatedToSupplier") === "yes",
  };
}
