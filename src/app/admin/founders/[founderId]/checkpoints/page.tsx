import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FounderCheckpointsView, founderCheckpointsInclude } from "@/components/founder-checkpoints-view";

export default async function AdminFounderCheckpointsPage({
  params,
}: {
  params: Promise<{ founderId: string }>;
}) {
  const { founderId } = await params;
  await requirePlatformAdmin();

  const founder = await prisma.founder.findUnique({
    where: { id: founderId },
    include: founderCheckpointsInclude,
  });
  if (!founder) notFound();

  return <FounderCheckpointsView founder={founder} basePath="/admin" />;
}
