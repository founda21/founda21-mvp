import Link from "next/link";
import { notFound } from "next/navigation";
import { requireInstitutionAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CHECKPOINTS } from "@/lib/checkpoints";
import { ventureStageLabel } from "@/lib/venture-stage";
import { annualTurnoverBandLabel, entityTypeLabel } from "@/lib/founder-eligibility";
import { Badge } from "@/components/ui";
import { CheckpointStatusGrid, type CheckpointStatusItem } from "@/components/checkpoint-status-grid";
import type { ScoringOutput } from "@/lib/scoring/schema";

function formatZar(amount: number) {
  return `R${amount.toLocaleString("en-ZA")}`;
}

export default async function FounderOverviewPage({
  params,
}: {
  params: Promise<{ founderId: string }>;
}) {
  const { founderId } = await params;
  const { institution } = await requireInstitutionAdmin();

  const founder = await prisma.founder.findUnique({
    where: { id: founderId },
    include: {
      stageStatuses: true,
      submissions: { include: { score: true }, orderBy: { attemptNumber: "asc" } },
      eligibility: true,
      outcomes: { orderBy: { snapshotDate: "desc" }, take: 1 },
      // Founder accounts are portable across institutions (§ CohortMembership)
      // — an institution can view this founder if they share ANY cohort
      // membership, not just the founder's original home cohort.
      memberships: { include: { cohort: true } },
    },
  });

  const membership = founder?.memberships.find((m) => m.cohort.institutionId === institution.id);
  if (!founder || !membership) notFound();

  const latestByCheckpoint = new Map<number, (typeof founder.submissions)[number]>();
  for (const submission of founder.submissions) {
    const existing = latestByCheckpoint.get(submission.checkpointId);
    if (!existing || submission.attemptNumber > existing.attemptNumber) {
      latestByCheckpoint.set(submission.checkpointId, submission);
    }
  }

  const stageStatusByStage = new Map(founder.stageStatuses.map((s) => [s.stage, s]));
  const investable = stageStatusByStage.get(3)?.status === "passed";

  const checkpointStatus = CHECKPOINTS.map((c) => {
    const submission = latestByCheckpoint.get(c.id);
    const output = submission?.score?.dimensionsJson as ScoringOutput | undefined;
    return { checkpoint: c, output };
  });
  const passedCount = checkpointStatus.filter((c) => c.output?.passed).length;
  const belowThreshold = checkpointStatus.filter((c) => c.output && !c.output.passed);
  const notAttempted = checkpointStatus.filter((c) => !c.output);
  const outcome = founder.outcomes[0];

  const checkpointStatusItems: CheckpointStatusItem[] = checkpointStatus.map(({ checkpoint, output }) => ({
    id: checkpoint.id,
    stage: checkpoint.stage,
    name: checkpoint.name,
    focus: checkpoint.focus,
    score: output?.checkpoint_score ?? null,
    passed: output?.passed ?? false,
    attempted: !!output,
  }));

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div className="flex flex-col gap-1">
        <Link href={`/dashboard/cohorts/${membership.cohort.id}`} className="text-navy/50 text-xs hover:underline">
          ← {membership.cohort.name}
        </Link>
        {founder.memberships.length > 1 && (
          <p className="text-navy/30 text-xs">
            Also a member of {founder.memberships.length - 1} other cohort
            {founder.memberships.length - 1 > 1 ? "s" : ""} — this founder&apos;s account is shared across
            institutions.
          </p>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-navy text-2xl font-bold">{founder.ventureName}</h1>
          {founder.ventureStage && <Badge tone="neutral">{ventureStageLabel(founder.ventureStage)}</Badge>}
          {investable ? (
            <Badge tone="success">Founda21 Investable</Badge>
          ) : (
            <Badge tone="neutral">Stage {founder.currentStage} in progress</Badge>
          )}
        </div>
        <p className="text-navy/60 text-sm">
          {founder.fullName} · {founder.ventureType}
        </p>
        <p className="text-navy/40 text-xs">
          Joined {founder.createdAt.toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        {(founder.startupSummary || founder.bio) && (
          <div className="rounded-xl bg-navy/[0.05] border border-navy/10 p-4 mt-3 flex flex-col gap-2">
            {founder.startupSummary && <p className="text-navy text-sm font-medium">{founder.startupSummary}</p>}
            {founder.bio && <p className="text-navy/70 text-sm">{founder.bio}</p>}
          </div>
        )}

        {(founder.eligibility || outcome) && (
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm mt-3 border-t border-navy/10 pt-3">
            {founder.eligibility && (
              <>
                <span className="text-navy/60">
                  <span className="text-navy/40">Black ownership</span>{" "}
                  <span className="font-semibold text-navy">{founder.eligibility.blackOwnershipPct}%</span>
                </span>
                <span className="text-navy/60">
                  <span className="text-navy/40">Black women ownership</span>{" "}
                  <span className="font-semibold text-navy">{founder.eligibility.blackWomenOwnershipPct}%</span>
                </span>
                <span className="text-navy/60">
                  <span className="text-navy/40">Turnover</span>{" "}
                  <span className="font-semibold text-navy">
                    {annualTurnoverBandLabel(founder.eligibility.annualTurnoverBand)}
                  </span>
                </span>
                <span className="text-navy/60">
                  <span className="text-navy/40">Entity</span>{" "}
                  <span className="font-semibold text-navy">{entityTypeLabel(founder.eligibility.entityType)}</span>
                </span>
              </>
            )}
            {outcome && (
              <>
                <span className="text-navy/60">
                  <span className="text-navy/40">Capital raised</span>{" "}
                  <span className="font-semibold text-navy">{formatZar(outcome.capitalRaisedZar)}</span>
                </span>
                <span className="text-navy/60">
                  <span className="text-navy/40">Headcount</span>{" "}
                  <span className="font-semibold text-navy">{outcome.headcount}</span>
                </span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-navy/10 p-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-navy/50 text-xs uppercase font-semibold">Overall readiness</p>
          <p className="text-navy text-2xl font-bold">{passedCount} / 21 checkpoints passed</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            href={`/dashboard/founders/${founder.id}/summary`}
            className="rounded-full bg-emerald text-white px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Summary →
          </Link>
          <Link
            href={`/dashboard/founders/${founder.id}/checkpoints`}
            className="rounded-full border border-navy text-navy px-6 py-2.5 text-sm font-semibold hover:bg-navy hover:text-white transition-colors"
          >
            View full checkpoint details →
          </Link>
        </div>
      </div>

      <CheckpointStatusGrid founderId={founder.id} items={checkpointStatusItems} />

      {(belowThreshold.length > 0 || notAttempted.length > 0) && (
        <div className="rounded-xl border border-navy/10 bg-navy/[0.03] p-5 flex flex-col gap-3">
          <p className="text-navy font-semibold text-sm">Needs attention</p>
          {belowThreshold.map(({ checkpoint, output }) => (
            <div key={checkpoint.id} className="rounded-lg border border-amber-300 bg-amber-50 p-3">
              <p className="text-navy text-sm font-semibold">
                CP{checkpoint.id} · {checkpoint.name}{" "}
                <span className="text-navy/50 font-normal">— {output?.checkpoint_score}/100</span>
              </p>
              <p className="text-navy/70 text-xs mt-1">{output?.top_priority_fix}</p>
            </div>
          ))}
          {notAttempted.length > 0 && (
            <p className="text-navy/50 text-sm">
              Not yet attempted: {notAttempted.map((c) => `CP${c.checkpoint.id}`).join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
