import Link from "next/link";
import { notFound } from "next/navigation";
import { requireInstitutionAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkpointsForStage, STAGE_MIN_VENTURE_STAGE, type Stage } from "@/lib/checkpoints";
import { ventureStageLabel, ventureStageRank } from "@/lib/venture-stage";
import { Badge } from "@/components/ui";
import { CheckpointEvidence } from "@/components/checkpoint-evidence";
import type { ScoringOutput } from "@/lib/scoring/schema";

const STAGE_NAMES: Record<Stage, string> = {
  1: "Idea & Reality",
  2: "Company & Traction",
  3: "Investor & Deal Readiness",
};

function StageSection({
  stage,
  founder,
  latestByCheckpoint,
  attemptCountByCheckpoint,
}: {
  stage: Stage;
  founder: { id: string; ventureStage: string | null };
  latestByCheckpoint: Map<number, { artifactContent: string; score: { dimensionsJson: unknown } | null }>;
  attemptCountByCheckpoint: Map<number, number>;
}) {
  const founderRank = ventureStageRank(founder.ventureStage);
  const requiredRank = ventureStageRank(STAGE_MIN_VENTURE_STAGE[stage]);
  const ventureStageLocked = founderRank !== null && requiredRank !== null && founderRank < requiredRank;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-3 border-b border-navy/10 pb-2">
        <h2 className="text-navy font-bold text-lg">
          Stage {stage} — {STAGE_NAMES[stage]}
        </h2>
        {ventureStageLocked && (
          <Badge tone="warning">Requires {ventureStageLabel(STAGE_MIN_VENTURE_STAGE[stage])}+</Badge>
        )}
      </div>

      {checkpointsForStage(stage).map((checkpoint) => {
        const submission = latestByCheckpoint.get(checkpoint.id);
        const output = submission?.score?.dimensionsJson as ScoringOutput | undefined;
        const attempts = attemptCountByCheckpoint.get(checkpoint.id) ?? 0;

        return (
          <div
            key={checkpoint.id}
            id={`cp${checkpoint.id}`}
            className="rounded-xl border border-navy/10 p-5 flex flex-col gap-3 scroll-mt-6"
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-navy font-semibold text-sm">
                  CP{checkpoint.id} · {checkpoint.name}
                </p>
                <p className="text-navy/40 text-xs">{checkpoint.artifactType}</p>
              </div>
              {output ? (
                <div className="flex items-center gap-2">
                  <span className="text-navy text-lg font-bold">{output.checkpoint_score}/100</span>
                  {attempts > 1 && <span className="text-navy/40 text-xs">({attempts} attempts)</span>}
                  <Badge tone={output.passed ? "success" : "warning"}>
                    {output.passed ? "Passed" : "Below threshold"}
                  </Badge>
                </div>
              ) : (
                <Badge tone="neutral">Not attempted</Badge>
              )}
            </div>

            {submission && output && (
              <>
                <div className="rounded-lg bg-navy/[0.03] p-4">
                  <CheckpointEvidence
                    checkpointId={checkpoint.id}
                    artifactContent={submission.artifactContent}
                    founderId={founder.id}
                  />
                </div>

                <details className="text-sm">
                  <summary className="cursor-pointer text-navy/60 font-medium">AI assessment detail</summary>
                  <div className="flex flex-col gap-3 mt-3">
                    <p className="text-navy/80">{output.summary}</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {output.dimensions.map((d) => (
                        <div key={d.dimension} className="rounded-lg border border-navy/10 p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-navy font-semibold text-xs">{d.dimension}</p>
                            <p className="text-navy/60 text-xs">
                              {d.score}/20 · {d.band}
                            </p>
                          </div>
                          <p className="text-navy/60 text-xs mt-1">{d.reasoning}</p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg border border-emerald/30 bg-emerald/5 p-3">
                      <p className="text-navy font-semibold text-xs">Top priority fix</p>
                      <p className="text-navy/70 text-xs mt-1">{output.top_priority_fix}</p>
                    </div>
                  </div>
                </details>
              </>
            )}
          </div>
        );
      })}
    </section>
  );
}

export default async function FounderCheckpointsPage({
  params,
}: {
  params: Promise<{ founderId: string }>;
}) {
  const { founderId } = await params;
  const { institution } = await requireInstitutionAdmin();

  const founder = await prisma.founder.findUnique({
    where: { id: founderId },
    include: {
      submissions: { include: { score: true }, orderBy: { attemptNumber: "asc" } },
      memberships: { select: { cohort: { select: { institutionId: true } } } },
    },
  });

  const hasAccess = founder?.memberships.some((m) => m.cohort.institutionId === institution.id);
  if (!founder || !hasAccess) notFound();

  const latestByCheckpoint = new Map<number, (typeof founder.submissions)[number]>();
  const attemptCountByCheckpoint = new Map<number, number>();
  for (const submission of founder.submissions) {
    const existing = latestByCheckpoint.get(submission.checkpointId);
    if (!existing || submission.attemptNumber > existing.attemptNumber) {
      latestByCheckpoint.set(submission.checkpointId, submission);
    }
    attemptCountByCheckpoint.set(
      submission.checkpointId,
      (attemptCountByCheckpoint.get(submission.checkpointId) ?? 0) + 1,
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div className="flex flex-col gap-1">
        <Link href={`/dashboard/founders/${founder.id}`} className="text-navy/50 text-xs hover:underline">
          ← {founder.ventureName} overview
        </Link>
        <h1 className="text-navy text-2xl font-bold">All 21 checkpoints — {founder.ventureName}</h1>
        <p className="text-navy/60 text-sm">
          {founder.fullName}
          {founder.ventureStage && ` · ${ventureStageLabel(founder.ventureStage)}`}
        </p>
      </div>

      {([1, 2, 3] as Stage[]).map((stage) => (
        <StageSection
          key={stage}
          stage={stage}
          founder={founder}
          latestByCheckpoint={latestByCheckpoint}
          attemptCountByCheckpoint={attemptCountByCheckpoint}
        />
      ))}
    </div>
  );
}
