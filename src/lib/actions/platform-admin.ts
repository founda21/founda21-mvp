"use server";

import { redirect } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { renderBrandedEmail } from "@/lib/email-template";

async function getInstitutionContactEmail(institutionId: string): Promise<string | null> {
  const institution = await prisma.institution.findUnique({ where: { id: institutionId } });
  if (!institution) return null;
  if (institution.contactEmail) return institution.contactEmail;
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.getUserById(institution.adminUserId);
  if (error || !data.user?.email) return null;
  return data.user.email;
}

export async function approveInstitution(formData: FormData) {
  await requirePlatformAdmin();
  const institutionId = String(formData.get("institutionId") ?? "");
  if (!institutionId) redirect("/admin");

  const institution = await prisma.institution.update({
    where: { id: institutionId },
    data: { status: "approved" },
  });

  const email = await getInstitutionContactEmail(institution.id);
  if (email) {
    await sendEmail({
      to: email,
      subject: "Your Founda21 account is approved",
      html: renderBrandedEmail(`
        <p>Hi ${institution.contactName || institution.name},</p>
        <p><strong>${institution.name}</strong> has been approved on Founda21, you can log in and start
        creating cohorts right away.</p>
      `),
    });
  }

  redirect("/admin");
}

export async function rejectInstitution(formData: FormData) {
  await requirePlatformAdmin();
  const institutionId = String(formData.get("institutionId") ?? "");
  if (!institutionId) redirect("/admin");

  const institution = await prisma.institution.update({
    where: { id: institutionId },
    data: { status: "rejected" },
  });

  const email = await getInstitutionContactEmail(institution.id);
  if (email) {
    await sendEmail({
      to: email,
      subject: "Your Founda21 account signup",
      html: renderBrandedEmail(`
        <p>Hi ${institution.contactName || institution.name},</p>
        <p>We weren't able to approve ${institution.name} for a Founda21 account. If you believe this
        is a mistake, reply to this email and we'll take another look.</p>
      `),
    });
  }

  redirect("/admin");
}

// Admin-triggered equivalent of the founder's own POPIA self-deletion (§
// deleteFounderAccount) — same cascade, no password re-check since the
// platform-admin session itself is the authorization here, just the
// type-to-confirm text.
export async function deleteFounderByAdmin(formData: FormData) {
  await requirePlatformAdmin();
  const founderId = String(formData.get("founderId") ?? "");
  const confirmText = String(formData.get("confirmText") ?? "").trim();
  if (!founderId) redirect("/admin/founders");

  if (confirmText !== "DELETE") {
    redirect(`/admin/founders/${founderId}?error=${encodeURIComponent('Type DELETE (in capitals) to confirm.')}`);
  }

  const founder = await prisma.founder.findUnique({ where: { id: founderId } });
  if (!founder) redirect("/admin/founders");

  // Prisma cascade deletes every child row (submissions, scores, stage
  // statuses, memberships, eligibility, outcomes, assessment attempts).
  await prisma.founder.delete({ where: { id: founderId } });

  const admin = createAdminClient();
  await admin.auth.admin.deleteUser(founder.userId);

  redirect("/admin/founders");
}

// Deletes an institution and everything scoped to it. Founders are
// portable across institutions (§ non-negotiable), so a naive cascade
// through Cohort -> Founder.cohortId would silently destroy a founder who
// still has real progress with a DIFFERENT institution, just because this
// institution happened to be their first one. Before deleting, any founder
// whose cohortId points into this institution gets reassigned to a
// surviving membership elsewhere, if one exists; only founders with no
// other institution actually cascade away with this one.
export async function deleteInstitutionByAdmin(formData: FormData) {
  await requirePlatformAdmin();
  const institutionId = String(formData.get("institutionId") ?? "");
  const confirmText = String(formData.get("confirmText") ?? "").trim();
  if (!institutionId) redirect("/admin");

  if (confirmText !== "DELETE") {
    redirect(`/admin/institutions/${institutionId}?error=${encodeURIComponent('Type DELETE (in capitals) to confirm.')}`);
  }

  const institution = await prisma.institution.findUnique({ where: { id: institutionId } });
  if (!institution) redirect("/admin");

  await prisma.$transaction(async (tx) => {
    const atRiskFounders = await tx.founder.findMany({
      where: { cohort: { institutionId } },
      select: { id: true },
    });

    for (const { id: founderId } of atRiskFounders) {
      const otherMembership = await tx.cohortMembership.findFirst({
        where: { founderId, cohort: { institutionId: { not: institutionId } } },
        select: { cohortId: true },
      });
      if (otherMembership) {
        await tx.founder.update({
          where: { id: founderId },
          data: { cohortId: otherMembership.cohortId },
        });
      }
      // No other membership: this founder only ever belonged to this
      // institution, so cascading them away with it is correct.
    }

    await tx.institution.delete({ where: { id: institutionId } });
  });

  const admin = createAdminClient();
  await admin.auth.admin.deleteUser(institution.adminUserId);

  redirect("/admin");
}
