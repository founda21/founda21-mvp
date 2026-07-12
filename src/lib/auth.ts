import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

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
