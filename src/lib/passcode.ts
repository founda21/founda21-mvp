import { prisma } from "@/lib/prisma";
import type { Cohort } from "@/generated/prisma/client";

export type PasscodeValidation = { ok: true; cohort: Cohort } | { ok: false; reason: string };

// A Cohort's inviteCode *is* the spec's passcode. Founders always enter it
// manually on /get-started/founder (no per-cohort direct link) — validated
// here against active/expiresAt/maxUses.
export async function validatePasscode(code: string): Promise<PasscodeValidation> {
  const cohort = await prisma.cohort.findUnique({ where: { inviteCode: code } });
  if (!cohort) return { ok: false, reason: "Invalid passcode." };
  if (!cohort.active) return { ok: false, reason: "This passcode is no longer active." };
  if (cohort.expiresAt && cohort.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "This passcode has expired." };
  }
  if (cohort.maxUses !== null && cohort.usesCount >= cohort.maxUses) {
    return { ok: false, reason: "This passcode has reached its usage limit." };
  }
  return { ok: true, cohort };
}

// Increments usesCount only for a genuinely new membership — call this right
// after a CohortMembership is first created for a founder in this cohort, not
// on an idempotent re-join (§ ensureCohortMembership already no-ops those).
export async function recordPasscodeUse(cohortId: string) {
  await prisma.cohort.update({
    where: { id: cohortId },
    data: { usesCount: { increment: 1 } },
  });
}
