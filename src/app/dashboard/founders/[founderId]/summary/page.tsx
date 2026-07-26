import { notFound } from "next/navigation";
import { requireInstitutionAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FounderSummaryView, founderSummaryInclude } from "@/components/founder-summary-view";

export default async function FounderSummaryPage({
  params,
}: {
  params: Promise<{ founderId: string }>;
}) {
  const { founderId } = await params;
  const { institution } = await requireInstitutionAdmin();

  const founder = await prisma.founder.findUnique({
    where: { id: founderId },
    include: founderSummaryInclude,
  });

  const membership = founder?.memberships.find((m) => m.cohort.institutionId === institution.id);
  if (!founder || !membership) notFound();

  return <FounderSummaryView founder={founder} />;
}
