import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";

const STAGE_NAMES: Record<number, string> = {
  1: "Idea & Reality",
  2: "Company & Traction",
  3: "Investor & Deal Readiness",
};

async function getFounderEmail(userId: string): Promise<string | null> {
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
    ? `CP${checkpointId} passed — ${checkpointName}`
    : `CP${checkpointId} results are in — ${checkpointName}`;

  const html = `
    <p>Hi ${founder.fullName},</p>
    <p>Your submission for <strong>CP${checkpointId} · ${checkpointName}</strong> has been scored.</p>
    <p style="font-size:18px;font-weight:bold;">${score}/100 — ${passed ? "Passed" : "Below threshold"}</p>
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
    : `${founder.ventureName} passed Stage ${stage} — ${STAGE_NAMES[stage] ?? ""}`;

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
