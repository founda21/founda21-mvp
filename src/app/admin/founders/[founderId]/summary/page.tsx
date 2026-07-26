import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FounderSummaryView, founderSummaryInclude } from "@/components/founder-summary-view";

export default async function AdminFounderSummaryPage({
  params,
}: {
  params: Promise<{ founderId: string }>;
}) {
  const { founderId } = await params;
  await requirePlatformAdmin();

  const founder = await prisma.founder.findUnique({
    where: { id: founderId },
    include: founderSummaryInclude,
  });
  if (!founder) notFound();

  return <FounderSummaryView founder={founder} basePath="/admin" />;
}
