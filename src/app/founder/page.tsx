import Link from "next/link";
import { requireFounder } from "@/lib/auth";
import { getStageProgress, type CheckpointProgress } from "@/lib/stage-gating";
import { getActiveCooldownSummary, type GapCategory } from "@/lib/attempts";
import { Badge, ErrorBanner, InfoBanner } from "@/components/ui";
import { FounderTabs } from "@/components/founder-tabs";
import { ventureStageLabel, ventureStageRank } from "@/lib/venture-stage";
import { STAGE_MIN_VENTURE_STAGE, type Stage } from "@/lib/checkpoints";

const GAP_LABELS: Record<GapCategory, string> = {
  not_attempted: "Not attempted",
  close: "Close — just below threshold",
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

      {investable ? (
        <div className="rounded-xl border border-emerald bg-emerald/10 px-6 py-5">
          <p className="text-emerald font-bold text-lg">🎉 Founda21 Investable</p>
          <p className="text-navy/70 text-sm mt-1">
            All 21 checkpoints cleared. This venture has earned the terminal Founda21 credential —
            visible to every funder you&apos;re enrolled with.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-navy/10 p-6 flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <p className="text-navy/50 text-xs uppercase font-semibold">Overall readiness</p>
            <p className="text-navy/50 text-xs">{passedCount} / 21 passed</p>
          </div>
          <p className="text-navy text-3xl font-bold">{progressPct}%</p>
          <div className="h-2 rounded-full bg-navy/10 overflow-hidden">
            <div className="h-full bg-emerald rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      )}

      {activeCooldowns.map((meta) => (
        <div key={meta.progress.stage} className="rounded-xl border border-amber-300 bg-amber-50 px-6 py-5 flex flex-col gap-2">
          <p className="text-navy font-semibold text-sm">
            Stage {meta.progress.stage} — attempt {meta.cooldown!.attemptNumber} didn&apos;t clear
          </p>
          <p className="text-navy/70 text-xs">
            You can retry from{" "}
            {meta.cooldown!.cooldownUntil.toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}.
            Here&apos;s where the gaps were — not the numbers, just where to focus:
          </p>
          <ul className="flex flex-col gap-1 mt-1">
            {meta.cooldown!.checkpointOutcomes
              .filter((c) => !c.passed)
              .map((c) => (
                <li key={c.checkpointId} className="text-navy/70 text-xs">
                  <span className="font-semibold text-navy">CP{c.checkpointId} · {c.name}</span> —{" "}
                  {GAP_LABELS[c.gapCategory]}
                </li>
              ))}
          </ul>
        </div>
      ))}

      {nextCheckpoint && (
        <Link
          href={`/founder/checkpoint/${nextCheckpoint.checkpoint.checkpointId}`}
          className="rounded-xl bg-navy text-white px-6 py-5 flex items-center justify-between hover:opacity-90 transition-opacity"
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
              <p className="text-navy/40 text-xs">
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

      <Link
        href="/founder/checkpoints"
        className="rounded-full border border-navy text-navy px-6 py-2.5 text-sm font-semibold hover:bg-navy hover:text-white transition-colors self-start"
      >
        View all checkpoints →
      </Link>
    </div>
  );
}
