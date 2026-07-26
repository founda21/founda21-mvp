import Link from "next/link";
import { requireFounder } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStageProgress, type CheckpointProgress } from "@/lib/stage-gating";
import { getActiveCooldownSummary, type GapCategory } from "@/lib/attempts";
import { Badge, ErrorBanner, InfoBanner } from "@/components/ui";
import { FounderTabs } from "@/components/founder-tabs";
import { CheckpointStatusGrid, type CheckpointStatusItem } from "@/components/checkpoint-status-grid";
import { ventureStageLabel, ventureStageRank } from "@/lib/venture-stage";
import { CHECKPOINTS, STAGE_MIN_VENTURE_STAGE, type Stage } from "@/lib/checkpoints";
import { DIMENSION_NAMES, type ScoringOutput } from "@/lib/scoring/schema";

const GAP_LABELS: Record<GapCategory, string> = {
  not_attempted: "Not attempted",
  close: "Close, just below threshold",
  moderate_gap: "Moderate gap",
  significant_gap: "Significant gap",
  passed: "Passed",
};

const STAGE_NAMES: Record<Stage, string> = {
  1: "Idea & Reality",
  2: "Company & Traction",
  3: "Investor & Deal Readiness",
};

export default async function FounderHomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const { founder } = await requireFounder();

  const stageProgresses = await Promise.all(
    ([1, 2, 3] as Stage[]).map((stage) => getStageProgress(founder, stage)),
  );
  const cooldownSummaries = await Promise.all(
    ([1, 2, 3] as Stage[]).map((stage) => getActiveCooldownSummary(founder.id, stage)),
  );

  // Raw submissions/scores for the dimension-level breakdown below, plus
  // active enrolments for the "enrolled with" section — requireFounder()
  // only loads the home cohort, not this.
  const details = await prisma.founder.findUniqueOrThrow({
    where: { id: founder.id },
    include: {
      submissions: { include: { score: true }, orderBy: { attemptNumber: "asc" } },
      memberships: {
        where: { status: "active" },
        include: { cohort: { include: { institution: true } } },
      },
    },
  });

  const latestByCheckpoint = new Map<number, (typeof details.submissions)[number]>();
  for (const submission of details.submissions) {
    const existing = latestByCheckpoint.get(submission.checkpointId);
    if (!existing || submission.attemptNumber > existing.attemptNumber) {
      latestByCheckpoint.set(submission.checkpointId, submission);
    }
  }

  // Dimension breakdown: average of every scored dimension across every
  // attempted checkpoint (out of 20) — real, computed-from-scores insight
  // into where this venture is strong/weak, useful even after Investable.
  const dimensionTotals = new Map<string, { sum: number; count: number }>(
    DIMENSION_NAMES.map((d) => [d, { sum: 0, count: 0 }]),
  );
  for (const submission of Array.from(latestByCheckpoint.values())) {
    const output = submission.score?.dimensionsJson as ScoringOutput | undefined;
    if (!output) continue;
    for (const dim of output.dimensions) {
      const totals = dimensionTotals.get(dim.dimension);
      if (totals) {
        totals.sum += dim.score;
        totals.count += 1;
      }
    }
  }
  const dimensionAverages = DIMENSION_NAMES.map((name) => {
    const totals = dimensionTotals.get(name)!;
    return { name, average: totals.count > 0 ? totals.sum / totals.count : null };
  });
  const anyDimensionData = dimensionAverages.some((d) => d.average !== null);

  const checkpointStatusItems: CheckpointStatusItem[] = CHECKPOINTS.map((c) => {
    const submission = latestByCheckpoint.get(c.id);
    const output = submission?.score?.dimensionsJson as ScoringOutput | undefined;
    return {
      id: c.id,
      stage: c.stage,
      name: c.name,
      focus: c.focus,
      score: output?.checkpoint_score ?? null,
      passed: output?.passed ?? false,
      attempted: !!output,
    };
  });

  const enrolledInstitutions = Array.from(
    new Map(details.memberships.map((m) => [m.cohort.institution.id, m.cohort.institution])).values(),
  );

  const investable = stageProgresses[2].passed;
  const founderRank = ventureStageRank(founder.ventureStage);

  const passedCount = stageProgresses.reduce(
    (sum, p) => sum + p.checkpoints.filter((c) => c.passed).length,
    0,
  );
  const progressPct = Math.round((passedCount / 21) * 100);

  // Locked/cooldown status per stage, computed once and reused for both the
  // "continue" CTA and the stage cards below.
  const stageMeta = stageProgresses.map((progress, i) => {
    const stage = progress.stage;
    const sequentialLocked = stage > founder.currentStage;
    const requiredRank = ventureStageRank(STAGE_MIN_VENTURE_STAGE[stage]);
    const ventureStageLocked =
      !sequentialLocked && founderRank !== null && requiredRank !== null && founderRank < requiredRank;
    return {
      progress,
      locked: sequentialLocked || ventureStageLocked,
      ventureStageLocked,
      cooldown: cooldownSummaries[i],
    };
  });

  // The single most useful thing a founder can do right now — the first
  // unlocked, non-cooldown, not-yet-passed checkpoint across all stages.
  let nextCheckpoint: { stage: Stage; checkpoint: CheckpointProgress } | null = null;
  for (const meta of stageMeta) {
    if (meta.locked || meta.cooldown) continue;
    const next = meta.progress.checkpoints.find((c) => !c.passed);
    if (next) {
      nextCheckpoint = { stage: meta.progress.stage, checkpoint: next };
      break;
    }
  }

  const needsAttention = stageMeta
    .filter((meta) => !meta.locked)
    .flatMap((meta) => meta.progress.checkpoints.filter((c) => c.score !== null && !c.passed));

  const activeCooldowns = stageMeta.filter((meta) => meta.cooldown);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-navy text-2xl font-bold">{founder.ventureName}</h1>
          {investable ? (
            <Badge tone="success">Founda21 Investable</Badge>
          ) : (
            <Badge tone="neutral">Stage {founder.currentStage} in progress</Badge>
          )}
        </div>
        <p className="text-navy/60 text-sm mt-1">
          {founder.fullName} · {founder.ventureType} · {ventureStageLabel(founder.ventureStage)}
        </p>
      </div>

      <FounderTabs active="/founder" />

      <ErrorBanner message={error} />
      <InfoBanner message={message} />

      {/* Readiness overview — always visible, whether or not the venture is
          investable yet. This is the tracking dashboard: overall progress
          plus a per-dimension breakdown computed directly from every scored
          checkpoint, so there's still real signal on where to improve even
          after all 21 checkpoints have passed. */}
      <div className="rounded-xl border border-navy/10 p-6 flex flex-col gap-5">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-navy/50 text-xs uppercase font-semibold">Overall readiness</p>
            <p className="text-navy text-3xl font-bold mt-1">{progressPct}%</p>
            <p className="text-navy/50 text-xs mt-1">{passedCount} / 21 checkpoints passed</p>
          </div>
          {investable && (
            <div className="text-right max-w-xs">
              <p className="text-navy/70 text-sm">
                All 21 checkpoints cleared. This credential is visible to every funder you&apos;re
                enrolled with, and stays with you if you join another.
              </p>
            </div>
          )}
        </div>
        <div className="h-2 rounded-full bg-navy/10 overflow-hidden">
          <div className="h-full bg-emerald rounded-full transition-all" style={{ width: `${progressPct}%` }} />
        </div>

        {anyDimensionData && (
          <div className="border-t border-navy/10 pt-4 flex flex-col gap-2.5">
            <p className="text-navy/50 text-xs uppercase font-semibold">Dimension breakdown</p>
            <p className="text-navy/50 text-xs -mt-1.5">
              Average score per dimension across every checkpoint attempted so far, out of 20.
            </p>
            {dimensionAverages.map((d) => (
              <div key={d.name} className="flex items-center gap-3">
                <p className="text-navy text-xs w-40 shrink-0">{d.name}</p>
                <div className="flex-1 h-2 rounded-full bg-navy/10 overflow-hidden">
                  <div
                    className="h-full bg-navy rounded-full transition-all"
                    style={{ width: `${((d.average ?? 0) / 20) * 100}%` }}
                  />
                </div>
                <p className="text-navy/60 text-xs w-14 text-right shrink-0">
                  {d.average !== null ? `${d.average.toFixed(1)}/20` : "—"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeCooldowns.map((meta) => (
        <div key={meta.progress.stage} className="rounded-xl border border-amber-300 bg-amber-50 px-6 py-5 flex flex-col gap-2">
          <p className="text-navy font-semibold text-sm">
            Stage {meta.progress.stage}: attempt {meta.cooldown!.attemptNumber} didn&apos;t clear
          </p>
          <p className="text-navy/70 text-xs">
            You can retry from{" "}
            {meta.cooldown!.cooldownUntil.toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}.
            Here&apos;s where the gaps were, not the numbers, just where to focus:
          </p>
          <ul className="flex flex-col gap-1 mt-1">
            {meta.cooldown!.checkpointOutcomes
              .filter((c) => !c.passed)
              .map((c) => (
                <li key={c.checkpointId} className="text-navy/70 text-xs">
                  <span className="font-semibold text-navy">CP{c.checkpointId} · {c.name}</span>:{" "}
                  {GAP_LABELS[c.gapCategory]}
                </li>
              ))}
          </ul>
        </div>
      ))}

      {nextCheckpoint && (
        <Link
          href={`/founder/checkpoint/${nextCheckpoint.checkpoint.checkpointId}`}
          className="rounded-xl bg-brand text-white px-6 py-5 flex items-center justify-between hover:opacity-90 transition-opacity"
        >
          <div>
            <p className="text-white/60 text-xs uppercase font-semibold">Continue where you left off</p>
            <p className="text-lg font-bold mt-0.5">
              CP{nextCheckpoint.checkpoint.checkpointId} · {nextCheckpoint.checkpoint.name}
            </p>
          </div>
          <span className="text-white/60 text-2xl">→</span>
        </Link>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stageMeta.map((meta) => {
          const { progress, locked, ventureStageLocked, cooldown } = meta;
          const stage = progress.stage;
          const active = stage === founder.currentStage && !ventureStageLocked;
          return (
            <div key={stage} className="rounded-xl border border-navy/10 px-4 py-3 flex flex-col gap-1.5">
              <p className="text-navy/50 text-xs uppercase font-semibold">
                Stage {stage} · {STAGE_NAMES[stage]}
              </p>
              <div>
                {ventureStageLocked ? (
                  <Badge tone="warning">Requires {ventureStageLabel(STAGE_MIN_VENTURE_STAGE[stage])}+</Badge>
                ) : locked ? (
                  <Badge tone="neutral">Locked</Badge>
                ) : progress.passed ? (
                  <Badge tone="success">Passed</Badge>
                ) : cooldown ? (
                  <Badge tone="warning">In cooldown</Badge>
                ) : (
                  <Badge tone={active ? "warning" : "neutral"}>In progress</Badge>
                )}
              </div>
              <p className="text-navy/60 text-xs">
                {progress.checkpoints.filter((c) => c.passed).length}/{progress.checkpoints.length} passed
              </p>
            </div>
          );
        })}
      </div>

      {needsAttention.length > 0 && (
        <div className="rounded-xl border border-navy/10 bg-navy/[0.03] p-5 flex flex-col gap-3">
          <p className="text-navy font-semibold text-sm">Needs attention</p>
          {needsAttention.map((c) => (
            <Link
              key={c.checkpointId}
              href={`/founder/checkpoint/${c.checkpointId}`}
              className="flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 p-3 hover:opacity-90 transition-opacity"
            >
              <p className="text-navy text-sm font-semibold">
                CP{c.checkpointId} · {c.name}
              </p>
              <span className="text-navy/60 text-sm">{c.score}/{c.threshold} needed</span>
            </Link>
          ))}
        </div>
      )}

      {enrolledInstitutions.length > 0 && (
        <div className="rounded-xl border border-navy/10 p-5 flex flex-col gap-2.5">
          <p className="text-navy font-semibold text-sm">Enrolled with</p>
          <p className="text-navy/60 text-xs -mt-1.5">
            Your progress and credential are portable, joining another funder&apos;s passcode never
            restarts your checkpoints, it just adds them to this list.
          </p>
          <div className="flex flex-wrap gap-2 mt-1">
            {enrolledInstitutions.map((inst) => (
              <span key={inst.id} className="rounded-full border border-navy/15 px-3 py-1.5 text-xs font-semibold text-navy">
                {inst.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-navy font-semibold text-sm">All checkpoints</p>
          <Link href="/founder/checkpoints" className="text-emerald text-sm font-semibold hover:underline">
            Full stage-by-stage view →
          </Link>
        </div>
        <CheckpointStatusGrid
          founderId={founder.id}
          items={checkpointStatusItems}
          linkPrefix="/founder/checkpoint"
        />
      </div>
    </div>
  );
}
