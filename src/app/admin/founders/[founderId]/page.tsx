import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FounderOverviewView, founderOverviewInclude } from "@/components/founder-overview-view";
import { FounderTimeline } from "@/components/founder-timeline";

export default async function AdminFounderOverviewPage({
  params,
}: {
  params: Promise<{ founderId: string }>;
}) {
  const { founderId } = await params;
  await requirePlatformAdmin();

  const founder = await prisma.founder.findUnique({
    where: { id: founderId },
    include: founderOverviewInclude,
  });
  if (!founder) notFound();

  // Platform admin isn't scoped to one institution's cohort, so the back
  // link goes to the founder's first membership's institution rather than a
  // specific cohort the admin arrived from.
  const homeMembership = founder.memberships[0];

  return (
    <div className="flex flex-col gap-8">
      <FounderOverviewView
        founder={founder}
        basePath="/admin"
        backHref={homeMembership ? `/admin/institutions/${homeMembership.cohort.institutionId}` : "/admin"}
        backLabel={homeMembership ? homeMembership.cohort.name : "Back to institutions"}
      />
      <div className="max-w-4xl mx-auto w-full">
        <FounderTimeline founderCreatedAt={founder.createdAt} submissions={founder.submissions} />
      </div>
    </div>
  );
}
