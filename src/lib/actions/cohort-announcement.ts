"use server";

import { redirect } from "next/navigation";
import { requireApprovedInstitutionAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { renderBrandedEmail } from "@/lib/email-template";
import { getFounderEmail, STAGE_NAMES } from "@/lib/notifications";
import { checkRateLimit } from "@/lib/rate-limit";

// Deliberately low — this is a real email to every founder in a cohort at
// once, the abuse case is spamming/confusing founders with conflicting
// deadlines, not a cost concern.
const ANNOUNCEMENT_RATE_LIMIT = 3;
const ANNOUNCEMENT_RATE_WINDOW_MS = 24 * 60 * 60 * 1000;

// The fairness mechanism the recruitment card is deliberately silent on
// (§ CohortCard no longer shows a required stage): every founder in the
// cohort gets the same "complete Stage X by date Y" email at the same
// moment, so nobody gets extra days just for signing in earlier. Recorded on
// the Cohort row (announcedStage/announcedDeadline/announcedAt) so the
// funder has a visible record of what they last told this cohort.
export async function sendCohortDeadlineAnnouncement(formData: FormData) {
  const { institution } = await requireApprovedInstitutionAdmin();
  const cohortId = String(formData.get("cohortId") ?? "");
  const requestedStage = Number(formData.get("requestedStage") ?? 0);
  const daysToComplete = Number(formData.get("daysToComplete") ?? 0);
  const message = String(formData.get("message") ?? "").trim();

  const cohort = await prisma.cohort.findUnique({ where: { id: cohortId } });
  if (!cohort || cohort.institutionId !== institution.id) {
    redirect(`/dashboard/cohorts/${cohortId}?error=${encodeURIComponent("Cohort not found.")}`);
  }

  if (![1, 2, 3].includes(requestedStage)) {
    redirect(`/dashboard/cohorts/${cohortId}?error=${encodeURIComponent("Select a stage.")}`);
  }
  if (!Number.isFinite(daysToComplete) || daysToComplete < 1 || daysToComplete > 90) {
    redirect(`/dashboard/cohorts/${cohortId}?error=${encodeURIComponent("Enter a number of days between 1 and 90.")}`);
  }

  const rateLimit = await checkRateLimit(`cohort-announce:${cohortId}`, ANNOUNCEMENT_RATE_LIMIT, ANNOUNCEMENT_RATE_WINDOW_MS);
  if (!rateLimit.ok) {
    redirect(
      `/dashboard/cohorts/${cohortId}?error=${encodeURIComponent(
        `You've already sent an announcement to this cohort recently. Try again after ${rateLimit.retryAfter.toLocaleString("en-ZA", { hour: "2-digit", minute: "2-digit", month: "long", day: "numeric" })}.`,
      )}`,
    );
  }

  const memberships = await prisma.cohortMembership.findMany({
    where: { cohortId, status: "active" },
    include: { founder: true },
  });

  const now = new Date();
  const deadline = new Date(now.getTime() + daysToComplete * 24 * 60 * 60 * 1000);
  const deadlineLabel = deadline.toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" });
  const stageName = STAGE_NAMES[requestedStage] ?? "";

  let sentCount = 0;
  for (const membership of memberships) {
    const email = await getFounderEmail(membership.founder.userId);
    if (!email) continue;

    const html = renderBrandedEmail(`
      <p>Hi ${membership.founder.fullName},</p>
      <p><strong>${institution.name}</strong> has set a deadline for everyone in this cohort:</p>
      <p style="font-size:16px;font-weight:bold;">Complete Stage ${requestedStage} &middot; ${stageName} by ${deadlineLabel}.</p>
      ${message ? `<p>${message.replace(/\n/g, "<br/>")}</p>` : ""}
      <p>Log in to Founda21 to continue. Everyone in this cohort has the same ${daysToComplete}-day window from this
      email, sent at the same time to everyone, so there's no advantage to having signed in earlier or later.</p>
    `);

    try {
      await sendEmail({
        to: email,
        subject: `${institution.name}: Stage ${requestedStage} deadline — ${deadlineLabel}`,
        html,
      });
      sentCount++;
    } catch (error) {
      console.error(`sendCohortDeadlineAnnouncement failed for founder ${membership.founder.id}:`, error);
    }
  }

  await prisma.cohort.update({
    where: { id: cohortId },
    data: { announcedStage: requestedStage, announcedDeadline: deadline, announcedAt: now },
  });

  redirect(
    `/dashboard/cohorts/${cohortId}?message=${encodeURIComponent(
      `Deadline announcement sent to ${sentCount} founder${sentCount === 1 ? "" : "s"}.`,
    )}`,
  );
}
