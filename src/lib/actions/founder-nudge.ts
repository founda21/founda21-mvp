"use server";

import { redirect } from "next/navigation";
import { requireApprovedInstitutionAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { getFounderEmail, STAGE_NAMES } from "@/lib/notifications";
import { checkRateLimit } from "@/lib/rate-limit";

// A funder can only nudge a founder a handful of times a day — this is a
// direct email to a real person, not a resubmission-style action, so the
// abuse case here is unwanted contact/harassment, not cost-runaway.
const NUDGE_RATE_LIMIT = 3;
const NUDGE_RATE_WINDOW_MS = 24 * 60 * 60 * 1000;

// Lets an institution ask a founder (by email) to continue to a specific
// stage, or send a general note. Stateless, same pattern as
// notifySubmissionScored/notifyStageMilestone — no audit row, just an email,
// rate-limited per (institution, founder) pair to prevent repeat contact.
export async function sendFounderNudge(formData: FormData) {
  const { institution } = await requireApprovedInstitutionAdmin();
  const founderId = String(formData.get("founderId") ?? "");
  const requestedStageRaw = String(formData.get("requestedStage") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  const redirectTo = String(formData.get("redirectTo") ?? `/dashboard/founders/${founderId}`);

  const founder = await prisma.founder.findUnique({
    where: { id: founderId },
    include: { memberships: { include: { cohort: true } } },
  });
  // Founder accounts are portable (§ CohortMembership) — an institution may
  // only message a founder it actually shares a cohort with, never any
  // founder by guessing an id.
  const isMember = founder?.memberships.some((m) => m.cohort.institutionId === institution.id);
  if (!founder || !isMember) {
    redirect(`${redirectTo}?error=${encodeURIComponent("You can only message founders enrolled with your organisation.")}`);
  }

  const rateLimit = await checkRateLimit(`nudge:${institution.id}:${founderId}`, NUDGE_RATE_LIMIT, NUDGE_RATE_WINDOW_MS);
  if (!rateLimit.ok) {
    redirect(
      `${redirectTo}?error=${encodeURIComponent(
        `You've already reached out to this founder recently. Try again after ${rateLimit.retryAfter.toLocaleString("en-ZA", { hour: "2-digit", minute: "2-digit", month: "long", day: "numeric" })}.`,
      )}`,
    );
  }

  const email = await getFounderEmail(founder.userId);
  if (!email) {
    redirect(`${redirectTo}?error=${encodeURIComponent("Couldn't find an email address for this founder.")}`);
  }

  const requestedStage = Number(requestedStageRaw);
  const stageAsk =
    requestedStage >= 1 && requestedStage <= 3
      ? `<p>We'd love to see you complete <strong>Stage ${requestedStage} &middot; ${STAGE_NAMES[requestedStage]}</strong> to strengthen your assessment with us.</p>`
      : "";

  const html = `
    <p>Hi ${founder.fullName},</p>
    <p><strong>${institution.name}</strong> sent you a message on Founda21:</p>
    ${stageAsk}
    ${message ? `<p>${message.replace(/\n/g, "<br/>")}</p>` : ""}
    <p>Log in to Founda21 to continue.</p>
  `;

  await sendEmail({
    to: email,
    subject: `${institution.name} would like you to continue on Founda21`,
    html,
  });

  redirect(`${redirectTo}?message=${encodeURIComponent("Message sent to " + founder.fullName + ".")}`);
}
