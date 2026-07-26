import Link from "next/link";
import { requireFounder } from "@/lib/auth";
import { getStageProgress } from "@/lib/stage-gating";
import { getActiveCooldownSummary, type GapCategory } from "@/lib/attempts";
import { Badge } from "@/components/ui";
import { BackLink } from "@/components/back-link";
import { ventureStageLabel, ventureStageRank } from "@/lib/venture-stage";
import { STAGE_MIN_VENTURE_STAGE, type Stage } from "@/lib/checkpoints";

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

export default async function FounderCheckpointsPage() {
  const { founder } = await requireFounder();

  const stageProgresses = await Promise.all(
    ([1, 2, 3] as Stage[]).map((stage) => getStageProgress(founder, stage)),
  );
  const cooldownSummaries = await Promise.all(
    ([1, 2, 3] as Stage[]).map((stage) => getActiveCooldownSummary(founder.id, stage)),
  );

  const founderRank = ventureStageRank(founder.ventureStage);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      <BackLink href="/founder" label="Back to dashboard" />

      <div>
        <h1 className="text-navy text-2xl font-bold">All checkpoints</h1>
        <p className="text-navy/60 text-sm mt-1">{founder.ventureName} · every stage, every checkpoint.</p>
      </div>

      {stageProgresses.map((progress, i) => {
        const stage = progress.stage;
        const sequentialLocked = stage > founder.currentStage;
        const requiredRank = ventureStageRank(STAGE_MIN_VENTURE_STAGE[stage]);
        const ventureStageLocked =
          !sequentialLocked && founderRank !== null && requiredRank !== null && founderRank < requiredRank;
        const locked = sequentialLocked || ventureStageLocked;
        const active = stage === founder.currentStage && !ventureStageLocked;
        const cooldown = cooldownSummaries[i];

        return (
          <section key={stage} className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-navy text-lg font-bold">
                Stage {stage}: {STAGE_NAMES[stage]}
              </h2>
              {ventureStageLocked ? (
                <Badge tone="warning">Requires {ventureStageLabel(STAGE_MIN_VENTURE_STAGE[stage])}+</Badge>
              ) : sequentialLocked ? (
                <Badge tone="neutral">Locked</Badge>
              ) : progress.passed ? (
                <Badge tone="success">Passed</Badge>
              ) : cooldown ? (
                <Badge tone="warning">Retry available {cooldown.cooldownUntil.toLocaleDateString("en-ZA", { month: "short", day: "numeric" })}</Badge>
              ) : (
                <Badge tone={active ? "warning" : "neutral"}>In progress</Badge>
              )}
            </div>

            {ventureStageLocked && (
              <p className="text-navy/60 text-xs">
                This stage needs a venture stage of {ventureStageLabel(STAGE_MIN_VENTURE_STAGE[stage])} or
                later. Update your stage on the dashboard once you&apos;re there.
              </p>
            )}

            {cooldown && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 flex flex-col gap-2">
                <p className="text-navy font-semibold text-sm">
                  Attempt {cooldown.attemptNumber} didn&apos;t clear this stage
                </p>
                <p className="text-navy/70 text-xs">
                  You can retry from{" "}
                  {cooldown.cooldownUntil.toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}.
                  Here&apos;s where the gaps were, not the numbers, just where to focus:
                </p>
                <ul className="flex flex-col gap-1 mt-1">
                  {cooldown.checkpointOutcomes
                    .filter((c) => !c.passed)
                    .map((c) => (
                      <li key={c.checkpointId} className="text-navy/70 text-xs">
                        <span className="font-semibold text-navy">CP{c.checkpointId} · {c.name}</span>:{" "}
                        {GAP_LABELS[c.gapCategory]}
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {!locked && progress.averageThreshold !== null && (
              <p className="text-navy/60 text-xs">
                Stage average: {progress.stageAverage ?? "N/A"} / {progress.averageThreshold} required
              </p>
            )}
            {!locked && progress.tractionStatus && (
              <p className="text-navy/60 text-xs">Traction: {progress.tractionStatus.detail}</p>
            )}

            <div className="flex flex-col divide-y divide-navy/10 border border-navy/10 rounded-xl overflow-hidden">
              {progress.checkpoints.map((c) => {
                const content = (
                  <>
                    <div>
                      <p className={`font-semibold ${locked ? "text-navy/60" : "text-navy"}`}>
                        CP{c.checkpointId} · {c.name}
                      </p>
                      <p className="text-navy/60 text-xs">Pass threshold: {c.threshold}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={locked ? "text-navy/50" : "text-navy/70"}>
                        {c.score !== null ? c.score : "N/A"}
                      </span>
                      {c.passed && <Badge tone="success">Passed</Badge>}
                    </div>
                  </>
                );

                return locked ? (
                  <div key={c.checkpointId} className="flex items-center justify-between px-5 py-4 opacity-60">
                    {content}
                  </div>
                ) : (
                  <Link
                    key={c.checkpointId}
                    href={`/founder/checkpoint/${c.checkpointId}`}
                    className="flex items-center justify-between px-5 py-4 hover:bg-navy/5 transition-colors"
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
