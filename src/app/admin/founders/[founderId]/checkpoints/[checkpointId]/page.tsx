import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CHECKPOINTS } from "@/lib/checkpoints";
import {
  FounderCheckpointDetailView,
  founderCheckpointDetailInclude,
} from "@/components/founder-checkpoint-detail-view";

export default async function AdminFounderSingleCheckpointPage({
  params,
}: {
  params: Promise<{ founderId: string; checkpointId: string }>;
}) {
  const { founderId, checkpointId: checkpointIdRaw } = await params;
  const checkpointId = Number(checkpointIdRaw);
  const checkpoint = CHECKPOINTS.find((c) => c.id === checkpointId);
  if (!checkpoint) notFound();

  await requirePlatformAdmin();

  const founder = await prisma.founder.findUnique({
    where: { id: founderId },
    include: founderCheckpointDetailInclude(checkpointId),
  });
  if (!founder) notFound();

  return <FounderCheckpointDetailView founder={founder} checkpoint={checkpoint} basePath="/admin" />;
}
