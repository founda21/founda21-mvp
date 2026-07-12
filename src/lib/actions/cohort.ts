"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireInstitutionAdmin } from "@/lib/auth";
import { generateInviteCode } from "@/lib/invite-code";

export async function createCohort(formData: FormData) {
  const { institution } = await requireInstitutionAdmin();
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    redirect(`/dashboard/cohorts/new?error=${encodeURIComponent("Cohort name is required.")}`);
  }

  const intendedEntryStageRaw = Number(formData.get("intendedEntryStage") ?? 1);
  const intendedEntryStage = [1, 2, 3].includes(intendedEntryStageRaw) ? intendedEntryStageRaw : 1;

  const maxUsesRaw = String(formData.get("maxUses") ?? "").trim();
  const maxUses = maxUsesRaw ? Math.max(1, Math.round(Number(maxUsesRaw))) : null;
  if (maxUsesRaw && !Number.isFinite(maxUses)) {
    redirect(`/dashboard/cohorts/new?error=${encodeURIComponent("Max uses must be a number.")}`);
  }

  const expiresAtRaw = String(formData.get("expiresAt") ?? "").trim();
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;
  if (expiresAtRaw && Number.isNaN(expiresAt?.getTime())) {
    redirect(`/dashboard/cohorts/new?error=${encodeURIComponent("Invalid expiry date.")}`);
  }

  let inviteCode = generateInviteCode();
  for (let attempts = 0; attempts < 5; attempts++) {
    const existing = await prisma.cohort.findUnique({ where: { inviteCode } });
    if (!existing) break;
    inviteCode = generateInviteCode();
  }

  const cohort = await prisma.cohort.create({
    data: {
      institutionId: institution.id,
      name,
      inviteCode,
      intendedEntryStage,
      maxUses,
      expiresAt,
    },
  });

  redirect(`/dashboard/cohorts/${cohort.id}`);
}

// Funder-side shortlist toggle for the cohort roster (§ two-tab founder
// list — "All" / "Shortlist"). Scoped to the requesting institution via the
// membership's cohort, so one funder can never toggle another funder's view
// of a shared (portable) founder account.
export async function toggleShortlist(membershipId: string, cohortId: string) {
  const { institution } = await requireInstitutionAdmin();

  const membership = await prisma.cohortMembership.findUnique({
    where: { id: membershipId },
    include: { cohort: true },
  });
  if (!membership || membership.cohort.institutionId !== institution.id || membership.cohortId !== cohortId) {
    throw new Error("Membership not found.");
  }

  await prisma.cohortMembership.update({
    where: { id: membershipId },
    data: { shortlisted: !membership.shortlisted },
  });

  revalidatePath(`/dashboard/cohorts/${cohortId}`);
}
