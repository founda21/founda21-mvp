import Link from "next/link";
import { CHECKPOINTS } from "@/lib/checkpoints";
import { Badge } from "@/components/ui";
import { BackLink } from "@/components/back-link";
import { CheckpointEvidence } from "@/components/checkpoint-evidence";
import type { ScoringOutput } from "@/lib/scoring/schema";
import { Prisma } from "@/generated/prisma/client";

export function founderCheckpointDetailInclude(checkpointId: number) {
  return {
    submissions: {
      where: { checkpointId },
      include: { score: true },
      orderBy: { attemptNumber: "desc" },
      take: 1,
    },
    memberships: { select: { cohort: { select: { institutionId: true } } } },
  } satisfies Prisma.FounderInclude;
}

export type FounderForCheckpointDetail = Prisma.FounderGetPayload<{
  include: ReturnType<typeof founderCheckpointDetailInclude>;
}>;

// A single, isolated checkpoint — nothing to scroll past, no other
// checkpoints visible. Deliberately stops at score/pass-fail/evidence: the
// per-dimension AI assessment breakdown is exclusive to "View full checkpoint
// details" (the /checkpoints list) so the two views don't show the same thing.
export function FounderCheckpointDetailView({
  founder,
  checkpoint,
  basePath = "/dashboard",
}: {
  founder: FounderForCheckpointDetail;
  checkpoint: (typeof CHECKPOINTS)[number];
  basePath?: string;
}) {
  const submission = founder.submissions[0];
  const output = submission?.score?.dimensionsJson as ScoringOutput | undefined;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <BackLink href={`${basePath}/founders/${founder.id}`} label={`Back to ${founder.ventureName}`} />

      <div>
        <p className="text-navy/50 text-xs uppercase font-semibold">
          CP{checkpoint.id} · Stage {checkpoint.stage}
        </p>
        <h1 className="text-navy text-2xl font-bold">{checkpoint.name}</h1>
        <p className="text-navy/60 text-sm mt-1">{checkpoint.requirement}</p>
      </div>

      <div className="rounded-xl border border-navy/10 bg-navy/[0.03] p-4">
        <p className="text-navy text-sm font-semibold mb-1.5">
          How the {checkpoint.scoringBreakdown.reduce((sum, d) => sum + d.points, 0)} points are scored
        </p>
        <ul className="flex flex-col gap-1.5">
          {checkpoint.scoringBreakdown.map((d) => (
            <li key={d.dimension} className="text-navy/70 text-sm">
              <span className="font-semibold text-navy">{d.dimension} ({d.points} pts)</span>: {d.expectation}
            </li>
          ))}
        </ul>
      </div>

      {output ? (
        <div className="flex items-center gap-3">
          <span className="text-navy text-2xl font-bold">{output.checkpoint_score}/100</span>
          <Badge tone={output.passed ? "success" : "warning"}>
            {output.passed ? "Passed" : "Below threshold"}
          </Badge>
          <span className="text-navy/60 text-xs">Pass threshold: {checkpoint.passThreshold}</span>
        </div>
      ) : (
        <Badge tone="neutral">Not attempted</Badge>
      )}

      {submission && (
        <div className="rounded-lg bg-navy/[0.03] p-4">
          <p className="text-navy/50 text-xs font-semibold uppercase mb-2">Submitted evidence</p>
          <CheckpointEvidence
            checkpointId={checkpoint.id}
            artifactContent={submission.artifactContent}
            founderId={founder.id}
          />
        </div>
      )}

      <Link
        href={`${basePath}/founders/${founder.id}/checkpoints`}
        className="rounded-full border border-navy text-navy px-6 py-2.5 text-sm font-semibold hover:bg-brand hover:text-white transition-colors self-start"
      >
        View full checkpoint details (all 21) →
      </Link>
    </div>
  );
}
