import type { FunderType } from "@/generated/prisma/enums";

export type StageGuidance = {
  recommendedStage: 1 | 2 | 3;
  founderProfile: string;
  rationale: string;
};

// Educates a funder on which stage to require when creating a cohort
// (§ Cohort.intendedEntryStage), tailored to what their funder type actually
// needs from a founder. Purely informational copy, never enforced, the
// funder can still pick any stage on the cohort form.
export const FUNDER_STAGE_GUIDANCE: Record<FunderType, StageGuidance> = {
  university: {
    recommendedStage: 1,
    founderProfile: "Students, recent graduates, or early-stage incubated founders still validating an idea.",
    rationale:
      "Most university-affiliated founders are still testing a concept, not running a company yet. Requiring Stage 1 (Idea & Reality) screens for a clear problem, customer, and solution hypothesis without filtering out founders who haven't incorporated or have no traction yet.",
  },
  accelerator_incubator: {
    recommendedStage: 2,
    founderProfile: "Founders in a structured cohort programme who usually already have a validated idea and some early traction.",
    rationale:
      "Accelerator and incubator applicants have typically cleared the idea stage already. Requiring Stage 2 (Company & Traction) filters for a real legal entity, some traction, and a team, the substance a programme actually needs to evaluate before investing coaching time.",
  },
  corporate_esd: {
    recommendedStage: 2,
    founderProfile: "Operating small businesses seeking supplier development support, not pre-idea founders.",
    rationale:
      "Enterprise & supplier development programmes exist to develop already-operating small businesses into suppliers. Stage 2 (Company & Traction) confirms a real, registered, trading business before your programme commits resources.",
  },
  esd_fund_manager: {
    recommendedStage: 2,
    founderProfile: "Businesses being considered for enterprise development capital, usually already operating.",
    rationale:
      "As a fund manager deploying ESD capital on behalf of corporates, Stage 2 (Company & Traction) is a reasonable default. If your specific mandate is earlier-stage (grant or incubation-style support) or later-stage (investment-ready businesses), adjust down to Stage 1 or up to Stage 3 to match.",
  },
  dfi_government: {
    recommendedStage: 3,
    founderProfile: "Ventures being considered for a funding decision, loan, or formal government programme.",
    rationale:
      "DFIs and government funding programmes typically need investor- and deal-ready ventures: financial projections, governance, and a data room. Stage 3 (Investor & Deal Readiness) is the appropriate bar before capital or a formal offer is on the table.",
  },
  impact_investor_vc: {
    recommendedStage: 3,
    founderProfile: "Ventures being screened ahead of an actual investment decision.",
    rationale:
      "Investors need to see a full data room, cap table, financial model, and a founder who can hold up under direct questioning. Stage 3 (Investor & Deal Readiness) is the standard before a term sheet conversation.",
  },
};
