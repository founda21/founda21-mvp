export const FUNDER_TYPE_OPTIONS = [
  {
    value: "corporate_esd",
    label: "Corporate ESD programme",
    description: "A corporate enterprise & supplier development programme sourcing B-BBEE beneficiaries.",
  },
  {
    value: "esd_fund_manager",
    label: "ESD fund manager",
    description: "A fund manager deploying enterprise development capital on behalf of corporates.",
  },
  {
    value: "dfi_government",
    label: "DFI / government programme",
    description: "A development finance institution or government initiative tracking jobs and survival outcomes.",
  },
  {
    value: "university",
    label: "University",
    description: "A university programme, entrepreneurship centre, or student venture initiative.",
  },
  {
    value: "accelerator_incubator",
    label: "Accelerator / incubator",
    description: "A structured cohort programme or longer-term hands-on venture support programme.",
  },
  {
    value: "impact_investor_vc",
    label: "Impact investor / VC",
    description: "An investor screening and tracking founder readiness ahead of a funding decision.",
  },
] as const;

export function funderTypeLabel(value: string | null | undefined): string {
  return FUNDER_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? "Not specified";
}
