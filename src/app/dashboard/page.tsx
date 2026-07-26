import Link from "next/link";
import { requireInstitutionAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PrimaryButton, SecondaryButton, Badge } from "@/components/ui";
import { funderTypeLabel } from "@/lib/funder-type";
import { FUNDER_STAGE_GUIDANCE } from "@/lib/funder-stage-guidance";

export default async function DashboardHomePage() {
  const { institution } = await requireInstitutionAdmin();

  const cohorts = await prisma.cohort.findMany({
    where: { institutionId: institution.id },
    include: { _count: { select: { founders: true } } },
  });
  const totalFounders = cohorts.reduce((sum, c) => sum + c._count.founders, 0);
  const guidance = FUNDER_STAGE_GUIDANCE[institution.funderType];

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-navy text-2xl font-bold">Welcome back, {institution.name}</h1>
        <p className="text-navy/60 text-sm mt-1">{funderTypeLabel(institution.funderType)}</p>
      </div>

      <div className="flex gap-6 flex-wrap">
        <div className="rounded-xl border border-navy/10 px-5 py-4 min-w-[140px]">
          <p className="text-navy/50 text-xs uppercase font-semibold">Cohorts</p>
          <p className="text-navy text-2xl font-bold">{cohorts.length}</p>
        </div>
        <div className="rounded-xl border border-navy/10 px-5 py-4 min-w-[140px]">
          <p className="text-navy/50 text-xs uppercase font-semibold">Founders enrolled</p>
          <p className="text-navy text-2xl font-bold">{totalFounders}</p>
        </div>
      </div>

      <div className="rounded-xl border border-emerald/30 bg-emerald/5 p-5 flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-navy font-semibold text-sm">Which stage should you require?</p>
          <Badge tone="success">Stage {guidance.recommendedStage} recommended for you</Badge>
        </div>
        <p className="text-navy/70 text-sm">
          <span className="font-semibold">Typical founders you&apos;re seeing:</span> {guidance.founderProfile}
        </p>
        <p className="text-navy/70 text-sm">{guidance.rationale}</p>
        <p className="text-navy/50 text-xs mt-1">
          You set this per cohort, on the cohort creation form, this is guidance, not a restriction, you can
          require whichever stage actually fits a given recruitment drive.
        </p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Link href="/dashboard/cohorts">
          <PrimaryButton type="button">View your cohorts →</PrimaryButton>
        </Link>
        <Link href="/dashboard/cohorts/new">
          <SecondaryButton type="button">Create a new cohort</SecondaryButton>
        </Link>
      </div>
    </div>
  );
}
