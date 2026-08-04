import { ventureStageLabel } from "@/lib/venture-stage";
import type { CohortReport } from "@/lib/cohort-report";
import type { Cohort } from "@/generated/prisma/client";
import { FounderSearchList, type FounderListItem } from "@/components/founder-search-list";
import { BackLink } from "@/components/back-link";
import { DownloadCardButton } from "@/components/download-card-button";
import { CohortDeadlineAnnouncement } from "@/components/cohort-deadline-announcement";
import { CohortSummaryToggle } from "@/components/cohort-summary-toggle";
import { ErrorBanner, InfoBanner } from "@/components/ui";

export function CohortReportView({
  report,
  cohort,
  cohortId,
  basePath = "/dashboard",
  backHref = "/dashboard/cohorts",
  backLabel = "Back to cohorts",
  readOnly = false,
  marketingCardConsented = false,
  error,
  message,
}: {
  report: CohortReport;
  cohort: Cohort;
  cohortId: string;
  basePath?: string;
  backHref?: string;
  backLabel?: string;
  readOnly?: boolean;
  marketingCardConsented?: boolean;
  error?: string;
  message?: string;
}) {
  const founderItems: FounderListItem[] = report.rows.map((row) => ({
    founderId: row.founderId,
    membershipId: row.membershipId,
    fullName: row.fullName,
    ventureName: row.ventureName,
    ventureType: row.ventureType,
    ventureStageLabel: ventureStageLabel(row.ventureStage),
    currentStage: row.currentStage,
    investable: row.investable,
    passedCount: Object.values(row.checkpoints).filter((c) => c.passed).length,
    totalPoints: row.totalPoints,
    rank: row.rank,
    shortlisted: row.shortlisted,
  }));

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <BackLink href={backHref} label={backLabel} />
      <ErrorBanner message={error} />
      <InfoBanner message={message} />
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-navy text-2xl font-bold">{report.cohortName}</h1>
        <a
          href={`${basePath}/cohorts/${cohortId}/export.xlsx`}
          className="rounded-full border border-navy text-navy px-5 py-2 text-sm font-semibold hover:bg-brand hover:text-white transition-colors"
        >
          Export Excel
        </a>
      </div>

      <CohortSummaryToggle>
        <div className="flex gap-6 flex-wrap">
          {[1, 2, 3].map((stage) => (
            <div key={stage} className="rounded-xl border border-navy/10 px-5 py-4 min-w-[140px]">
              <p className="text-navy/50 text-xs uppercase font-semibold">Stage {stage} passed</p>
              <p className="text-navy text-2xl font-bold">{report.stagePassRates[stage]}%</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-navy/10 bg-navy/[0.03] p-5">
          <p className="text-navy font-semibold text-sm mb-2">Where this cohort is getting stuck</p>
          <p className="text-navy/70 text-sm">{report.breakdown.narrative}</p>
          {report.breakdown.weakestCheckpoints.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1.5">
              {report.breakdown.weakestCheckpoints.map((w) => (
                <li key={w.checkpointId} className="text-navy/70 text-xs flex items-center justify-between gap-3">
                  <span>
                    CP{w.checkpointId} · {w.name}
                  </span>
                  <span className="text-navy font-semibold whitespace-nowrap">
                    {w.avgScore}/100 avg ({w.attemptedCount} founder{w.attemptedCount === 1 ? "" : "s"})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-navy/10 p-5">
          <p className="text-navy font-semibold text-sm mb-3">M&amp;E summary</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-navy/50 text-xs uppercase font-semibold">ESD eligible</p>
              <p className="text-navy font-semibold">{report.meExport.esdEligibleCount} / {report.meExport.totalAssessed}</p>
            </div>
            <div>
              <p className="text-navy/50 text-xs uppercase font-semibold">Black women-owned</p>
              <p className="text-navy font-semibold">{report.meExport.blackWomenOwnedCount}</p>
            </div>
            <div>
              <p className="text-navy/50 text-xs uppercase font-semibold">Total capital raised</p>
              <p className="text-navy font-semibold">R{report.meExport.outcomes.totalCapitalRaisedZar.toLocaleString("en-ZA")}</p>
            </div>
            <div>
              <p className="text-navy/50 text-xs uppercase font-semibold">Still operating</p>
              <p className="text-navy font-semibold">{report.meExport.outcomes.stillOperatingCount} / {report.meExport.totalAssessed}</p>
            </div>
          </div>
        </div>
      </CohortSummaryToggle>

      <div className="rounded-xl border border-navy/10 bg-navy/[0.03] px-5 py-4 flex flex-col gap-4">
        <div>
          <p className="text-navy text-sm font-semibold">Passcode</p>
          <p className="text-navy text-2xl font-mono font-bold tracking-wide">{cohort.inviteCode}</p>
          {(cohort.maxUses !== null || cohort.expiresAt || !cohort.active) && (
            <p className="text-navy/50 text-xs mt-1">
              {cohort.maxUses !== null && `Uses: ${cohort.usesCount}/${cohort.maxUses}.`}
              {cohort.expiresAt &&
                ` Expires ${cohort.expiresAt.toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}.`}
              {!cohort.active && " This passcode is currently inactive."}
            </p>
          )}
        </div>

        <div className="border-t border-navy/10 pt-4 flex flex-col gap-2">
          <p className="text-navy/60 text-xs max-w-md">
            A small co-branded card for the bottom of your recruitment poster, shows founders this
            passcode and exactly what to complete on Founda21 to be considered.
          </p>
          <DownloadCardButton
            cohortId={cohortId}
            downloadHref={`${basePath}/cohorts/${cohortId}/card.pdf`}
            consented={marketingCardConsented}
            readOnly={readOnly}
          />
        </div>
      </div>

      {!readOnly && (
        <CohortDeadlineAnnouncement
          cohortId={cohortId}
          founderCount={report.rows.length}
          announcedStage={cohort.announcedStage}
          announcedDeadline={cohort.announcedDeadline?.toISOString() ?? null}
          announcedAt={cohort.announcedAt?.toISOString() ?? null}
        />
      )}

      <p className="text-navy/60 text-xs -mb-4">
        Ranked by total points (sum of every checkpoint score), highest first.
      </p>
      <FounderSearchList founders={founderItems} cohortId={cohortId} basePath={basePath} readOnly={readOnly} />

      {report.rows.length === 0 && (
        <p className="text-navy/60 text-sm">
          No founders have joined this cohort yet. Share the passcode above.
        </p>
      )}
    </div>
  );
}
