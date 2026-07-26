import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isPlatformAdminEmail } from "@/lib/platform-admin";

export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireInstitutionAdmin() {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const institution = await prisma.institution.findUnique({
    where: { adminUserId: user.id },
  });
  if (!institution) redirect("/login");

  return { user, institution };
}

// Stricter than requireInstitutionAdmin() — also enforces the manual
// approval gate (§ InstitutionStatus). Layouts don't wrap Server Actions or
// Route Handlers, so a UI-only check in dashboard/layout.tsx can be bypassed
// by invoking an action/route directly while pending or rejected. Every
// mutating action and route that touches institution-scoped data must use
// this, not the plain requireInstitutionAdmin(), which the layout itself
// still uses since it needs the raw status to pick which screen to render.
export async function requireApprovedInstitutionAdmin() {
  const result = await requireInstitutionAdmin();
  if (result.institution.status !== "approved") redirect("/dashboard");
  return result;
}

export async function requirePlatformAdmin() {
  const user = await getAuthUser();
  if (!user || !isPlatformAdminEmail(user.email)) redirect("/login");
  return { user };
}

export async function requireFounder() {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const founder = await prisma.founder.findUnique({
    where: { userId: user.id },
    include: { cohort: true },
  });
  if (!founder) redirect("/login");

  return { user, founder };
}
