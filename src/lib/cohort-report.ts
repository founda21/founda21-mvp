import { prisma } from "@/lib/prisma";
import { CHECKPOINTS } from "@/lib/checkpoints";
import { FRAMEWORK_VERSION } from "@/lib/scoring/index";

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

  return {
    cohortId: cohort.id,
    cohortName: cohort.name,
    rows,
    checkpointAverages,
    stagePassRates,
    meExport,
  };
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

export function cohortReportToCsv(report: CohortReport): string {
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
    ...CHECKPOINTS.map((c) => `CP${c.id} ${c.name}`),
  ];

  const lines = [header];

  for (const row of report.rows) {
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
      ...CHECKPOINTS.map((c) => {
        const result = row.checkpoints[c.id];
        if (result?.score === null || result?.score === undefined) return "";
        return result.attemptNumber && result.attemptNumber > 1
          ? `${result.score} (attempt ${result.attemptNumber})`
          : String(result.score);
      }),
    ]);
  }

  lines.push([]);
  lines.push(["Cohort average per checkpoint"]);
  lines.push([
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ...CHECKPOINTS.map((c) => (report.checkpointAverages[c.id] !== null ? String(report.checkpointAverages[c.id]) : "")),
  ]);
  lines.push([]);
  lines.push(["Stage pass rate (%)", `Stage 1: ${report.stagePassRates[1]}`, `Stage 2: ${report.stagePassRates[2]}`, `Stage 3: ${report.stagePassRates[3]}`]);

  const me = report.meExport;
  lines.push([]);
  lines.push(["M&E summary"]);
  lines.push(["Total assessed", String(me.totalAssessed)]);
  lines.push(["ESD beneficiary eligible", String(me.esdEligibleCount)]);
  lines.push(["Black women-owned", String(me.blackWomenOwnedCount)]);
  lines.push([
    "Beneficiary class breakdown",
    `EME: ${me.beneficiaryClassBreakdown.EME ?? 0}`,
    `QSE: ${me.beneficiaryClassBreakdown.QSE ?? 0}`,
    `Generic: ${me.beneficiaryClassBreakdown.generic ?? 0}`,
    `N/A: ${me.beneficiaryClassBreakdown.n_a ?? 0}`,
  ]);
  lines.push(["Total capital raised (ZAR)", String(me.outcomes.totalCapitalRaisedZar)]);
  lines.push(["Total monthly revenue (ZAR)", String(me.outcomes.totalMonthlyRevenueZar)]);
  lines.push(["Total headcount", String(me.outcomes.totalHeadcount)]);
  lines.push(["Still operating", String(me.outcomes.stillOperatingCount)]);
  lines.push(["Graduated to supplier", String(me.outcomes.graduatedToSupplierCount)]);
  lines.push(["Provenance", `Framework ${me.provenance.frameworkVersion}`, `Generated ${me.provenance.generatedAt}`]);

  return lines.map((line) => line.map(csvEscape).join(",")).join("\n");
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
