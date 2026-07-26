import Link from "next/link";
import { CHECKPOINTS } from "@/lib/checkpoints";
import { ventureStageLabel } from "@/lib/venture-stage";
import { annualTurnoverBandLabel, entityTypeLabel } from "@/lib/founder-eligibility";
import { Badge, ErrorBanner, InfoBanner } from "@/components/ui";
import { CheckpointStatusGrid, type CheckpointStatusItem } from "@/components/checkpoint-status-grid";
import { FounderNudgeForm } from "@/components/founder-nudge-form";
import type { ScoringOutput } from "@/lib/scoring/schema";
import { Prisma } from "@/generated/prisma/client";

export const founderOverviewInclude = {
  stageStatuses: true,
  submissions: { include: { score: true }, orderBy: { attemptNumber: "asc" } },
  eligibility: true,
  outcomes: { orderBy: { snapshotDate: "desc" }, take: 1 },
  memberships: { include: { cohort: true } },
} satisfies Prisma.FounderInclude;

export type FounderWithDetails = Prisma.FounderGetPayload<{ include: typeof founderOverviewInclude }>;

function formatZar(amount: number) {
  return `R${amount.toLocaleString("en-ZA")}`;
}

export function FounderOverviewView({
  founder,
  backHref,
  backLabel,
  basePath = "/dashboard",
  institutionId,
  message,
  error,
}: {
  founder: FounderWithDetails;
  backHref: string;
  backLabel: string;
  basePath?: string;
  // Only passed from the funder-side dashboard (never admin) — gates the
  // "ask this founder to continue" nudge form, which is a funder→founder
  // relationship, not something a platform admin should be doing.
  institutionId?: string;
  message?: string;
  error?: string;
}) {
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
      <ErrorBanner message={error} />
      <InfoBanner message={message} />
      <div className="flex flex-col gap-1">
        <Link href={backHref} className="text-navy/50 text-xs hover:underline">
          ← {backLabel}
        </Link>
        {founder.memberships.length > 1 && (
          <p className="text-navy/50 text-xs">
            Also a member of {founder.memberships.length - 1} other cohort
            {founder.memberships.length - 1 > 1 ? "s" : ""}, this founder&apos;s account is shared across
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
        <p className="text-navy/60 text-xs">
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
                  <span className="text-navy/60">Black ownership</span>{" "}
                  <span className="font-semibold text-navy">{founder.eligibility.blackOwnershipPct}%</span>
                </span>
                <span className="text-navy/60">
                  <span className="text-navy/60">Black women ownership</span>{" "}
                  <span className="font-semibold text-navy">{founder.eligibility.blackWomenOwnershipPct}%</span>
                </span>
                <span className="text-navy/60">
                  <span className="text-navy/60">Turnover</span>{" "}
                  <span className="font-semibold text-navy">
                    {annualTurnoverBandLabel(founder.eligibility.annualTurnoverBand)}
                  </span>
                </span>
                <span className="text-navy/60">
                  <span className="text-navy/60">Entity</span>{" "}
                  <span className="font-semibold text-navy">{entityTypeLabel(founder.eligibility.entityType)}</span>
                </span>
              </>
            )}
            {outcome && (
              <>
                <span className="text-navy/60">
                  <span className="text-navy/60">Capital raised</span>{" "}
                  <span className="font-semibold text-navy">{formatZar(outcome.capitalRaisedZar)}</span>
                </span>
                <span className="text-navy/60">
                  <span className="text-navy/60">Headcount</span>{" "}
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
            href={`${basePath}/founders/${founder.id}/summary`}
            className="rounded-full bg-emerald text-white px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Summary →
          </Link>
          <Link
            href={`${basePath}/founders/${founder.id}/checkpoints`}
            className="rounded-full border border-navy text-navy px-6 py-2.5 text-sm font-semibold hover:bg-brand hover:text-white transition-colors"
          >
            View full checkpoint details →
          </Link>
        </div>
      </div>

      <CheckpointStatusGrid founderId={founder.id} items={checkpointStatusItems} basePath={basePath} />

      {(belowThreshold.length > 0 || notAttempted.length > 0) && (
        <div className="rounded-xl border border-navy/10 bg-navy/[0.03] p-5 flex flex-col gap-3">
          <p className="text-navy font-semibold text-sm">Needs attention</p>
          {belowThreshold.map(({ checkpoint, output }) => (
            <div key={checkpoint.id} className="rounded-lg border border-amber-300 bg-amber-50 p-3">
              <p className="text-navy text-sm font-semibold">
                CP{checkpoint.id} · {checkpoint.name}{" "}
                <span className="text-navy/50 font-normal">({output?.checkpoint_score}/100)</span>
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

      {institutionId && (
        <FounderNudgeForm
          founderId={founder.id}
          founderName={founder.fullName}
          currentStage={founder.currentStage}
          investable={investable}
          redirectTo={`${basePath}/founders/${founder.id}`}
        />
      )}
    </div>
  );
}
