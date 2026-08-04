import { prisma } from "@/lib/prisma";
import { CHECKPOINTS } from "@/lib/checkpoints";
import { FRAMEWORK_VERSION } from "@/lib/scoring/index";
import { computeReadinessProgress, type ReadinessSnapshot } from "@/lib/readiness-baseline";

export type FounderCheckpointResult = {
  checkpointId: number;
  score: number | null;
  passed: boolean | null;
  attemptNumber: number | null;
};

export type FounderReportRow = {
  founderId: string;
  membershipId: string;
  fullName: string;
  ventureName: string;
  ventureType: string;
  ventureStage: string | null;
  currentStage: number;
  stageStatuses: Record<number, { status: string; stageAverage: number | null }>;
  checkpoints: Record<number, FounderCheckpointResult>;
  investable: boolean;
  totalPoints: number;
  rank: number;
  shortlisted: boolean;
  // Documented baseline (§ readiness-baseline.ts) — null only for a
  // membership that predates the feature and hasn't been backfilled yet.
  baselineCapturedAt: Date | null;
  baselineStage: number | null;
  baselineCheckpointsPassed: number | null;
  checkpointsPassedSinceBaseline: number | null;
  pointsGainedSinceBaseline: number | null;
};

export type WeakestCheckpoint = {
  checkpointId: number;
  name: string;
  stage: number;
  avgScore: number;
  attemptedCount: number;
};

export type CohortBreakdown = {
  weakestCheckpoints: WeakestCheckpoint[];
  bottleneckStage: { stage: number; passRate: number } | null;
  narrative: string;
};

// Cohort-level M&E export block (§ spec §7) — structured to drop into a
// B-BBEE verification file or DFI/funder progress report. Never affects
// scoring; sourced entirely from FounderEligibility/FounderOutcome, neither
// of which the scoring engine reads.
export type CohortMEExport = {
  totalAssessed: number;
  esdEligibleCount: number;
  blackWomenOwnedCount: number;
  beneficiaryClassBreakdown: Record<string, number>;
  outcomes: {
    totalCapitalRaisedZar: number;
    totalMonthlyRevenueZar: number;
    totalHeadcount: number;
    stillOperatingCount: number;
    graduatedToSupplierCount: number;
  };
  provenance: {
    frameworkVersion: string;
    generatedAt: string;
  };
};

export type CohortReport = {
  cohortId: string;
  cohortName: string;
  rows: FounderReportRow[];
  checkpointAverages: Record<number, number | null>;
  stagePassRates: Record<number, number>; // percentage 0-100
  meExport: CohortMEExport;
  breakdown: CohortBreakdown;
};

export async function getCohortReport(cohortId: string): Promise<CohortReport | null> {
  const cohort = await prisma.cohort.findUnique({ where: { id: cohortId } });
  if (!cohort) return null;

  // Founder accounts are portable across institutions (§ CohortMembership) —
  // a cohort's roster is everyone with a membership row, not just founders
  // whose *original* home cohort happens to be this one.
  const memberships = await prisma.cohortMembership.findMany({
    where: { cohortId },
    orderBy: { joinedAt: "asc" },
    include: {
      founder: {
        include: {
          submissions: { include: { score: true } },
          stageStatuses: true,
        },
      },
      baseline: true,
    },
  });
  const founders = memberships.map((m) => m.founder);

  const rows: FounderReportRow[] = memberships.map((membership) => {
    const founder = membership.founder;
    const latestByCheckpoint = new Map<number, (typeof founder.submissions)[number]>();
    for (const submission of founder.submissions) {
      const existing = latestByCheckpoint.get(submission.checkpointId);
      if (!existing || submission.attemptNumber > existing.attemptNumber) {
        latestByCheckpoint.set(submission.checkpointId, submission);
      }
    }

    const checkpoints: Record<number, FounderCheckpointResult> = {};
    for (const checkpoint of CHECKPOINTS) {
      const submission = latestByCheckpoint.get(checkpoint.id);
      checkpoints[checkpoint.id] = {
        checkpointId: checkpoint.id,
        score: submission?.score?.checkpointScore ?? null,
        passed: submission?.score?.passed ?? null,
        attemptNumber: submission?.attemptNumber ?? null,
      };
    }

    const stageStatuses: Record<number, { status: string; stageAverage: number | null }> = {};
    for (const stageStatus of founder.stageStatuses) {
      stageStatuses[stageStatus.stage] = {
        status: stageStatus.status,
        stageAverage: stageStatus.stageAverage,
      };
    }

    const investable = stageStatuses[3]?.status === "passed";
    const totalPoints = Object.values(checkpoints).reduce((sum, c) => sum + (c.score ?? 0), 0);
    const checkpointsPassedNow = Object.values(checkpoints).filter((c) => c.passed).length;

    // Progress-since-baseline (§ readiness-baseline.ts) — same computation
    // the funder sees on the individual founder page, surfaced here per row
    // so a cohort-wide CSV/roster carries it too.
    let baselineCapturedAt: Date | null = null;
    let baselineStage: number | null = null;
    let baselineCheckpointsPassed: number | null = null;
    let checkpointsPassedSinceBaseline: number | null = null;
    let pointsGainedSinceBaseline: number | null = null;
    if (membership.baseline) {
      const checkpointResults: ReadinessSnapshot["checkpointResults"] = {};
      for (const checkpoint of CHECKPOINTS) {
        const c = checkpoints[checkpoint.id];
        checkpointResults[checkpoint.id] = { score: c.score, passed: c.passed ?? false };
      }
      const currentSnapshot: ReadinessSnapshot = {
        stage: founder.currentStage,
        checkpointsPassed: checkpointsPassedNow,
        totalPoints,
        checkpointResults,
      };
      const progress = computeReadinessProgress(membership.baseline, currentSnapshot);
      baselineCapturedAt = progress.baselineCapturedAt;
      baselineStage = progress.baseline.stage;
      baselineCheckpointsPassed = progress.baseline.checkpointsPassed;
      checkpointsPassedSinceBaseline = progress.checkpointsPassedDelta;
      pointsGainedSinceBaseline = progress.totalPointsDelta;
    }

    return {
      founderId: founder.id,
      membershipId: membership.id,
      fullName: founder.fullName,
      ventureName: founder.ventureName,
      ventureType: founder.ventureType,
      ventureStage: founder.ventureStage,
      currentStage: founder.currentStage,
      stageStatuses,
      checkpoints,
      investable,
      totalPoints,
      rank: 0, // assigned below, after sorting
      shortlisted: membership.shortlisted,
      baselineCapturedAt,
      baselineStage,
      baselineCheckpointsPassed,
      checkpointsPassedSinceBaseline,
      pointsGainedSinceBaseline,
    };
  });

  // Leaderboard ordering — highest total points (sum of every checkpoint
  // score achieved) on top, so funders can see at a glance who's doing best.
  rows.sort((a, b) => b.totalPoints - a.totalPoints);
  rows.forEach((row, i) => {
    row.rank = i + 1;
  });

  const checkpointAverages: Record<number, number | null> = {};
  for (const checkpoint of CHECKPOINTS) {
    const scores = rows
      .map((row) => row.checkpoints[checkpoint.id]?.score)
      .filter((score): score is number => score !== null && score !== undefined);
    checkpointAverages[checkpoint.id] =
      scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : null;
  }

  const stagePassRates: Record<number, number> = {};
  for (const stage of [1, 2, 3]) {
    const total = rows.length;
    const passed = rows.filter((row) => row.stageStatuses[stage]?.status === "passed").length;
    stagePassRates[stage] = total > 0 ? Math.round((passed / total) * 1000) / 10 : 0;
  }

  const meExport = await buildMEExport(founders.map((f) => f.id));
  const breakdown = computeCohortBreakdown(rows, checkpointAverages);

  return {
    cohortId: cohort.id,
    cohortName: cohort.name,
    rows,
    checkpointAverages,
    stagePassRates,
    meExport,
    breakdown,
  };
}

// Deterministic, numbers-only synthesis of "where is this cohort
// systematically breaking down" — no AI call, purely a transform of the
// checkpointAverages/stageStatuses already gathered above, so it's free,
// instant, and never invents a number that isn't traceable to real scores.
// Thresholds (>=2 founders attempted/reached) exist specifically so a single
// founder's bad day is never reported as a "pattern".
function computeCohortBreakdown(
  rows: FounderReportRow[],
  checkpointAverages: Record<number, number | null>,
): CohortBreakdown {
  const attemptedCounts: Record<number, number> = {};
  for (const checkpoint of CHECKPOINTS) {
    attemptedCounts[checkpoint.id] = rows.filter((r) => r.checkpoints[checkpoint.id]?.score != null).length;
  }

  const weakestCheckpoints: WeakestCheckpoint[] = CHECKPOINTS.filter((c) => {
    const avg = checkpointAverages[c.id];
    return attemptedCounts[c.id] >= 2 && avg !== null && avg < c.passThreshold;
  })
    .map((c) => ({
      checkpointId: c.id,
      name: c.name,
      stage: c.stage,
      avgScore: checkpointAverages[c.id]!,
      attemptedCount: attemptedCounts[c.id],
    }))
    .sort((a, b) => a.avgScore - b.avgScore)
    .slice(0, 3);

  let bottleneckStage: { stage: number; passRate: number } | null = null;
  for (const stage of [1, 2, 3]) {
    const reached = rows.filter((r) => r.stageStatuses[stage]);
    if (reached.length < 2) continue;
    const passed = reached.filter((r) => r.stageStatuses[stage]?.status === "passed").length;
    const passRate = Math.round((passed / reached.length) * 1000) / 10;
    if (!bottleneckStage || passRate < bottleneckStage.passRate) {
      bottleneckStage = { stage, passRate };
    }
  }

  const narrativeParts: string[] = [];
  if (weakestCheckpoints.length > 0) {
    const top = weakestCheckpoints[0];
    const threshold = CHECKPOINTS.find((c) => c.id === top.checkpointId)!.passThreshold;
    narrativeParts.push(
      `The most common breakdown point is CP${top.checkpointId} · ${top.name} (avg ${top.avgScore}/100 across ${top.attemptedCount} founder${top.attemptedCount === 1 ? "" : "s"}, below the ${threshold} pass mark).`,
    );
    if (weakestCheckpoints.length > 1) {
      const rest = weakestCheckpoints
        .slice(1)
        .map((w) => `CP${w.checkpointId} · ${w.name}`)
        .join(", ");
      narrativeParts.push(`Also worth attention: ${rest}.`);
    }
  }
  if (bottleneckStage) {
    narrativeParts.push(`Stage ${bottleneckStage.stage} has the lowest clear rate so far, at ${bottleneckStage.passRate}%.`);
  }

  const narrative =
    narrativeParts.length > 0
      ? narrativeParts.join(" ")
      : "Not enough founders have attempted the same checkpoints yet to identify a systematic pattern.";

  return { weakestCheckpoints, bottleneckStage, narrative };
}

async function buildMEExport(founderIds: string[]): Promise<CohortMEExport> {
  const eligibilities = await prisma.founderEligibility.findMany({
    where: { founderId: { in: founderIds } },
  });

  const beneficiaryClassBreakdown: Record<string, number> = { EME: 0, QSE: 0, generic: 0, n_a: 0 };
  let esdEligibleCount = 0;
  let blackWomenOwnedCount = 0;
  for (const e of eligibilities) {
    beneficiaryClassBreakdown[e.beneficiaryClass] = (beneficiaryClassBreakdown[e.beneficiaryClass] ?? 0) + 1;
    if (e.esdBeneficiaryEligible) esdEligibleCount++;
    if (e.blackWomenOwned) blackWomenOwnedCount++;
  }

  // Latest outcome snapshot per founder (outcomes are a time series — intake,
  // then re-polled at T+6/T+12).
  const outcomeRows = await prisma.founderOutcome.findMany({
    where: { founderId: { in: founderIds } },
    orderBy: { snapshotDate: "desc" },
  });
  const latestOutcomeByFounder = new Map<string, (typeof outcomeRows)[number]>();
  for (const outcome of outcomeRows) {
    if (!latestOutcomeByFounder.has(outcome.founderId)) latestOutcomeByFounder.set(outcome.founderId, outcome);
  }
  const latestOutcomes = Array.from(latestOutcomeByFounder.values());

  const outcomes = {
    totalCapitalRaisedZar: latestOutcomes.reduce((sum, o) => sum + o.capitalRaisedZar, 0),
    totalMonthlyRevenueZar: latestOutcomes.reduce((sum, o) => sum + o.monthlyRevenueZar, 0),
    totalHeadcount: latestOutcomes.reduce((sum, o) => sum + o.headcount, 0),
    stillOperatingCount: latestOutcomes.filter((o) => o.stillOperating).length,
    graduatedToSupplierCount: latestOutcomes.filter((o) => o.graduatedToSupplier).length,
  };

  return {
    totalAssessed: founderIds.length,
    esdEligibleCount,
    blackWomenOwnedCount,
    beneficiaryClassBreakdown,
    outcomes,
    provenance: {
      frameworkVersion: FRAMEWORK_VERSION,
      generatedAt: new Date().toISOString(),
    },
  };
}

// A lean, standalone export of just the shortlisted founders — no
// cohort-wide averages/M&E block appended (those numbers would be
// misleading scoped to a subset), just the roster a funder actually wants
// to print or hand off after shortlisting.
export function shortlistToCsv(report: CohortReport): string {
  const header = [
    "Rank",
    "Founder",
    "Venture",
    "Venture Type",
    "Venture Stage",
    "Current Stage",
    "Total Points",
    "Stage 1 Status",
    "Stage 2 Status",
    "Stage 3 Status",
    "Founda21 Investable",
  ];

  const lines = [header];
  for (const row of report.rows.filter((r) => r.shortlisted)) {
    lines.push([
      String(row.rank),
      row.fullName,
      row.ventureName,
      row.ventureType,
      row.ventureStage ?? "",
      String(row.currentStage),
      String(row.totalPoints),
      row.stageStatuses[1]?.status ?? "not started",
      row.stageStatuses[2]?.status ?? "not started",
      row.stageStatuses[3]?.status ?? "not started",
      row.investable ? "Yes" : "No",
    ]);
  }

  return lines.map((line) => line.map(csvEscape).join(",")).join("\n");
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
