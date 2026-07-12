import type { FunderType } from "@/generated/prisma/enums";

// Plain-language funding education — shown to founders before they sign up,
// and referenced from the "How it works" tab. Deliberately generic
// (how each funding type works, in general) rather than personalized advice
// ("you specifically should raise X") — founders decide for themselves, with
// their funder or mentor, which fits their venture.
export type FundingTypeId =
  | "grant"
  | "equity"
  | "loan"
  | "revenue_based"
  | "convertible_note"
  | "accelerator_program";

export type FundingTypeInfo = {
  id: FundingTypeId;
  name: string;
  oneLiner: string;
  howItWorks: string;
  goodFor: string;
  watchOutFor: string;
};

export const FUNDING_TYPES: FundingTypeInfo[] = [
  {
    id: "grant",
    name: "Grant / non-dilutive funding",
    oneLiner: "Money you don't pay back and don't give up ownership for.",
    howItWorks:
      "A funder (often a corporate, government programme, or DFI) gives you money to hit a specific goal — jobs created, a pilot completed, a product built. Usually comes with reporting requirements, not repayment.",
    goodFor: "Idea-to-early-traction stage ventures, or ventures serving a mission a funder cares about (job creation, B-BBEE development, a specific sector).",
    watchOutFor: "Grants are usually smaller and slower to access than equity, and often tied to specific milestones or reporting you must deliver on.",
  },
  {
    id: "equity",
    name: "Equity investment",
    oneLiner: "An investor gives you money in exchange for a % ownership of your company.",
    howItWorks:
      "You sell shares in your company. The investor makes money if your company grows in value; you get capital without a repayment schedule, but you give up some ownership and usually some say in decisions.",
    goodFor: "Ventures with real growth potential that need capital to scale, and are comfortable sharing ownership and decision-making.",
    watchOutFor: "You permanently give up a % of your company. Investors will expect a path to a future exit (acquisition, next funding round) and will ask hard questions about growth.",
  },
  {
    id: "loan",
    name: "Debt / loan",
    oneLiner: "Money you borrow and pay back, usually with interest.",
    howItWorks:
      "A lender (bank, DFI, fund manager) gives you capital that you repay over time with interest. Ownership of your company doesn't change.",
    goodFor: "Ventures with predictable revenue that can service a repayment schedule — e.g. buying stock/equipment, bridging working capital.",
    watchOutFor: "You must repay it regardless of whether the venture succeeds — this is real personal/business risk if cash flow is inconsistent.",
  },
  {
    id: "revenue_based",
    name: "Revenue-based financing",
    oneLiner: "You repay a fixed % of monthly revenue until a set multiple is paid back.",
    howItWorks:
      "A funder advances capital, then takes an agreed % of your monthly revenue as repayment until you've paid back an agreed multiple (e.g. 1.3x what you borrowed). Repayment scales with how well you're doing.",
    goodFor: "Ventures with real, recurring revenue but that don't want to give up equity or commit to a fixed loan repayment.",
    watchOutFor: "Less common in South Africa than grants/equity/loans — fewer funders offer it, and it still requires real, verifiable revenue.",
  },
  {
    id: "convertible_note",
    name: "Convertible note / SAFE",
    oneLiner: "A loan that turns into equity later, usually at your next funding round.",
    howItWorks:
      "An investor gives you capital now as debt, but instead of repaying in cash, it converts into shares later — usually at a discount — once you raise a priced equity round.",
    goodFor: "Early-stage ventures raising a small amount quickly, without agreeing on a company valuation yet.",
    watchOutFor: "It's still eventually equity — you're deferring the ownership conversation, not avoiding it.",
  },
  {
    id: "accelerator_program",
    name: "Accelerator / incubator programme funding",
    oneLiner: "Structured support (and sometimes a small amount of capital) in exchange for guidance, curriculum, and a network — sometimes a small equity stake.",
    howItWorks:
      "A programme gives you mentorship, structure, and sometimes a small grant or stipend to get through it. Some programmes take a small equity stake in exchange; many (especially DFI/donor-funded ones) don't.",
    goodFor: "Founders who need structure, accountability, and a network more than they need a large amount of capital right now.",
    watchOutFor: "Read the terms carefully — know upfront whether a programme takes equity, and how much, before you join.",
  },
];

export function getFundingType(id: FundingTypeId): FundingTypeInfo {
  const found = FUNDING_TYPES.find((f) => f.id === id);
  if (!found) throw new Error(`Unknown funding type: ${id}`);
  return found;
}

// What each funder type typically offers — informational only, a real
// funder's specific programme may differ. Helps a founder understand why a
// DFI conversation might sound different from a VC conversation.
export const FUNDER_TYPE_TYPICAL_FUNDING: Record<FunderType, FundingTypeId[]> = {
  corporate_esd: ["grant", "accelerator_program"],
  esd_fund_manager: ["grant", "loan", "revenue_based"],
  dfi_government: ["loan", "grant", "revenue_based"],
  university: ["grant", "accelerator_program"],
  accelerator_incubator: ["accelerator_program", "convertible_note"],
  impact_investor_vc: ["equity", "convertible_note"],
};
