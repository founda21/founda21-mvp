import { CHECKPOINTS } from "@/lib/checkpoints";
import { formatDuration } from "@/lib/format-duration";
import type { ScoringOutput } from "@/lib/scoring/schema";

const DAY_MS = 24 * 60 * 60 * 1000;

type SubmissionWithScore = {
  checkpointId: number;
  attemptNumber: number;
  createdAt: Date;
  score: { createdAt: Date; dimensionsJson: unknown; passed: boolean } | null;
};

// Platform-admin-only ops view: when did this founder start, and how long did
// each checkpoint actually take to clear. Built entirely from existing
// Submission/Score timestamps — no new schema, no scoring involvement.
export function FounderTimeline({
  founderCreatedAt,
  submissions,
}: {
  founderCreatedAt: Date;
  submissions: SubmissionWithScore[];
}) {
  const firstPassByCheckpoint = new Map<number, Date>();
  for (const submission of submissions) {
    const output = submission.score?.dimensionsJson as ScoringOutput | undefined;
    if (!output?.passed) continue;
    const passedAt = submission.score!.createdAt;
    const existing = firstPassByCheckpoint.get(submission.checkpointId);
    if (!existing || passedAt < existing) {
      firstPassByCheckpoint.set(submission.checkpointId, passedAt);
    }
  }

  const rows = CHECKPOINTS.map((c) => ({
    checkpointId: c.id,
    name: c.name,
    stage: c.stage,
    passedAt: firstPassByCheckpoint.get(c.id) ?? null,
  }));

  // Chronological order of actual passes, regardless of checkpoint numbering
  // — a founder can legitimately clear checkpoints within a stage out of
  // order, so "time since previous pass" tracks real sequence, not CP id.
  const chronological = rows
    .filter((r) => r.passedAt !== null)
    .sort((a, b) => a.passedAt!.getTime() - b.passedAt!.getTime());
  const deltaByCheckpoint = new Map<number, number>();
  chronological.forEach((r, i) => {
    const prevAt = i === 0 ? founderCreatedAt : chronological[i - 1].passedAt!;
    deltaByCheckpoint.set(r.checkpointId, Math.round((r.passedAt!.getTime() - prevAt.getTime()) / DAY_MS));
  });

  const investableAt = chronological.length === 21 ? chronological[20].passedAt : null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-navy font-semibold text-sm">Timeline</p>
      <p className="text-navy/50 text-xs -mt-1.5">
        Started {founderCreatedAt.toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}.
        {investableAt && (
          <>
            {" "}
            Reached Founda21 Investable {formatDuration(
              Math.round((investableAt.getTime() - founderCreatedAt.getTime()) / DAY_MS),
            )}{" "}
            later.
          </>
        )}
      </p>
      <div className="flex flex-col divide-y divide-navy/10 border border-navy/10 rounded-xl overflow-hidden">
        {rows.map((r) => (
          <div key={r.checkpointId} className="flex items-center justify-between px-4 py-2.5 gap-3">
            <p className="text-navy text-sm">
              <span className="font-semibold">CP{r.checkpointId}</span>{" "}
              <span className="text-navy/50">· {r.name}</span>
            </p>
            {r.passedAt ? (
              <p className="text-navy/60 text-xs text-right shrink-0">
                Passed {r.passedAt.toLocaleDateString("en-ZA", { month: "short", day: "numeric", year: "numeric" })}
                {" · took "}
                {formatDuration(deltaByCheckpoint.get(r.checkpointId) ?? 0)}
              </p>
            ) : (
              <p className="text-navy/40 text-xs shrink-0">Not passed yet</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
