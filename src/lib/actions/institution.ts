"use server";

import { redirect } from "next/navigation";
import { requireApprovedInstitutionAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateInstitutionDetails(formData: FormData) {
  const { institution } = await requireApprovedInstitutionAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();

  if (!name) {
    redirect(`/dashboard/settings?error=${encodeURIComponent("Organisation name can't be empty.")}`);
  }

  await prisma.institution.update({
    where: { id: institution.id },
    data: {
      name,
      contactName: contactName || null,
      contactEmail: contactEmail || null,
    },
  });

  redirect(`/dashboard/settings?message=${encodeURIComponent("Organisation details updated.")}`);
}

// One-time agreement to display the co-branded recruitment card ("in
// partnership with Founda21") — Founda21's own marketing, not just a
// download. The checkbox's disabled-button gating on the client is only a
// UX nicety, not a security boundary (a hydration mismatch, or just editing
// the DOM, can bypass it) — the actual "did they agree" check has to happen
// here, server-side, against real form data, same lesson as the
// institution-approval gate. Recorded once, then never re-asked; the file
// itself is served by redirecting into card.pdf, which still separately
// checks marketingCardConsentedAt (§ card.pdf route.ts) so the agreement
// can't be skipped by hitting the file URL directly either.
export async function consentToMarketingCard(formData: FormData) {
  const { institution } = await requireApprovedInstitutionAdmin();
  const cohortId = String(formData.get("cohortId") ?? "");
  const agreed = formData.get("agree") === "yes";

  if (!agreed) {
    redirect(`/dashboard/cohorts/${cohortId}?error=${encodeURIComponent("You must agree before downloading the card.")}`);
  }

  if (!institution.marketingCardConsentedAt) {
    await prisma.institution.update({
      where: { id: institution.id },
      data: { marketingCardConsentedAt: new Date() },
    });
  }

  redirect(`/dashboard/cohorts/${cohortId}/card.pdf`);
}
