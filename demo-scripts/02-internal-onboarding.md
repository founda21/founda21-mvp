# Founda21 Demo Script — Internal Onboarding

**Length:** 5:00
**Audience:** New team member, new client admin, anyone who needs to actually operate the product (not be sold on it).
**Tone:** Plain, procedural, "click here, then this happens." No music needed — narrator only, or captions if silent.
**Voice:** Second person ("you'll click", "now you"), first name basis with the UI.

---

## 0:00–0:15 — What this covers

**Screen:** Landing page (`/`).

**Voiceover:**
"This walkthrough covers the full Founda21 flow end to end: setting up a funder account, issuing a passcode, a founder signing up and getting scored, and the two things you get back — the founder's credential and your institutional report. Five minutes, everything you need to operate this day to day."

---

## 0:15–1:00 — Funder signup

**Screen:** Click "I'm a Funder" (`/get-started/funder`).

**Voiceover:**
"Every organisation using Founda21 — corporate, DFI, university, accelerator, fund manager, or investor — picks their type here first. This isn't cosmetic: it changes what your dashboard leads with later, so pick the one that actually matches you."

**Action:** Click any type (e.g. "Accelerator / incubator") → `/signup?type=accelerator_incubator`.

**Voiceover (continued):**
"Fill in your organisation name, an optional contact name, your admin email, and a password. This account is what your whole team logs into — there's no per-seat step here yet, so treat this login as shared or hand it to whoever owns the programme."

**Action:** Fill and submit → lands on `/dashboard`.

**Voiceover (continued):**
"You're in. Empty state, because you haven't created a cohort yet — that's next."

---

## 1:00–2:00 — Creating a cohort and passcode

**Screen:** Click "New cohort" → `/dashboard/cohorts/new`.

**Voiceover:**
"A cohort is a batch of founders — this quarter's intake, one specific pilot, whatever grouping makes sense for you. Give it a name."

**Action:** Fill "name" field.

**Voiceover (continued):**
"Three optional settings control the passcode this cohort generates. 'Intended entry stage' is just a hint for your own planning — it does not let a founder skip ahead; every founder still has to clear Stage 1 before Stage 2 unlocks, no matter what you set here. 'Max uses' caps how many people can sign up with this exact passcode — set it to 1 for a single founder, or leave it blank for an open cohort. 'Expires on' is optional too — leave it blank for no expiry."

**Action:** Set maxUses = 1 (for this walkthrough), leave expiry blank, submit.

**Voiceover (continued):**
"Submitting takes you straight to the cohort page — and there's your passcode."

**Screen:** Cohort detail page, zoom on the passcode block.

**Voiceover (continued):**
"This is what you send founders — over email, WhatsApp, whatever channel you already use. They type it in manually at the founder signup screen. There's also a direct link version below it if you'd rather send a clickable link instead — both do exactly the same thing, so use whichever is easier for your channel."

---

## 2:00–3:00 — Founder signup with a passcode

**Screen:** New browser tab/window (to simulate the founder's device), `/get-started/founder`.

**Voiceover:**
"On the founder's side, they land here, enter the passcode you gave them, and fill in one signup form."

**Action:** Fill passcode, full name, venture name, venture type, click a venture stage radio, then scroll to show ownership/entity fields and the outcome snapshot fields.

**Voiceover (continued):**
"Two sections are worth knowing about. 'Ownership & entity details' captures B-BBEE ownership percentages, turnover band, and entity type — this is for your eligibility reporting later, it never affects their checkpoint scores. 'Current venture snapshot' captures a baseline — capital raised, revenue, headcount — so you can track outcomes over time. Both are one-time at signup; if a founder's numbers change later, that's a re-poll process outside this flow for now, not something they self-edit."

**Action:** Fill email/password, submit → lands on `/founder`.

**Voiceover (continued):**
"They land on their checkpoint dashboard, Stage 1, all 21 checkpoints laid out with pass thresholds. From here it's on the founder — they submit real artifacts per checkpoint and get scored."

---

## 3:00–3:45 — What happens when a checkpoint is scored (quick note)

**Screen:** Founder checkpoint page, `/founder/checkpoint/[id]` — show the submission form (text/link/upload options) without necessarily waiting for a full AI scoring cycle on camera (mention it instead, to keep timing tight).

**Voiceover:**
"Each checkpoint has a specific artifact requirement — sometimes a written answer, sometimes a link, sometimes a file upload — you'll see the exact requirement text on each checkpoint page. Once submitted, it's scored by AI in the background, typically within a few seconds, and the founder sees pass/fail plus a score against a fixed threshold immediately. If they don't pass, they can revise and resubmit — every attempt is kept, not just the latest."

---

## 3:45–4:30 — Where you check on a founder

**Screen:** Switch back to the funder dashboard, `/dashboard/cohorts/[id]`, then click into a founder that already has scored checkpoints, `/dashboard/founders/[id]`.

**Voiceover:**
"Back on your side, the cohort page is your roster — ranked by total points, with pass rates per stage and an M&E summary. Click into any founder for the detail view: which checkpoints passed, what's still outstanding, and their overall readiness."

**Action:** Click "Institutional reports →".

**Voiceover (continued):**
"'Institutional reports' is your dedicated view for reporting purposes — eligibility snapshot, a needs-analysis breakdown per checkpoint, and their outcome metrics, all generated automatically the moment a stage gets scored. You don't build this by hand."

---

## 4:30–4:50 — Exporting for reporting

**Screen:** Back to cohort page → click "Export CSV".

**Voiceover:**
"When you need something for a B-BBEE file or a funder report, 'Export CSV' on the cohort page gives you everything — every founder's scores, stage pass rates, and the M&E summary block at the bottom, ready to paste into whatever report template you already use."

---

## 4:50–5:00 — Close / where to go next

**Screen:** Back to `/dashboard`.

**Voiceover:**
"That's the full loop: create a cohort, share a passcode, founder signs up and gets scored, you check progress and pull reports. If you get stuck, [support contact / internal wiki link] has the details on each checkpoint's requirements."

**End.**

---

## Shot list summary (for the editor)

| Time | Screen | Key action |
|---|---|---|
| 0:00 | `/` | Intro card |
| 0:15 | `/get-started/funder` → `/signup?type=X` | Fill + submit |
| 1:00 | `/dashboard` | Empty state |
| 1:05 | `/dashboard/cohorts/new` | Fill fields incl. maxUses=1 |
| 1:45 | `/dashboard/cohorts/[id]` | Zoom passcode block |
| 2:00 | `/get-started/founder` | Full intake form fill |
| 2:50 | `/founder` | Checkpoint list |
| 3:00 | `/founder/checkpoint/[id]` | Show submission form only |
| 3:45 | `/dashboard/cohorts/[id]` | Roster view |
| 4:00 | `/dashboard/founders/[id]` | Founder detail |
| 4:15 | `/dashboard/founders/[id]/reports` | Reports view |
| 4:30 | Export CSV | Show file |
| 4:50 | `/dashboard` | Close |

**Note on realism:** Use one pre-scored founder for the 3:45–4:30 segment so the report/detail screens show real data, not empty states. No need to wait for live AI scoring on camera — mention the ~few-second turnaround verbally and cut to a founder whose checkpoint is already scored.
