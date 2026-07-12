# Founda21 MVP — Build Spec (Full 21 Checkpoints)

**Purpose.** Build the Founda21 platform: the full three-stage, 21-checkpoint founder readiness standard, scored by AI, delivered to founders through their institution. The pilot cohort runs on Stage 1, but the complete framework (Stages 1–3) is built.

**Scope:** All **21 checkpoints across 3 stages**. The 21 is fixed and not flexible. Stages are passed strictly in order.

**Stack:** Next.js 14 (App Router), Supabase (Postgres + Auth), Prisma, TypeScript, Tailwind.

**Excluded from this build (do not build):**
- FoundaID minting / public founder identifier (keep only an internal account id — see §3).
- Investor portal and investor-facing features.
- Public self-serve founder signup (founders enter via institution invite only).
- Payment / pricing / billing UI, and Founda Credits metering (pilot billing handled manually).

---

# PART 0 — BRAND (mirror the live founda21.com)

Match the live landing page exactly. Do not invent a new identity.

- **Palette:** white ground; **emerald green `#01884E`**; **dark navy `#0A1F44`** (near-black, matched to the logo). No black/cream.
- **Wordmark:** "Founda21" rendered as `Fo`(navy) `u`(green) `nda`(navy) `21`(green).
- **Typography:** Helvetica / Arial throughout (system sans). Large, tight, confident display headings in navy with a single emerald accent line, exactly like the hero ("From a raw idea to a startup that's **actually ready.**" — second line emerald).
- **Positioning line:** "The Founder Readiness Standard · South Africa First."
- **Terminal credential name:** **Founda21 Investable** — the one thing investors recognise, earned only by clearing all 21. Framed as a standard, "not a course, not a certificate of attendance."
- **Tone:** credible, earned, rigorous. Buttons: solid emerald with white text (primary), navy outline (secondary), mirroring "Get Early Access" / "Join the Waitlist".

Every founder-facing and institution-facing screen uses this identity.

---

# PART A — MVP SCOPE

## 1. The core capabilities

1. **Institution + cohort layer.** An institution admin creates an account, creates a named cohort, and invites founders via an invite code/link. This is the paying customer's surface and has no prior code to lean on — build it carefully.
2. **Founder assessment.** A founder joins a cohort, then works through the checkpoints stage by stage, submitting the required artifact per checkpoint.
3. **AI scoring.** Each submission is scored across the 5 universal dimensions (Part B), returning score, per-dimension reasoning, and improvement guidance, with stage pass/fail computed.
4. **Stage gating.** A founder cannot attempt Stage 2 without passing Stage 1, or Stage 3 without passing Stage 2. Enforced server-side — this is a structural integrity requirement, not a UX preference.
5. **Institution dashboard + report.** The admin sees every founder's per-checkpoint scores, current stage, and status, and can export a cohort report to show their funders.

## 2. Venture type

Founda21 is sector-neutral with **type-specific calibration**. Capture each venture's type — **B2C / B2B / Hardware** — at founder onboarding. It drives type-specific scoring (esp. Checkpoint 11 Traction and the Stage 2 traction threshold).

## 3. Data model (minimal)

- **Institution** — `id`, `name`, `admin_user_id`, `created_at`.
- **Cohort** — `id`, `institution_id`, `name`, `invite_code` (unique), `created_at`.
- **Founder** — `id` (internal account id; FoundaID slots in here later), `user_id` (Supabase auth), `cohort_id`, `full_name`, `venture_name`, `venture_type` (B2C/B2B/Hardware), `current_stage` (1–3), `created_at`.
- **Submission** — `id`, `founder_id`, `checkpoint_id` (1–21), `artifact_type`, `artifact_content` (text or file ref), `attempt_number`, `created_at`.
- **Score** — `id`, `submission_id`, `checkpoint_score` (0–100), `passed` (bool), `dimensions_json`, `summary`, `top_priority_fix`, `model_version`, `framework_version`, `created_at`.
- **StageStatus** — `id`, `founder_id`, `stage` (1–3), `status` (in_progress/passed), `stage_average`, `passed_at`.

Store the AI's full structured output on `Score.dimensions_json` for audit.

## 4. The 21 checkpoints (locked v0.1 architecture)

Drive all 21 from a **single config structure** (id, name, stage, focus, SA thread, artifact type) so UI and scoring stay consistent.

**Stage 1 — Idea & Reality (1–7) · "Is this worth a coffee?"** · Evidence: reasoned, documented answers + minimal artifacts.

| # | Checkpoint | Artifact |
|---|---|---|
| 1 | Problem Definition | Problem-evidence document (plain-language problem + ≥10 documented sources + customer voice) |
| 2 | Customer Definition | Customer profile document |
| 3 | Market Sizing (Africa-calibrated) | TAM/SAM/SOM document with cited sources |
| 4 | Solution Hypothesis | Solution hypothesis document |
| 5 | South African Reality Fit | The master SA Reality Fit document (referenced by all others) |
| 6 | African Scalability Logic | Scalability logic document |
| 7 | Founder–Problem Fit | Short founder **recording** + written statement (tests the founder, not documents) |

**Stage 2 — Company & Traction (8–14) · "Is this worth diligence?"** · Evidence: verifiable artifacts and traction data.

| # | Checkpoint | What it tests | Artifact |
|---|---|---|---|
| 8 | Legal Entity & Founder Agreements | CIPC registration, beneficial ownership, founder agreements, IP assignment | Registration + agreement docs |
| 9 | Brand & Positioning | Name, identity, positioning, defensibility | Positioning document |
| 10 | Online Presence & Trust Signals | Website, social proof, verifiable presence | Links + evidence |
| 11 | Demonstrated Traction (type-specific) | B2C: signups + MAU; B2B: pilots/paying customers | Traction data / verifiable evidence |
| 12 | Team Architecture | Roles, gaps, complementary skills, advisory | Team document |
| 13 | Regulatory & Data Compliance | POPIA, tax registration, sector-specific compliance | Compliance evidence |
| 14 | Unit Economics v1 | CAC, basic LTV, gross margin, contribution margin | Unit economics document |

**Stage 3 — Investor & Deal Readiness (15–21) · "Is this worth a term sheet?"** · Evidence: third-party-verifiable, investor-grade artifacts.

| # | Checkpoint | What it tests | Artifact |
|---|---|---|---|
| 15 | Business Model & Financial Projections | 3-statement model, bottom-up build, defensible assumptions | Financial model |
| 16 | Capital Pathway | What's being raised, why, milestone-tied use (debt+equity+grant folded into one) | Funding strategy document |
| 17 | Moat & Risk Architecture | Defensibility; honest risk catalogue | Moat & risk document |
| 18 | Execution Roadmap | 3–6 concrete, dated milestones, accountability | Roadmap document |
| 19 | Pitch & Narrative | Deck, narrative, one-line proposition | Pitch deck |
| 20 | Governance & Data Room | Cap table, board, audit-ready files, data room | Data room / cap table |
| 21 | Investor Q&A Readiness | Answering 5–7 hard investor questions coherently | Recorded Q&A responses |

Confirm exact artifact requirements per checkpoint against your framework doc before build — the table above is directionally correct; the framework doc is ground truth.

## 5. Core flows

**Institution admin:** sign up → create institution → create cohort → share invite → watch dashboard fill → export report.

**Founder:** open invite → sign up + set venture type → work Stage 1 checkpoints in sequence → submit artifact → get scored → resubmit until threshold → pass Stage 1 → (gate opens) Stage 2 → Stage 3 → on clearing all 21, **Founda21 Investable** is issued.

**Founder sees per submission:** checkpoint total (0–100), band, all 5 dimensions with score/band/reasoning/guidance, an honest 2–3 sentence summary, and the single top-priority fix. Honest, never inflated. A strong founder may fail first attempt — intended.

**Institution sees:** cohort table (founder, venture, venture type, per-checkpoint scores, current stage, status), cohort rollups (average per checkpoint, % passed each stage), and an **Export report** (PDF/CSV) — the most commercially important output; make it credible.

---

# PART B — SCORING RUBRIC + AI SCORING PROMPT

If scoring is inconsistent or gameable, the report is worthless and the institution won't pay. Lock this exactly.

## 6. Scoring architecture

Pure AI scoring, no human scorers in production. Per checkpoint: founder submits artifact → AI ingests it plus prior-checkpoint artifacts (cross-checking for gaming/consistency) → AI scores the 5 universal dimensions 0–20 each → reasoning trace per dimension → sum = checkpoint score 0–100 → founder gets score + reasoning + guidance → founder may resubmit.

Configurable LLM provider (you've used Gemini; keep it behind one scoring service). **Temperature ≤ 0.1.** Version-lock model + prompt with the framework version; store both on every Score row.

## 7. The 5 universal dimensions (every checkpoint, each 0–20)

1. **Substance** — is the required content genuinely present and credible?
2. **Evidence** — is it backed by real, specific, cited evidence rather than assertion?
3. **SA Reality Fit** — does it pass the checkpoint's SA thread with local specificity?
4. **Rigour & Coherence** — is it clear, internally consistent, structurally sound?
5. **Investor Credibility** — would this raise or settle concerns in a real SA investor's mind?

## 8. Universal scoring bands (every dimension, 0–20)

| Band | Range | Meaning |
|---|---|---|
| Absent | 0–3 | Not addressed, unintelligible, no coherent attempt. |
| Minimal | 4–7 | Surface-level, weak evidence, big gaps, or generic/global framing without local substance. |
| Adequate | 8–11 | Present with appropriate depth; some weaknesses but substance is there. |
| Strong | 12–15 | Clear, well-evidenced, structurally sound, investor-credible. |
| Exceptional | 16–20 | Investor-grade; would not raise concerns in due diligence. |

Checkpoint score = sum of 5 dimensions (0–100).

## 9. Thresholds and stage gating

- **Checkpoint pass:** ≥ 60 (Stages 1–2) / ≥ 70 (Stage 3, see below).
- **Stage 1 pass:** every checkpoint 1–7 ≥ 60 **AND** stage average ≥ 70.
- **Stage 2 pass:** Stage 1 passed **AND** every checkpoint 8–14 ≥ 60 **AND** type-specific traction minimums met — **B2C: ≥100 signups & ≥30 MAU; B2B: 2–3 pilots OR 1–2 paying clients** (Hardware: confirm minimum against framework doc).
- **Stage 3 pass:** Stage 2 passed **AND** every checkpoint 15–21 ≥ 70 **AND** Stage 3 average ≥ 80.
- **Founda21 Investable** is issued only when Stage 3 is passed (all 21 cleared). Stages 1 and 2 are internal cleared milestones, not public badges.

Stages must be passed in order; no skipping. Enforce server-side. Show founders progress toward every active condition (per-checkpoint pass, running stage average vs its bar, and — for Stage 2 — traction minimums).

## 10. Structured output schema (per submission)

Scoring service returns **only** this JSON (no prose, no markdown fences); the app parses and validates it:

```json
{
  "checkpoint_id": 1,
  "dimensions": [
    { "dimension": "Substance", "score": 0, "band": "Adequate", "reasoning": "specific reasoning citing the submission", "improvement_guidance": "concrete, actionable next step" },
    { "dimension": "Evidence", "score": 0, "band": "", "reasoning": "", "improvement_guidance": "" },
    { "dimension": "SA Reality Fit", "score": 0, "band": "", "reasoning": "", "improvement_guidance": "" },
    { "dimension": "Rigour & Coherence", "score": 0, "band": "", "reasoning": "", "improvement_guidance": "" },
    { "dimension": "Investor Credibility", "score": 0, "band": "", "reasoning": "", "improvement_guidance": "" }
  ],
  "checkpoint_score": 0,
  "passed": false,
  "summary": "2-3 sentence honest overall verdict",
  "top_priority_fix": "the single most important thing to improve"
}
```

Validate server-side: 5 dimensions, each score 0–20, `checkpoint_score` equals the sum, `passed` equals score ≥ the checkpoint's threshold. Reject and retry on malformed output.

## 11. Scoring prompt (system prompt for the scoring service)

> You are the Founda21 scoring engine. You score a South African founder's submission for one checkpoint of the Founda21 standard. You are rigorous, fair, and honest. You reward specificity and real, local South African evidence. You penalise vagueness, hype, unsupported assertion, and generic global framing with no local substance.
>
> Score the submission on exactly five dimensions, each 0–20, using these bands: Absent 0–3, Minimal 4–7, Adequate 8–11, Strong 12–15, Exceptional 16–20.
>
> The five dimensions are: (1) Substance — is the required content genuinely present and credible; (2) Evidence — is it backed by real, specific, cited evidence rather than assertion; (3) SA Reality Fit — does it pass this checkpoint's SA thread with local specificity; (4) Rigour & Coherence — is it clear, internally consistent, structurally sound; (5) Investor Credibility — would this raise or settle concerns in a real South African investor's mind.
>
> This checkpoint is: **{CHECKPOINT_NAME}** (Stage {STAGE}). Its specific focus: {CHECKPOINT_FOCUS}. Its SA Reality thread: {SA_THREAD}. Venture type: {VENTURE_TYPE} — apply type-specific calibration where relevant.
>
> Be honestly hard. A high-quality founder may fail their first attempt — that is correct. Do not inflate scores. Cite specifics from the submission in your reasoning. For each dimension give one concrete, actionable improvement step.
>
> Return ONLY a JSON object matching the required schema. No preamble, no markdown, no commentary outside the JSON.

Supply `{CHECKPOINT_FOCUS}` and `{SA_THREAD}` per checkpoint from your framework doc. The SA thread map (from the framework): load-shedding & infrastructure → #4,5,14,15,18; data cost & device class → #2,4,5,14; township & income realities → #2,3,5,11; regulatory (POPIA/FSCA/B-BBEE/CIPC) → #8,13,16,20; SA capital landscape (Section 12J/DFIs/B-BBEE funders) → #16,19,20.

---

# BUILD ORDER

1. Scaffold: Next.js 14 + Supabase auth + Prisma schema (§3), emerald/navy/white brand (Part 0).
2. Institution + cohort + invite flow (§1.1) — the pilot-critical customer surface.
3. **Stage 1 end to end** first (checkpoints 1–7, submission UI, scoring service, results, Stage 1 pass) — this is the pilot's live path.
4. Institution dashboard + exportable report (§5) — make the report credible.
5. Stage gating + Stage 2 (8–14) with venture-type traction thresholds.
6. Stage 3 (15–21) + issuance of **Founda21 Investable** on full completion.

Ship 1–4 for the pilot launch; 5–6 complete the framework.
