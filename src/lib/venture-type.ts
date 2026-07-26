// Display-only examples to help a founder pick the right category with
// confidence — the 3 underlying values (B2C/B2B/HARDWARE) are fixed and read
// directly by scoring/traction logic (§ src/lib/traction.ts,
// src/lib/checkpoints.ts TRACTION_MINIMUMS), never change these values.
export const VENTURE_TYPE_OPTIONS = [
  {
    value: "B2C",
    label: "B2C — selling to everyday consumers",
    description:
      "e.g. a consumer app or website, e-commerce store, subscription box, marketplace, consumer fintech (savings, lending, insurance), or an on-demand service like food delivery or ride-hailing.",
  },
  {
    value: "B2B",
    label: "B2B — selling to other businesses",
    description:
      "e.g. software (SaaS) for businesses, a B2B marketplace, wholesale or distribution, an agency or service business, logistics/supply-chain tooling, or fintech for businesses (payments, invoicing, payroll).",
  },
  {
    value: "HARDWARE",
    label: "Hardware — a physical product",
    description:
      "e.g. a manufactured device, IoT hardware, a hardware-plus-app combo, wearables, agri-tech equipment, or medical devices.",
  },
] as const;

export function ventureTypeLabel(value: string | null | undefined): string {
  return VENTURE_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? "Not specified";
}
