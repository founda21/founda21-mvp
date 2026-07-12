import { notFound } from "next/navigation";
import { requireInstitutionAdmin } from "@/lib/auth";
import { getCohortReport } from "@/lib/cohort-report";
import { ventureStageLabel } from "@/lib/venture-stage";
import { prisma } from "@/lib/prisma";
import { FounderSearchList, type FounderListItem } from "@/components/founder-search-list";
import { BackLink } from "@/components/back-link";

export default async function CohortDetailPage({
  params,
}: {
  params: Promise<{ cohortId: string }>;
}) {
  const { cohortId } = await params;
  const { institution } = await requireInstitutionAdmin();

  const cohort = await prisma.cohort.findUnique({ where: { id: cohortId } });
  if (!cohort || cohort.institutionId !== institution.id) notFound();

  const report = await getCohortReport(cohortId);
  if (!report) notFound();

  const founderItems: FounderListItem[] = report.rows.map((row) => ({
    founderId: row.founderId,
    membershipId: row.membershipId,
    fullName: row.fullName,
    ventureName: row.ventureName,
    ventureType: row.ventureType,
    ventureStageLabel: ventureStageLabel(row.ventureStage),
    currentStage: row.currentStage,
    investable: row.investable,
    passedCount: Object.values(row.checkpoints).filter((c) => c.passed).length,
    totalPoints: row.totalPoints,
    rank: row.rank,
    shortlisted: row.shortlisted,
  }));

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <BackLink href="/dashboard" label="Back to cohorts" />
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-navy text-2xl font-bold">{report.cohortName}</h1>
        <a
          href={`/dashboard/cohorts/${cohortId}/export.csv`}
          className="rounded-full border border-navy text-navy px-5 py-2 text-sm font-semibold hover:bg-navy hover:text-white transition-colors"
        >
          Export CSV
        </a>
      </div>

      <div className="rounded-xl border border-navy/10 bg-navy/[0.03] px-5 py-4 flex flex-col gap-1">
        <p className="text-navy text-sm font-semibold">Passcode</p>
        <p className="text-navy text-2xl font-mono font-bold tracking-wide">{cohort.inviteCode}</p>
        <p className="text-navy/50 text-xs mt-1">
          Share this code with founders — they go to founda21.com, choose &quot;I&apos;m a
          Founder,&quot; and enter it there.
          {cohort.maxUses !== null && ` Uses: ${cohort.usesCount}/${cohort.maxUses}.`}
          {cohort.expiresAt &&
            ` Expires ${cohort.expiresAt.toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}.`}
          {!cohort.active && " This passcode is currently inactive."}
        </p>
      </div>

      <div className="flex gap-6 flex-wrap">
        {[1, 2, 3].map((stage) => (
          <div key={stage} className="rounded-xl border border-navy/10 px-5 py-4 min-w-[140px]">
            <p className="text-navy/50 text-xs uppercase font-semibold">Stage {stage} passed</p>
            <p className="text-navy text-2xl font-bold">{report.stagePassRates[stage]}%</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-navy/10 p-5">
        <p className="text-navy font-semibold text-sm mb-3">M&amp;E summary</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-navy/50 text-xs uppercase font-semibold">ESD eligible</p>
            <p className="text-navy font-semibold">{report.meExport.esdEligibleCount} / {report.meExport.totalAssessed}</p>
          </div>
          <div>
            <p className="text-navy/50 text-xs uppercase font-semibold">Black women-owned</p>
            <p className="text-navy font-semibold">{report.meExport.blackWomenOwnedCount}</p>
          </div>
          <div>
            <p className="text-navy/50 text-xs uppercase font-semibold">Total capital raised</p>
            <p className="text-navy font-semibold">R{report.meExport.outcomes.totalCapitalRaisedZar.toLocaleString("en-ZA")}</p>
          </div>
          <div>
            <p className="text-navy/50 text-xs uppercase font-semibold">Still operating</p>
            <p className="text-navy font-semibold">{report.meExport.outcomes.stillOperatingCount} / {report.meExport.totalAssessed}</p>
          </div>
        </div>
      </div>

      <p className="text-navy/40 text-xs">
        Ranked by total points (sum of every checkpoint score) — highest first.
      </p>
      <FounderSearchList founders={founderItems} cohortId={cohortId} />

      {report.rows.length === 0 && (
        <p className="text-navy/60 text-sm">
          No founders have joined this cohort yet. Share the passcode above.
        </p>
      )}
    </div>
  );
}
