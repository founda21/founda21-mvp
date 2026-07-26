import Link from "next/link";
import { ventureStageLabel } from "@/lib/venture-stage";
import { RECOMMENDATION_LABELS, type FounderAnalysis, type Recommendation } from "@/lib/founder-analysis";
import { Badge } from "@/components/ui";
import { BackLink } from "@/components/back-link";
import { Prisma } from "@/generated/prisma/client";

export const founderSummaryInclude = {
  stageStatuses: true,
  memberships: { include: { cohort: true } },
} satisfies Prisma.FounderInclude;

export type FounderForSummary = Prisma.FounderGetPayload<{ include: typeof founderSummaryInclude }>;

function recommendationTone(rec: Recommendation): "success" | "warning" | "neutral" {
  if (rec === "fund") return "success";
  if (rec === "fund_with_conditions" || rec === "not_yet") return "warning";
  return "neutral";
}

// The AI investment analysis is the primary content here — a separate
// Gemini call (§ founder-analysis.ts) reading already-scored checkpoint
// results, not part of the 21-checkpoint scoring engine. Bio/startup blurb
// live on the founder dashboard itself, not here.
export function FounderSummaryView({
  founder,
  basePath = "/dashboard",
}: {
  founder: FounderForSummary;
  basePath?: string;
}) {
  const stageStatusByStage = new Map(founder.stageStatuses.map((s) => [s.stage, s]));
  const investable = stageStatusByStage.get(3)?.status === "passed";

  const analysis = founder.analysis as unknown as FounderAnalysis | null;

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      <BackLink href={`${basePath}/founders/${founder.id}`} label="Back to founder" />

      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-navy text-2xl font-bold">{founder.ventureName}</h1>
          {founder.ventureStage && <Badge tone="neutral">{ventureStageLabel(founder.ventureStage)}</Badge>}
          {investable ? (
            <Badge tone="success">Founda21 Investable</Badge>
          ) : (
            <Badge tone="neutral">Stage {founder.currentStage} in progress</Badge>
          )}
        </div>
        <p className="text-navy/60 text-sm mt-1">
          {founder.fullName} · {founder.ventureType}
        </p>
      </div>

      <div className="rounded-xl border border-navy/10 p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-navy font-semibold text-sm">AI investment analysis</p>
          {analysis && <Badge tone={recommendationTone(analysis.recommendation)}>{RECOMMENDATION_LABELS[analysis.recommendation]}</Badge>}
        </div>

        {!analysis ? (
          <p className="text-navy/50 text-sm">
            No analysis yet, generated automatically once at least one checkpoint is scored.
          </p>
        ) : (
          <>
            <p className="text-navy text-sm font-medium">{analysis.recommendation_summary}</p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-navy/50 text-xs uppercase font-semibold mb-1.5">Strengths</p>
                <ul className="flex flex-col gap-1.5">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="text-navy/70 text-sm">
                      <span className="text-emerald font-semibold">+</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-navy/50 text-xs uppercase font-semibold mb-1.5">Weaknesses</p>
                <ul className="flex flex-col gap-1.5">
                  {analysis.weaknesses.map((s, i) => (
                    <li key={i} className="text-navy/70 text-sm">
                      <span className="text-amber-600 font-semibold">−</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-navy/70 text-sm border-t border-navy/10 pt-3">{analysis.narrative}</p>

            <p className="text-navy/50 text-xs">
              AI-generated read of already-scored checkpoints, not part of checkpoint scoring itself.
              {founder.analysisGeneratedAt &&
                ` Generated ${founder.analysisGeneratedAt.toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}.`}
            </p>
          </>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        <Link
          href={`${basePath}/founders/${founder.id}/checkpoints`}
          className="rounded-full border border-navy text-navy px-6 py-2.5 text-sm font-semibold hover:bg-brand hover:text-white transition-colors"
        >
          View full checkpoint details →
        </Link>
      </div>
    </div>
  );
}
