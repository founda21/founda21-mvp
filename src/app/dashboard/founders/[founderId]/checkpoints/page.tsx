import { notFound } from "next/navigation";
import { requireInstitutionAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FounderCheckpointsView, founderCheckpointsInclude } from "@/components/founder-checkpoints-view";

export default async function FounderCheckpointsPage({
  params,
}: {
  params: Promise<{ founderId: string }>;
}) {
  const { founderId } = await params;
  const { institution } = await requireInstitutionAdmin();

  const founder = await prisma.founder.findUnique({
    where: { id: founderId },
    include: founderCheckpointsInclude,
  });

  const hasAccess = founder?.memberships.some((m) => m.cohort.institutionId === institution.id);
  if (!founder || !hasAccess) notFound();

  return <FounderCheckpointsView founder={founder} />;
}
