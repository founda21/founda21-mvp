import { notFound } from "next/navigation";
import { requireInstitutionAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FounderOverviewView, founderOverviewInclude } from "@/components/founder-overview-view";

export default async function FounderOverviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ founderId: string }>;
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const { founderId } = await params;
  const { message, error } = await searchParams;
  const { institution } = await requireInstitutionAdmin();

  const founder = await prisma.founder.findUnique({
    where: { id: founderId },
    include: founderOverviewInclude,
  });

  // Founder accounts are portable across institutions (§ CohortMembership)
  // — an institution can view this founder if they share ANY cohort
  // membership, not just the founder's original home cohort.
  const membership = founder?.memberships.find((m) => m.cohort.institutionId === institution.id);
  if (!founder || !membership) notFound();

  return (
    <FounderOverviewView
      founder={founder}
      backHref={`/dashboard/cohorts/${membership.cohort.id}`}
      backLabel={membership.cohort.name}
      institutionId={institution.id}
      message={message}
      error={error}
    />
  );
}
