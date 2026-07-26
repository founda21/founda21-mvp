import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { renderBrandedEmail } from "@/lib/email-template";

export const STAGE_NAMES: Record<number, string> = {
  1: "Idea & Reality",
  2: "Company & Traction",
  3: "Investor & Deal Readiness",
};

export async function getFounderEmail(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data.user?.email) return null;
  return data.user.email;
}

// Institution.contactEmail is set at signup for new institutions but can be
// null for older/seed rows — fall back to the admin's own login email so a
// notification is never silently dropped for a founder-portable relationship.
async function getInstitutionEmail(institutionId: string): Promise<string | null> {
  const institution = await prisma.institution.findUnique({ where: { id: institutionId } });
  if (!institution) return null;
  if (institution.contactEmail) return institution.contactEmail;
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.getUserById(institution.adminUserId);
  if (error || !data.user?.email) return null;
  return data.user.email;
}

// Fired once, right at account creation (§ createFounderInCohort in
// actions/founder.ts) — never on a returning founder joining a second
// cohort, they've already had this email. Deliberately branded (the founder
// welcome/account email, not a system notification) and sent before the
// founder ever reaches a checkpoint.
export async function notifyFounderWelcome(params: {
  fullName: string;
  ventureName: string;
  email: string;
}): Promise<void> {
  const { fullName, ventureName, email } = params;

  const html = renderBrandedEmail(`
    <p>Hi ${fullName},</p>
    <p>Your Founda21 account is ready, for <strong>${ventureName}</strong>. You're about to start the Founder Readiness assessment: 21 checkpoints across 3 stages, scored against a fixed rubric.</p>
    <p><strong>Keep your login details safe.</strong> Your email and password are the only way into your account, and your checkpoint progress and Founda21 credential live there permanently, so don't share them with anyone.</p>
    <p><strong>Funders will be in touch.</strong> The funder whose passcode you used, and any funder you join later, can see your profile and progress, and may reach out to you directly by email if they'd like you to continue to a specific stage.</p>
    <p>Log in any time to pick up where you left off and start Stage 1.</p>
  `);

  await sendEmail({ to: email, subject: "Welcome to Founda21, your account is ready", html });
}

// Fired once, right at institution account creation (§ signUpInstitution in
// actions/auth.ts), the funder-side counterpart to notifyFounderWelcome
// above. Distinct from approveInstitution/rejectInstitution's emails
// (§ actions/platform-admin.ts) — this fires immediately at signup, before
// any review has happened, those fire later once a platform admin decides.
export async function notifyFunderWelcome(params: {
  institutionName: string;
  contactName: string | null;
  email: string;
}): Promise<void> {
  const { institutionName, contactName, email } = params;

  const html = renderBrandedEmail(`
    <p>Hi ${contactName || institutionName},</p>
    <p>Your Founda21 funder account is ready, for <strong>${institutionName}</strong>. Founda21 manually reviews every new funder account before granting dashboard access, we'll respond by email within 48 hours to confirm you're approved, once that email lands, you can log back in and continue straight away, no extra step needed.</p>
    <p><strong>Keep your login details safe.</strong> Your email and password are the only way into your account, and every founder's checkpoint progress you'll review lives behind it.</p>
    <p>Once approved, you'll be able to create cohorts, share a passcode with founders, review their checkpoint progress and Founda21 credential as they complete it, and email a founder directly if you'd like them to continue to a specific stage.</p>
  `);

  await sendEmail({ to: email, subject: "Welcome to Founda21, your account is ready", html });
}

// Fired from scoreAndSaveSubmission (§ submission-core.ts) for every
// checkpoint attempt, pass or fail — a founder-facing "your result is in"
// email. Never blocks the submission it's reporting on.
export async function notifySubmissionScored(params: {
  founderId: string;
  checkpointId: number;
  checkpointName: string;
  score: number;
  passed: boolean;
}): Promise<void> {
  const { founderId, checkpointId, checkpointName, score, passed } = params;

  const founder = await prisma.founder.findUnique({ where: { id: founderId } });
  if (!founder) return;

  const email = await getFounderEmail(founder.userId);
  if (!email) return;

  const subject = passed
    ? `CP${checkpointId} passed: ${checkpointName}`
    : `CP${checkpointId} results are in: ${checkpointName}`;

  const html = `
    <p>Hi ${founder.fullName},</p>
    <p>Your submission for <strong>CP${checkpointId} · ${checkpointName}</strong> has been scored.</p>
    <p style="font-size:18px;font-weight:bold;">${score}/100 (${passed ? "Passed" : "Below threshold"})</p>
    <p>Log in to Founda21 to see the full feedback and, if needed, resubmit.</p>
  `;

  await sendEmail({ to: email, subject, html });
}

// Fired from recomputeStageStatus (§ stage-gating.ts) only on a genuine
// pass -> passed transition (caller guards against re-sending on later
// resubmissions within an already-passed stage) — a funder-facing "come
// look at this founder" email, sent to every institution the founder is
// actively enrolled with.
export async function notifyStageMilestone(founderId: string, stage: number, investable: boolean): Promise<void> {
  const founder = await prisma.founder.findUnique({
    where: { id: founderId },
    include: { memberships: { where: { status: "active" }, include: { cohort: true } } },
  });
  if (!founder) return;

  const subject = investable
    ? `${founder.ventureName} is now Founda21 Investable`
    : `${founder.ventureName} passed Stage ${stage}: ${STAGE_NAMES[stage] ?? ""}`;

  const html = `
    <p><strong>${founder.fullName}</strong> (${founder.ventureName}) ${
      investable ? "has achieved Founda21 Investable status" : `has passed Stage ${stage} · ${STAGE_NAMES[stage] ?? ""}`
    }.</p>
    <p>Log in to your Founda21 dashboard to review their profile.</p>
  `;

  const institutionIds = Array.from(new Set(founder.memberships.map((m) => m.cohort.institutionId)));
  for (const institutionId of institutionIds) {
    const email = await getInstitutionEmail(institutionId);
    if (email) await sendEmail({ to: email, subject, html });
  }
}
