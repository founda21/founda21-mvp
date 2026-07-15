import type { DIMENSION_NAMES } from "@/lib/scoring/schema";

export type Stage = 1 | 2 | 3;

// How a checkpoint's submission form behaves:
// - "narrative": free-text written response (still gameable, but these are
//   conceptual/reasoning checkpoints where there's no external artifact to
//   verify against — e.g. scalability logic, moat & risk framing).
// - "structured": dedicated fields for verifiable proof (links, numbers,
//   named people) instead of prose, so a founder can't just write around it.
// - "file-required": the checkpoint's artifact is inherently a document
//   (registration certs, compliance evidence, a financial model, a deck) —
//   an actual file upload is enforced, narrative text alone won't pass.
export type ProofMode = "narrative" | "structured" | "file-required";

const STRUCTURED_CHECKPOINTS = new Set([7, 10, 12, 14, 18, 20]);
const FILE_REQUIRED_CHECKPOINTS = new Set([8, 13, 15, 19]);

export function getProofMode(checkpointId: number): ProofMode {
  if (STRUCTURED_CHECKPOINTS.has(checkpointId)) return "structured";
  if (FILE_REQUIRED_CHECKPOINTS.has(checkpointId)) return "file-required";
  return "narrative";
}

// Each Founda21 stage requires a minimum venture stage to attempt — an
// idea-stage founder genuinely can't produce real traction data (Stage 2) or
// a data room (Stage 3), so gating follows the founder's own self-reported
// venture stage on top of the sequential stage-completion gate.
export const STAGE_MIN_VENTURE_STAGE: Record<Stage, string> = {
  1: "IDEA",
  2: "PRE_SEED",
  3: "SEED",
};

// One entry per scored dimension (§ scoring/schema.ts DIMENSION_NAMES), each
// worth 20 of the checkpoint's 100 points — this is display-only, read by the
// founder submission page and funder-facing checkpoint views, and is NOT fed
// into the AI prompt (prompt.ts only reads name/stage/focus/saThread —
// verified directly). Restating the real, uniform 20-point-per-dimension
// weighting concretely per checkpoint, rather than inventing a fake
// per-clause point split that doesn't match how scoring actually works.
export type ScoringBreakdownItem = {
  dimension: (typeof DIMENSION_NAMES)[number];
  points: 20;
  expectation: string;
};

export type Checkpoint = {
  id: number;
  stage: Stage;
  name: string;
  focus: string;
  saThread: string;
  artifactType: string;
  requirement: string;
  scoringBreakdown: ScoringBreakdownItem[];
  passThreshold: number;
};

// The 21 is fixed per the Founda21 framework — not editable at runtime.
// Confirm exact wording/artifact requirements against the framework doc
// before relying on `focus` / `saThread` copy in production scoring.
export const CHECKPOINTS: Checkpoint[] = [
  // Stage 1 — Idea & Reality (60 threshold)
  {
    id: 1,
    stage: 1,
    name: "Problem Definition",
    focus: "Plain-language problem statement backed by documented evidence and customer voice.",
    saThread: "Evidence and customer voice specifically South African — local sources (Stats SA, local reports, SA media) and quotes from real South African customers, not global-only proxies.",
    artifactType: "Problem-evidence document (plain-language problem + ≥10 documented sources + customer voice)",
    requirement:
      "Write a plain-language description of the problem you're solving — no jargon, no buzzwords, nothing an investor would need to Google. Back it with at least 10 documented sources: articles, reports, credible data — and make sure a good number of them are South African-specific (Stats SA, local news, local reports), not just global statistics. Then include real customer voice: direct quotes, interview notes, or verbatim feedback from actual South African people who live this problem, not a hypothetical persona. Keep it all consistent — your sources, your customer quotes, and your own description should be telling the same story.",
    scoringBreakdown: [
      { dimension: "Substance", points: 20, expectation: "A plain-language problem statement — no jargon, no buzzwords." },
      { dimension: "Evidence", points: 20, expectation: "At least 10 documented sources (articles, reports, data) backing the problem." },
      { dimension: "SA Reality Fit", points: 20, expectation: "Sources and customer voice specifically South African — local data and SA customers, not global proxies." },
      { dimension: "Rigour & Coherence", points: 20, expectation: "The problem is stated clearly and holds together as one coherent argument." },
      { dimension: "Investor Credibility", points: 20, expectation: "An investor reading this would believe the problem is real and worth solving." },
    ],
    passThreshold: 60,
  },
  {
    id: 2,
    stage: 1,
    name: "Customer Definition",
    focus: "Who the customer is, with specificity.",
    saThread: "Data cost & device class; township & income realities.",
    artifactType: "Customer profile document",
    requirement:
      "Define exactly who your customer is — demographics, behaviour, income band, and where they live — specific enough that a stranger could picture this exact person, not a vague 'young South Africans' composite. Address how data cost and device access (feature phone vs. smartphone) shape how this customer can actually use your product, and be honest about township and income realities where they apply. The more specific and consistent this profile is, the more it reads as a real, reachable customer rather than a guess.",
    scoringBreakdown: [
      { dimension: "Substance", points: 20, expectation: "Exactly who the customer is — demographics, behaviour, income band, location." },
      { dimension: "Evidence", points: 20, expectation: "Specific enough that a stranger could recognise this person in real life." },
      { dimension: "SA Reality Fit", points: 20, expectation: "Data cost sensitivity and device class, township/income realities addressed." },
      { dimension: "Rigour & Coherence", points: 20, expectation: "The profile is internally consistent, not a vague composite." },
      { dimension: "Investor Credibility", points: 20, expectation: "This is a customer a local investor would recognise as real and reachable." },
    ],
    passThreshold: 60,
  },
  {
    id: 3,
    stage: 1,
    name: "Market Sizing (Africa-calibrated)",
    focus: "TAM/SAM/SOM sized with Africa-calibrated assumptions.",
    saThread: "Township & income realities.",
    artifactType: "TAM/SAM/SOM document with cited sources",
    requirement:
      "Build a TAM/SAM/SOM estimate using assumptions calibrated to Africa/South Africa — not US or European benchmarks that don't hold here. Show your maths openly instead of just stating a final number, and cite where your figures come from. Your SOM — the slice you can realistically capture — needs to be justified against real local income levels and township realities, not inflated to sound impressive. TAM, SAM, and SOM should nest logically inside each other.",
    scoringBreakdown: [
      { dimension: "Substance", points: 20, expectation: "A TAM/SAM/SOM estimate using Africa-calibrated assumptions." },
      { dimension: "Evidence", points: 20, expectation: "Maths shown, sources cited — not top-down guesses." },
      { dimension: "SA Reality Fit", points: 20, expectation: "SOM justified against real local income levels and township realities." },
      { dimension: "Rigour & Coherence", points: 20, expectation: "TAM/SAM/SOM logically nest inside one another." },
      { dimension: "Investor Credibility", points: 20, expectation: "The SOM is achievable, not inflated to look impressive." },
    ],
    passThreshold: 60,
  },
  {
    id: 4,
    stage: 1,
    name: "Solution Hypothesis",
    focus: "The proposed solution and why it addresses the defined problem.",
    saThread: "Load-shedding & infrastructure; data cost & device class.",
    artifactType: "Solution hypothesis document",
    requirement:
      "Describe your proposed solution and explain, step by step, why it actually solves the problem you defined in CP1 — not just that it sounds related. Be explicit about how it holds up under real South African constraints where they apply: load-shedding and infrastructure gaps, data cost, and device limitations. The connection from problem to solution should be traceable, not asserted, and the solution should read as genuinely differentiated rather than a generic idea.",
    scoringBreakdown: [
      { dimension: "Substance", points: 20, expectation: "A clearly described proposed solution." },
      { dimension: "Evidence", points: 20, expectation: "Step-by-step reasoning for why it addresses the CP1 problem, not just that it sounds related." },
      { dimension: "SA Reality Fit", points: 20, expectation: "Holds up under load-shedding/infrastructure gaps and data cost/device constraints." },
      { dimension: "Rigour & Coherence", points: 20, expectation: "The logic connecting problem to solution is explicit and traceable." },
      { dimension: "Investor Credibility", points: 20, expectation: "The solution reads as genuinely differentiated, not generic." },
    ],
    passThreshold: 60,
  },
  {
    id: 5,
    stage: 1,
    name: "Solution Evidence",
    focus: "Tangible proof the CP4 solution actually exists in some form — not just a description on paper.",
    saThread: "The evidence reflects real South African conditions — the devices, data constraints, and infrastructure your actual target customer has — not a demo that only works under ideal conditions.",
    artifactType: "Product evidence (live product link, screenshots, or wireframes/mockups)",
    requirement:
      "Show that the solution you described in CP4 exists in some tangible form — whatever you genuinely have right now. That could be a live product link, screenshots of a working prototype, or wireframes/mockups if you haven't built anything yet — there's no minimum bar of polish, just real evidence over a description of intent. Whatever you submit needs to reflect real South African conditions: how it actually looks and works on the device, data plan, and connectivity your real target customer has, not a demo shown only under ideal conditions. A solution that's only ever been described, never shown, won't pass.",
    scoringBreakdown: [
      { dimension: "Substance", points: 20, expectation: "Tangible evidence the CP4 solution exists — a live link, screenshots, or wireframes/mockups." },
      { dimension: "Evidence", points: 20, expectation: "What's submitted is genuine proof, not a description of what will eventually be built." },
      { dimension: "SA Reality Fit", points: 20, expectation: "Reflects real South African conditions — actual devices, data constraints, infrastructure — not an idealised demo." },
      { dimension: "Rigour & Coherence", points: 20, expectation: "Consistent with what's claimed in CP4 — the same solution, not a different one." },
      { dimension: "Investor Credibility", points: 20, expectation: "This reads as something that genuinely exists, not vaporware." },
    ],
    passThreshold: 60,
  },
  {
    id: 6,
    stage: 1,
    name: "Scalability Logic",
    focus: "How the venture grows beyond its initial market — whichever growth path actually fits this venture, not necessarily pan-African expansion.",
    saThread: "Real South African growth constraints (infrastructure, logistics, regulation) wherever the chosen path runs through South Africa.",
    artifactType: "Scalability logic document",
    requirement:
      "Explain concretely how this venture grows beyond its first market. That could mean deeper penetration within South Africa (more provinces, cities, or customer segments), expansion into other African markets, or international expansion — choose whichever path is genuinely right for this venture, not the most impressive-sounding one. Explain what changes and what stays the same as you grow, and name the real barriers to that specific path: regulatory, logistical, cultural, or infrastructural. This should survive a skeptical follow-up question about why this path, and not a flashier one.",
    scoringBreakdown: [
      { dimension: "Substance", points: 20, expectation: "A concrete growth path beyond the first market — regional, national, continental, or international, whichever genuinely fits this venture." },
      { dimension: "Evidence", points: 20, expectation: "Specifics on what changes and what stays the same as the venture grows into that path." },
      { dimension: "SA Reality Fit", points: 20, expectation: "Real barriers named for the chosen path — regulatory, logistical, cultural, infrastructural." },
      { dimension: "Rigour & Coherence", points: 20, expectation: "The growth logic follows from the current venture and its actual constraints, not a generic claim." },
      { dimension: "Investor Credibility", points: 20, expectation: "The growth story survives a skeptical follow-up question about why this path, not a more ambitious-sounding one." },
    ],
    passThreshold: 60,
  },
  {
    id: 7,
    stage: 1,
    name: "Founder–Problem Fit",
    focus: "Tests the founder directly, not just documents produced.",
    saThread: "The founder's insight or background is rooted in lived South African experience relevant to this specific problem, not an imported or abstracted narrative.",
    artifactType: "Short founder recording + written statement",
    requirement:
      "This checkpoint is about you, not your paperwork. Record a short video or voice statement plus a written statement explaining why you personally are positioned to solve this problem — your background, lived experience, or unique insight into it. Make the connection between your own story and this specific problem explicit and rooted in real, lived South African experience, not an abstract or imported narrative — that's what makes you credible as the person solving this.",
    scoringBreakdown: [
      { dimension: "Substance", points: 20, expectation: "A short recording plus written statement about the founder personally." },
      { dimension: "Evidence", points: 20, expectation: "Background, lived experience, or unique insight specific to this founder." },
      { dimension: "SA Reality Fit", points: 20, expectation: "Insight rooted in real, lived South African experience relevant to this problem — not an abstract or imported claim." },
      { dimension: "Rigour & Coherence", points: 20, expectation: "The founder's story and the venture's problem are genuinely connected." },
      { dimension: "Investor Credibility", points: 20, expectation: "This founder, specifically, is credible to be the one solving this." },
    ],
    passThreshold: 60,
  },

  // Stage 2 — Company & Traction (60 threshold, type-specific traction minimums)
  {
    id: 8,
    stage: 2,
    name: "Legal Entity & Founder Agreements",
    focus: "CIPC registration, beneficial ownership, founder agreements, IP assignment.",
    saThread: "Regulatory (POPIA/FSCA/B-BBEE/CIPC).",
    artifactType: "Registration + agreement docs",
    requirement:
      "Provide evidence of CIPC registration, your beneficial ownership structure, signed founder agreements, and IP assignment documentation. These need to be real, dated records — not a description of your intent to file them, and not a promise to sort it out later. Everything here should be internally consistent (ownership structure matches the agreements matches the IP assignment), structured correctly under South African company law, and clean enough to survive real due diligence.",
    scoringBreakdown: [
      { dimension: "Substance", points: 20, expectation: "CIPC registration, beneficial ownership, founder agreements, IP assignment." },
      { dimension: "Evidence", points: 20, expectation: "Real, dated records — not a description of intent to file them." },
      { dimension: "SA Reality Fit", points: 20, expectation: "Structured correctly under South African company law/registration norms." },
      { dimension: "Rigour & Coherence", points: 20, expectation: "Ownership and agreements are internally consistent with each other." },
      { dimension: "Investor Credibility", points: 20, expectation: "The legal foundation is clean enough to survive due diligence." },
    ],
    passThreshold: 60,
  },
  {
    id: 9,
    stage: 2,
    name: "Brand & Positioning",
    focus: "Name, identity, positioning, defensibility.",
    saThread: "Positioning and defensibility calibrated to the real South African competitive landscape and how local customers actually perceive brands, not a positioning template copied from a global market.",
    artifactType: "Positioning document",
    requirement:
      "Document your venture's name, identity, and market positioning, and explain what specifically makes that positioning defensible against a copycat — not just what your brand looks like. Your positioning should make sense for the real South African competitive landscape and how local customers actually perceive brands here, not a template copied from a global market. Give a real reason this brand wins, not just cosmetics.",
    scoringBreakdown: [
      { dimension: "Substance", points: 20, expectation: "Venture name, identity, and market positioning documented." },
      { dimension: "Evidence", points: 20, expectation: "A clear explanation of what makes the positioning defensible against a copycat." },
      { dimension: "SA Reality Fit", points: 20, expectation: "Positioning makes sense for the real South African competitive landscape and how local customers perceive brands." },
      { dimension: "Rigour & Coherence", points: 20, expectation: "Name, identity, and positioning are consistent with each other." },
      { dimension: "Investor Credibility", points: 20, expectation: "The positioning gives a real reason this brand wins, not just cosmetics." },
    ],
    passThreshold: 60,
  },
  {
    id: 10,
    stage: 2,
    name: "Online Presence & Trust Signals",
    focus: "Website, social proof, verifiable presence.",
    saThread: "Trust signals and channels match how South African customers actually discover and vet a business — e.g. WhatsApp Business, Facebook/Google reviews, local marketplaces — not channels calibrated to a US/European audience.",
    artifactType: "Links + evidence",
    requirement:
      "Provide links to your live website, social channels, and any verifiable trust signals — reviews, press, testimonials. These need to be real, checkable URLs pasted as links, not screenshots or descriptions of plans. Make sure your presence matches how South African customers actually discover and vet a business — WhatsApp Business, Facebook/Google reviews, local marketplaces — not a presence built for a US or European audience. Everything should be live and consistent with your stated brand.",
    scoringBreakdown: [
      { dimension: "Substance", points: 20, expectation: "Live website, social channels, and trust signals." },
      { dimension: "Evidence", points: 20, expectation: "Real, checkable URLs — links, not screenshots or descriptions." },
      { dimension: "SA Reality Fit", points: 20, expectation: "Presence and trust signals match how South African customers actually discover and vet a business (e.g. WhatsApp Business, local reviews) — not a US/European-calibrated presence." },
      { dimension: "Rigour & Coherence", points: 20, expectation: "All links are live and consistent with the stated brand." },
      { dimension: "Investor Credibility", points: 20, expectation: "The online presence reads as a real, operating business." },
    ],
    passThreshold: 60,
  },
  {
    id: 11,
    stage: 2,
    name: "Demonstrated Traction (type-specific)",
    focus: "B2C: signups + MAU. B2B: pilots/paying customers. Hardware: confirm against framework doc.",
    saThread: "Township & income realities.",
    artifactType: "Traction data / verifiable evidence",
    requirement:
      "Report your real traction numbers for your venture type: B2C needs total signups and monthly active users (MAU); B2B needs pilots and paying clients; Hardware needs units shipped/deployed. Back every number with a written narrative explaining exactly how it was measured and where the evidence lives — an investor should be able to verify it, not just trust it. Contextualise the numbers against local income/township realities where relevant, and make sure the numbers and narrative match with no unexplained gaps. Vanity metrics won't pass — this needs to be real, verifiable traction.",
    scoringBreakdown: [
      { dimension: "Substance", points: 20, expectation: "Real traction numbers for your venture type (signups/MAU, pilots/paying clients, or units shipped)." },
      { dimension: "Evidence", points: 20, expectation: "A written narrative explaining how each number was measured and where the evidence lives." },
      { dimension: "SA Reality Fit", points: 20, expectation: "Traction contextualised against local income/township realities where relevant." },
      { dimension: "Rigour & Coherence", points: 20, expectation: "The numbers and the narrative match — no unexplained gaps." },
      { dimension: "Investor Credibility", points: 20, expectation: "Traction is real and verifiable, not vanity metrics." },
    ],
    passThreshold: 60,
  },
  {
    id: 12,
    stage: 2,
    name: "Team Architecture",
    focus: "Roles, gaps, complementary skills, advisory.",
    saThread: "Team structure is realistic given the resourcing, salary, and skills-availability constraints of an early-stage South African venture, not a team assembled as if funded like a Silicon Valley startup.",
    artifactType: "Team document",
    requirement:
      "Document your team's roles, the gaps you still have, how each person's skills complement one another, and any advisors involved. Be honest about what's missing, not just what's staffed — a credible gap analysis matters more than pretending to be fully staffed. Your team structure should be realistic for the resourcing, salary, and skills-availability constraints of an early-stage South African venture, not assembled as if funded like a Silicon Valley startup.",
    scoringBreakdown: [
      { dimension: "Substance", points: 20, expectation: "Roles, gaps, complementary skills, and any advisors." },
      { dimension: "Evidence", points: 20, expectation: "Specifics on who does what, not job titles alone." },
      { dimension: "SA Reality Fit", points: 20, expectation: "Team composition realistic for the resourcing and skills-availability constraints of an early-stage South African venture." },
      { dimension: "Rigour & Coherence", points: 20, expectation: "Honest about what's missing, not just what's staffed." },
      { dimension: "Investor Credibility", points: 20, expectation: "The team, as described, could plausibly execute this plan." },
    ],
    passThreshold: 60,
  },
  {
    id: 13,
    stage: 2,
    name: "Regulatory & Data Compliance",
    focus: "POPIA, tax registration, sector-specific compliance.",
    saThread: "Regulatory (POPIA/FSCA/B-BBEE/CIPC).",
    artifactType: "Compliance evidence",
    requirement:
      "Provide evidence of POPIA compliance, tax registration, and any sector-specific regulatory requirements relevant to your venture — actual documents or confirmations, not statements of intent. This needs to be specific to South African regulatory regimes (POPIA/FSCA/CIPC as relevant) and consistent with the entity structure you documented in CP8. Nothing here should raise a red flag in due diligence.",
    scoringBreakdown: [
      { dimension: "Substance", points: 20, expectation: "POPIA compliance, tax registration, sector-specific requirements." },
      { dimension: "Evidence", points: 20, expectation: "Actual documents or confirmations — not statements of intent." },
      { dimension: "SA Reality Fit", points: 20, expectation: "Compliance specific to South African regulatory regimes (POPIA/FSCA/CIPC)." },
      { dimension: "Rigour & Coherence", points: 20, expectation: "Compliance claims are consistent with the entity structure from CP8." },
      { dimension: "Investor Credibility", points: 20, expectation: "Nothing here would raise a red flag in due diligence." },
    ],
    passThreshold: 60,
  },
  {
    id: 14,
    stage: 2,
    name: "Unit Economics v1",
    focus: "CAC, basic LTV, gross margin, contribution margin.",
    saThread: "Load-shedding & infrastructure; data cost & device class.",
    artifactType: "Unit economics document",
    requirement:
      "Show your CAC (customer acquisition cost), basic LTV (lifetime value), gross margin, and contribution margin — with the underlying assumptions and calculations visible, not just the final numbers. Your costs should reflect real local factors: data cost, infrastructure, logistics. The numbers need to be internally consistent (your LTV:CAC ratio should actually make sense) and able to survive a sharp investor doing the mental math live.",
    scoringBreakdown: [
      { dimension: "Substance", points: 20, expectation: "CAC, basic LTV, gross margin, contribution margin." },
      { dimension: "Evidence", points: 20, expectation: "Underlying assumptions and calculations visible, not just final numbers." },
      { dimension: "SA Reality Fit", points: 20, expectation: "Costs reflect real local factors — data cost, infrastructure, logistics." },
      { dimension: "Rigour & Coherence", points: 20, expectation: "The numbers are internally consistent (LTV:CAC ratio makes sense)." },
      { dimension: "Investor Credibility", points: 20, expectation: "The unit economics would survive a sharp investor's mental math." },
    ],
    passThreshold: 60,
  },

  // Stage 3 — Investor & Deal Readiness (70 threshold)
  {
    id: 15,
    stage: 3,
    name: "Business Model & Financial Projections",
    focus: "3-statement model, bottom-up build, defensible assumptions.",
    saThread: "Load-shedding & infrastructure.",
    artifactType: "Financial model",
    requirement:
      "Build a 3-statement financial model — income statement, balance sheet, cash flow — constructed bottom-up from assumptions you can defend, not a top-down guess. Every material assumption needs a stated rationale, including how load-shedding/infrastructure costs are accounted for. The three statements need to tie together correctly, and the projections need to be defensible, not a hockey-stick fantasy that falls apart under questioning.",
    scoringBreakdown: [
      { dimension: "Substance", points: 20, expectation: "A 3-statement financial model (income statement, balance sheet, cash flow)." },
      { dimension: "Evidence", points: 20, expectation: "Built bottom-up from assumptions, each with a stated rationale." },
      { dimension: "SA Reality Fit", points: 20, expectation: "Load-shedding/infrastructure costs explicitly accounted for." },
      { dimension: "Rigour & Coherence", points: 20, expectation: "The three statements tie together correctly." },
      { dimension: "Investor Credibility", points: 20, expectation: "The projections are defensible, not hockey-stick fantasy." },
    ],
    passThreshold: 70,
  },
  {
    id: 16,
    stage: 3,
    name: "Capital Pathway",
    focus: "What's being raised, why, milestone-tied use (debt + equity + grant folded into one).",
    saThread: "Regulatory (POPIA/FSCA/B-BBEE/CIPC); SA capital landscape (Section 12J/DFIs/B-BBEE funders).",
    artifactType: "Funding strategy document",
    requirement:
      "Explain what you're raising, why that specific amount, and exactly how it maps to specific milestones — folding debt, equity, and grant funding into one coherent strategy rather than disconnected asks. Reference the real South African capital landscape where it applies: Section 12J, DFIs, B-BBEE funders. The ask needs to be sized and justified in a way a real investor would take seriously, not just a round number that sounds ambitious.",
    scoringBreakdown: [
      { dimension: "Substance", points: 20, expectation: "What's being raised and why that amount." },
      { dimension: "Evidence", points: 20, expectation: "Use of funds mapped explicitly to specific milestones." },
      { dimension: "SA Reality Fit", points: 20, expectation: "Reference to the real SA capital landscape (Section 12J, DFIs, B-BBEE funders)." },
      { dimension: "Rigour & Coherence", points: 20, expectation: "Debt, equity, and grant funding folded into one coherent strategy, not disconnected asks." },
      { dimension: "Investor Credibility", points: 20, expectation: "The ask is sized and justified in a way a real investor would take seriously." },
    ],
    passThreshold: 70,
  },
  {
    id: 17,
    stage: 3,
    name: "Moat & Risk Architecture",
    focus: "Defensibility; honest risk catalogue.",
    saThread: "The risk catalogue names real South African operating risks — regulatory (POPIA/B-BBEE/sector-specific), infrastructure, currency/political, informal-sector competition — not generic global startup risk boilerplate.",
    artifactType: "Moat & risk document",
    requirement:
      "Explain what makes this venture defensible over time, and provide an honest catalogue of the real risks facing the business — regulatory, competitive, operational. A sanitised risk list will not pass; investors expect the real one, and naming your risks clearly is what builds credibility here, not hiding them. Make sure your risks are specific to operating in South Africa — regulatory (POPIA/B-BBEE/sector-specific), infrastructure, currency/political, informal-sector competition — not generic global startup risk boilerplate, and make sure your moat claim doesn't contradict your own risk list.",
    scoringBreakdown: [
      { dimension: "Substance", points: 20, expectation: "What makes this venture defensible over time." },
      { dimension: "Evidence", points: 20, expectation: "An honest catalogue of real risks — regulatory, competitive, operational." },
      { dimension: "SA Reality Fit", points: 20, expectation: "Risks specific to operating in South Africa (regulatory, infrastructure, currency/political, informal-sector competition), not generic startup risk boilerplate." },
      { dimension: "Rigour & Coherence", points: 20, expectation: "The moat claim and the risk list don't contradict each other." },
      { dimension: "Investor Credibility", points: 20, expectation: "A sanitised risk list will not pass — investors expect the real one." },
    ],
    passThreshold: 70,
  },
  {
    id: 18,
    stage: 3,
    name: "Execution Roadmap",
    focus: "3–6 concrete, dated milestones, accountability.",
    saThread: "Load-shedding & infrastructure.",
    artifactType: "Roadmap document",
    requirement:
      "Lay out 3–6 concrete, dated milestones with clear accountability for who delivers what and by when. Vague roadmaps ('grow the team', 'expand market') will not pass — every milestone needs a real date and a named owner, sequenced logically rather than as a random list, and should account for real local operating realities like infrastructure dependencies.",
    scoringBreakdown: [
      { dimension: "Substance", points: 20, expectation: "3–6 concrete, dated milestones." },
      { dimension: "Evidence", points: 20, expectation: "Clear accountability for who delivers what." },
      { dimension: "SA Reality Fit", points: 20, expectation: "Milestones account for local operating realities (e.g. infrastructure dependencies)." },
      { dimension: "Rigour & Coherence", points: 20, expectation: "Milestones are sequenced logically, not a random list." },
      { dimension: "Investor Credibility", points: 20, expectation: "Vague milestones (\"grow the team\", \"expand market\") will not pass." },
    ],
    passThreshold: 70,
  },
  {
    id: 19,
    stage: 3,
    name: "Pitch & Narrative",
    focus: "Deck, narrative, one-line proposition.",
    saThread: "SA capital landscape (Section 12J/DFIs/B-BBEE funders).",
    artifactType: "Pitch deck",
    requirement:
      "Upload your actual pitch deck — a real document, not typed text — along with a clear one-line proposition and narrative arc. It needs to hold together as one story an investor could repeat back to someone else after a single read, framed for the realistic South African capital landscape (Section 12J, DFIs, B-BBEE funders where relevant). The narrative needs to be compelling enough to justify a follow-up meeting, not just informative.",
    scoringBreakdown: [
      { dimension: "Substance", points: 20, expectation: "An uploaded pitch deck — a real document, not typed text." },
      { dimension: "Evidence", points: 20, expectation: "A clear one-line proposition backed by the deck's content." },
      { dimension: "SA Reality Fit", points: 20, expectation: "Narrative framed for the realistic SA capital landscape (Section 12J/DFIs/B-BBEE funders)." },
      { dimension: "Rigour & Coherence", points: 20, expectation: "The deck holds together as one story an investor could repeat back after a single read." },
      { dimension: "Investor Credibility", points: 20, expectation: "The narrative arc is compelling enough to justify a follow-up meeting." },
    ],
    passThreshold: 70,
  },
  {
    id: 20,
    stage: 3,
    name: "Governance & Data Room",
    focus: "Cap table, board, audit-ready files, data room.",
    saThread: "Regulatory (POPIA/FSCA/B-BBEE/CIPC); SA capital landscape (Section 12J/DFIs/B-BBEE funders).",
    artifactType: "Data room / cap table",
    requirement:
      "Provide your cap table, board structure, and an audit-ready data room — the actual files a real investor's due diligence team would expect to open on day one, not promises about what you'll prepare. This needs to be consistent with the legal entity structure you documented in CP8, and structured to meet the expectations of a local investor or DFI. A folder of promises won't pass — it needs to be genuinely audit-ready.",
    scoringBreakdown: [
      { dimension: "Substance", points: 20, expectation: "Cap table, board structure, audit-ready data room." },
      { dimension: "Evidence", points: 20, expectation: "The actual files a due-diligence team would expect to open on day one." },
      { dimension: "SA Reality Fit", points: 20, expectation: "Governance structured to meet local investor/DFI expectations." },
      { dimension: "Rigour & Coherence", points: 20, expectation: "Cap table and governance are consistent with CP8's legal entity structure." },
      { dimension: "Investor Credibility", points: 20, expectation: "The data room is genuinely audit-ready, not a folder of promises." },
    ],
    passThreshold: 70,
  },
  {
    id: 21,
    stage: 3,
    name: "Investor Q&A Readiness",
    focus: "Answering 5–7 hard investor questions coherently.",
    saThread: "Answers are grounded in this founder's own real South African operating conditions and constraints already established in prior checkpoints, not rehearsed, generic, or imported answers.",
    artifactType: "Recorded Q&A responses",
    requirement:
      "This checkpoint is a live conversation, not a document upload. You'll answer several hard, specific investor questions one at a time, grounded in your own prior checkpoint submissions — answer exactly as you would in a real investor meeting, not with rehearsed or generic lines. Your answers need to stay consistent with everything you've claimed across CP1–CP20, and reflect the real South African operating conditions you've already established — this is where it all needs to hold together under direct questioning.",
    scoringBreakdown: [
      { dimension: "Substance", points: 20, expectation: "Answering 5–7 hard investor questions, live, one at a time." },
      { dimension: "Evidence", points: 20, expectation: "Answers grounded in your own prior checkpoint submissions." },
      { dimension: "SA Reality Fit", points: 20, expectation: "Answers reflect real South African operating conditions established in this founder's own prior checkpoints, not rehearsed generic lines." },
      { dimension: "Rigour & Coherence", points: 20, expectation: "Answers are consistent with everything claimed in CP1–CP20." },
      { dimension: "Investor Credibility", points: 20, expectation: "You'd hold up in a real investor meeting under direct questioning." },
    ],
    passThreshold: 70,
  },
];

export function getCheckpoint(id: number): Checkpoint {
  const checkpoint = CHECKPOINTS.find((c) => c.id === id);
  if (!checkpoint) throw new Error(`Unknown checkpoint id: ${id}`);
  return checkpoint;
}

export function checkpointsForStage(stage: Stage): Checkpoint[] {
  return CHECKPOINTS.filter((c) => c.stage === stage);
}

export const STAGE_AVERAGE_THRESHOLDS: Record<Stage, number> = {
  1: 70,
  2: 60, // Stage 2 has no explicit stage-average bar in the spec beyond per-checkpoint ≥ 60; kept for symmetry.
  3: 80,
};

export const TRACTION_MINIMUMS = {
  B2C: { signups: 100, mau: 30 },
  B2B: { pilotsMin: 2, pilotsMax: 3, payingClientsMin: 1, payingClientsMax: 2 },
  // Hardware minimums are not specified in the build spec — confirm against
  // the framework doc before enforcing Stage 2 gating for Hardware ventures.
  HARDWARE: null,
} as const;
