import { notFound } from "next/navigation";
import { requireInstitutionAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CHECKPOINTS } from "@/lib/checkpoints";
import {
  FounderCheckpointDetailView,
  founderCheckpointDetailInclude,
} from "@/components/founder-checkpoint-detail-view";

export default async function FounderSingleCheckpointPage({
  params,
}: {
  params: Promise<{ founderId: string; checkpointId: string }>;
}) {
  const { founderId, checkpointId: checkpointIdRaw } = await params;
  const checkpointId = Number(checkpointIdRaw);
  const checkpoint = CHECKPOINTS.find((c) => c.id === checkpointId);
  if (!checkpoint) notFound();

  const { institution } = await requireInstitutionAdmin();

  const founder = await prisma.founder.findUnique({
    where: { id: founderId },
    include: founderCheckpointDetailInclude(checkpointId),
  });

  const hasAccess = founder?.memberships.some((m) => m.cohort.institutionId === institution.id);
  if (!founder || !hasAccess) notFound();

  return <FounderCheckpointDetailView founder={founder} checkpoint={checkpoint} />;
}
