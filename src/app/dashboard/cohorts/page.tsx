import Link from "next/link";
import { requireInstitutionAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PrimaryButton } from "@/components/ui";
import { BackLink } from "@/components/back-link";

export default async function CohortsPage() {
  const { institution } = await requireInstitutionAdmin();

  const cohorts = await prisma.cohort.findMany({
    where: { institutionId: institution.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { founders: true } } },
  });

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <BackLink href="/dashboard" label="Back to dashboard" />
      <div className="flex items-center justify-between">
        <h1 className="text-navy text-2xl font-bold">Cohorts</h1>
        <Link href="/dashboard/cohorts/new">
          <PrimaryButton type="button">New cohort</PrimaryButton>
        </Link>
      </div>

      {cohorts.length === 0 ? (
        <p className="text-navy/60 text-sm">
          No cohorts yet. Create one to start inviting founders.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-navy/10 border border-navy/10 rounded-xl overflow-hidden">
          {cohorts.map((cohort) => (
            <Link
              key={cohort.id}
              href={`/dashboard/cohorts/${cohort.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-navy/5 transition-colors"
            >
              <div>
                <p className="text-navy font-semibold">{cohort.name}</p>
                <p className="text-navy/50 text-xs">
                  {cohort._count.founders} founder{cohort._count.founders === 1 ? "" : "s"} · Stage {cohort.intendedEntryStage} required
                </p>
              </div>
              <span className="text-navy/60 text-sm">View →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
