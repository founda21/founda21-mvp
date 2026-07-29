import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FounderOverviewView, founderOverviewInclude } from "@/components/founder-overview-view";
import { FounderTimeline } from "@/components/founder-timeline";
import { AdminDeleteRecord } from "@/components/admin-delete-record";
import { deleteFounderByAdmin } from "@/lib/actions/platform-admin";

export default async function AdminFounderOverviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ founderId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { founderId } = await params;
  const { error } = await searchParams;
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
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-8">
        <FounderTimeline founderCreatedAt={founder.createdAt} submissions={founder.submissions} />
        <AdminDeleteRecord
          title="Permanently delete this founder"
          description={`This deletes ${founder.fullName}'s login, every checkpoint submission and score, eligibility/outcome data, and identity records, across every funder they've joined. This cannot be undone.`}
          action={deleteFounderByAdmin}
          hiddenFields={{ founderId: founder.id }}
          error={error}
        />
      </div>
    </div>
  );
}
