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
