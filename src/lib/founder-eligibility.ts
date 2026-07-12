import type { AnnualTurnoverBand, EntityType, BeneficiaryClass } from "@/generated/prisma/enums";

export const ANNUAL_TURNOVER_BAND_OPTIONS = [
  { value: "pre_revenue", label: "Pre-revenue" },
  { value: "under_10m", label: "Under R10m" },
  { value: "ten_m_to_50m", label: "R10m – R50m" },
  { value: "over_50m", label: "Over R50m" },
] as const;

export function annualTurnoverBandLabel(value: string | null | undefined): string {
  return ANNUAL_TURNOVER_BAND_OPTIONS.find((o) => o.value === value)?.label ?? "—";
}

export const ENTITY_TYPE_OPTIONS = [
  { value: "not_yet_registered", label: "Not yet registered" },
  { value: "pty_ltd", label: "(Pty) Ltd" },
  { value: "other", label: "Other" },
] as const;

export function entityTypeLabel(value: string | null | undefined): string {
  return ENTITY_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? "—";
}

export type EligibilityDerived = {
  esdBeneficiaryEligible: boolean;
  beneficiaryClass: BeneficiaryClass;
  blackWomenOwned: boolean;
};

// Routing/reporting only (§ non-negotiable rule 1) — never read by the
// scoring engine. Single source of truth for the three derived fields so the
// logic isn't duplicated between the intake form and the M&E export.
export function computeEligibilityDerived(input: {
  blackOwnershipPct: number;
  blackWomenOwnershipPct: number;
  annualTurnoverBand: AnnualTurnoverBand;
}): EligibilityDerived {
  const majorityBlackOwned = input.blackOwnershipPct >= 51;
  const blackWomenOwned = input.blackWomenOwnershipPct >= 51;

  let beneficiaryClass: BeneficiaryClass = "n_a";
  if (majorityBlackOwned) {
    if (input.annualTurnoverBand === "pre_revenue" || input.annualTurnoverBand === "under_10m") {
      beneficiaryClass = "EME";
    } else if (input.annualTurnoverBand === "ten_m_to_50m") {
      beneficiaryClass = "QSE";
    } else {
      beneficiaryClass = "generic";
    }
  }

  const esdBeneficiaryEligible = beneficiaryClass === "EME" || beneficiaryClass === "QSE";

  return { esdBeneficiaryEligible, beneficiaryClass, blackWomenOwned };
}

export type EligibilityFields = {
  blackOwnershipPct: number;
  blackWomenOwnershipPct: number;
  annualTurnoverBand: AnnualTurnoverBand;
  cipcNumber: string | null;
  entityType: EntityType;
};

const VALID_TURNOVER_BANDS = new Set(ANNUAL_TURNOVER_BAND_OPTIONS.map((o) => o.value));
const VALID_ENTITY_TYPES = new Set(ENTITY_TYPE_OPTIONS.map((o) => o.value));

export function parseEligibilityForm(formData: FormData): EligibilityFields | { error: string } {
  const blackOwnershipPct = Number(formData.get("blackOwnershipPct"));
  const blackWomenOwnershipPct = Number(formData.get("blackWomenOwnershipPct"));
  const annualTurnoverBand = String(formData.get("annualTurnoverBand") ?? "");
  const cipcNumber = String(formData.get("cipcNumber") ?? "").trim();
  const entityType = String(formData.get("entityType") ?? "");

  if (
    !Number.isFinite(blackOwnershipPct) ||
    blackOwnershipPct < 0 ||
    blackOwnershipPct > 100 ||
    !Number.isFinite(blackWomenOwnershipPct) ||
    blackWomenOwnershipPct < 0 ||
    blackWomenOwnershipPct > 100
  ) {
    return { error: "Ownership percentages must be between 0 and 100." };
  }
  if (!VALID_TURNOVER_BANDS.has(annualTurnoverBand as AnnualTurnoverBand)) {
    return { error: "Select an annual turnover band." };
  }
  if (!VALID_ENTITY_TYPES.has(entityType as EntityType)) {
    return { error: "Select an entity type." };
  }

  return {
    blackOwnershipPct: Math.round(blackOwnershipPct),
    blackWomenOwnershipPct: Math.round(blackWomenOwnershipPct),
    annualTurnoverBand: annualTurnoverBand as AnnualTurnoverBand,
    cipcNumber: cipcNumber || null,
    entityType: entityType as EntityType,
  };
}
