import ExcelJS from "exceljs";
import { CHECKPOINTS } from "@/lib/checkpoints";
import type { CohortReport } from "@/lib/cohort-report";

const NAVY = "FF0A1F44";
const EMERALD = "FF01884E";
const AMBER_FILL = "FFFCE9C9";
const GREEN_FILL = "FFDCF3E6";
const HEADER_FONT = { color: { argb: "FFFFFFFF" }, bold: true } as const;

function styleHeaderRow(row: ExcelJS.Row) {
  row.font = HEADER_FONT;
  row.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
    cell.alignment = { vertical: "middle" };
  });
  row.height = 20;
}

// Real spreadsheet cells rather than delimited text — the CSV version of
// this export breaks in any Excel locale that uses comma as the decimal
// separator (South Africa included): Excel can't tell the field delimiter
// from the data and dumps every row into column A. A workbook has no such
// ambiguity, and it's also where the bold headers / frozen panes / colour
// promised for the "real Excel" option actually come from — the free `xlsx`
// package already in this repo can't write cell styling at all (verified:
// styles don't survive a write/read round-trip), so this uses `exceljs`.
export async function cohortReportToXlsx(report: CohortReport): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Founda21";
  workbook.created = new Date();

  buildRosterSheet(workbook, report);
  buildAveragesSheet(workbook, report);
  buildBreakdownSheet(workbook, report);
  buildMESheet(workbook, report);

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

function buildRosterSheet(workbook: ExcelJS.Workbook, report: CohortReport) {
  const sheet = workbook.addWorksheet("Roster", { views: [{ state: "frozen", ySplit: 1, xSplit: 2 }] });

  sheet.columns = [
    { header: "Rank", key: "rank", width: 7 },
    { header: "Founder", key: "founder", width: 22 },
    { header: "Venture", key: "venture", width: 20 },
    { header: "Venture Type", key: "ventureType", width: 12 },
    { header: "Venture Stage", key: "ventureStage", width: 14 },
    { header: "Current Stage", key: "currentStage", width: 12 },
    { header: "Total Points", key: "totalPoints", width: 12 },
    { header: "Stage 1", key: "stage1", width: 12 },
    { header: "Stage 2", key: "stage2", width: 12 },
    { header: "Stage 3", key: "stage3", width: 12 },
    { header: "Investable", key: "investable", width: 11 },
    { header: "Baseline Captured", key: "baselineCapturedAt", width: 16 },
    { header: "Baseline Stage", key: "baselineStage", width: 13 },
    { header: "Baseline Passed", key: "baselineCheckpointsPassed", width: 14 },
    { header: "Passed Since Baseline", key: "checkpointsPassedSinceBaseline", width: 16 },
    { header: "Points Since Baseline", key: "pointsGainedSinceBaseline", width: 16 },
    ...CHECKPOINTS.map((c) => ({ header: `CP${c.id}`, key: `cp${c.id}`, width: 9 })),
  ];
  styleHeaderRow(sheet.getRow(1));

  for (const row of report.rows) {
    const rowData: Record<string, unknown> = {
      rank: row.rank,
      founder: row.fullName,
      venture: row.ventureName,
      ventureType: row.ventureType,
      ventureStage: row.ventureStage ?? "",
      currentStage: row.currentStage,
      totalPoints: row.totalPoints,
      stage1: row.stageStatuses[1]?.status ?? "not started",
      stage2: row.stageStatuses[2]?.status ?? "not started",
      stage3: row.stageStatuses[3]?.status ?? "not started",
      investable: row.investable ? "Yes" : "No",
      baselineCapturedAt: row.baselineCapturedAt ? row.baselineCapturedAt.toISOString().slice(0, 10) : "",
      baselineStage: row.baselineStage ?? "",
      baselineCheckpointsPassed: row.baselineCheckpointsPassed ?? "",
      checkpointsPassedSinceBaseline: row.checkpointsPassedSinceBaseline ?? "",
      pointsGainedSinceBaseline: row.pointsGainedSinceBaseline ?? "",
    };
    for (const checkpoint of CHECKPOINTS) {
      rowData[`cp${checkpoint.id}`] = row.checkpoints[checkpoint.id]?.score ?? "";
    }
    const excelRow = sheet.addRow(rowData);

    const investableCell = excelRow.getCell("investable");
    if (row.investable) {
      investableCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GREEN_FILL } };
      investableCell.font = { color: { argb: EMERALD }, bold: true };
    }
    for (const checkpoint of CHECKPOINTS) {
      const result = row.checkpoints[checkpoint.id];
      if (result?.score !== null && result?.score !== undefined && result.passed === false) {
        excelRow.getCell(`cp${checkpoint.id}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: AMBER_FILL } };
      }
    }
  }

  sheet.getColumn("totalPoints").alignment = { horizontal: "right" };
  for (const checkpoint of CHECKPOINTS) {
    sheet.getColumn(`cp${checkpoint.id}`).alignment = { horizontal: "right" };
  }
}

function buildAveragesSheet(workbook: ExcelJS.Workbook, report: CohortReport) {
  const sheet = workbook.addWorksheet("Averages & Pass Rates");
  sheet.columns = [
    { header: "Checkpoint", key: "checkpoint", width: 34 },
    { header: "Stage", key: "stage", width: 8 },
    { header: "Cohort Average", key: "average", width: 15 },
    { header: "Pass Mark", key: "passMark", width: 10 },
  ];
  styleHeaderRow(sheet.getRow(1));

  for (const checkpoint of CHECKPOINTS) {
    const avg = report.checkpointAverages[checkpoint.id];
    const row = sheet.addRow({
      checkpoint: `CP${checkpoint.id} · ${checkpoint.name}`,
      stage: checkpoint.stage,
      average: avg ?? "",
      passMark: checkpoint.passThreshold,
    });
    if (avg !== null && avg !== undefined && avg < checkpoint.passThreshold) {
      row.getCell("average").fill = { type: "pattern", pattern: "solid", fgColor: { argb: AMBER_FILL } };
    }
  }

  sheet.addRow({});
  const passRateHeader = sheet.addRow({ checkpoint: "Stage pass rate" });
  passRateHeader.font = { bold: true };
  for (const stage of [1, 2, 3]) {
    sheet.addRow({ checkpoint: `Stage ${stage}`, average: `${report.stagePassRates[stage]}%` });
  }
}

function buildBreakdownSheet(workbook: ExcelJS.Workbook, report: CohortReport) {
  const sheet = workbook.addWorksheet("Where It's Getting Stuck");
  // Column widths + row->cell key mapping only — deliberately omitting
  // `header` here, since setting it auto-inserts a header row at row 1
  // immediately, which would collide with the narrative row this sheet
  // needs first. The real header row is added manually below instead.
  sheet.columns = [
    { key: "checkpoint", width: 34 },
    { key: "avgScore", width: 12 },
    { key: "passMark", width: 11 },
    { key: "attempted", width: 18 },
  ];

  const narrativeRow = sheet.addRow(["Summary", report.breakdown.narrative]);
  narrativeRow.font = { bold: true };
  sheet.mergeCells(`B${narrativeRow.number}:D${narrativeRow.number}`);
  sheet.getCell(`B${narrativeRow.number}`).alignment = { wrapText: true };
  narrativeRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
  narrativeRow.getCell(1).font = HEADER_FONT;
  sheet.addRow({});

  const headerRow = sheet.addRow(["Checkpoint", "Avg Score", "Pass Mark", "Founders Attempted"]);
  styleHeaderRow(headerRow);

  for (const w of report.breakdown.weakestCheckpoints) {
    const threshold = CHECKPOINTS.find((c) => c.id === w.checkpointId)!.passThreshold;
    const row = sheet.addRow({
      checkpoint: `CP${w.checkpointId} · ${w.name}`,
      avgScore: w.avgScore,
      passMark: threshold,
      attempted: w.attemptedCount,
    });
    row.getCell("avgScore").fill = { type: "pattern", pattern: "solid", fgColor: { argb: AMBER_FILL } };
  }

  if (report.breakdown.weakestCheckpoints.length === 0) {
    sheet.addRow(["Not enough founders have attempted the same checkpoints yet to identify a pattern."]);
  }
}

function buildMESheet(workbook: ExcelJS.Workbook, report: CohortReport) {
  const sheet = workbook.addWorksheet("M&E Summary");
  sheet.columns = [
    { header: "Metric", key: "metric", width: 30 },
    { header: "Value", key: "value", width: 24 },
  ];
  styleHeaderRow(sheet.getRow(1));

  const me = report.meExport;
  sheet.addRow({ metric: "Total assessed", value: me.totalAssessed });
  sheet.addRow({ metric: "ESD beneficiary eligible", value: me.esdEligibleCount });
  sheet.addRow({ metric: "Black women-owned", value: me.blackWomenOwnedCount });
  sheet.addRow({ metric: "EME (beneficiary class)", value: me.beneficiaryClassBreakdown.EME ?? 0 });
  sheet.addRow({ metric: "QSE (beneficiary class)", value: me.beneficiaryClassBreakdown.QSE ?? 0 });
  sheet.addRow({ metric: "Generic (beneficiary class)", value: me.beneficiaryClassBreakdown.generic ?? 0 });
  sheet.addRow({ metric: "N/A (beneficiary class)", value: me.beneficiaryClassBreakdown.n_a ?? 0 });
  sheet.addRow({ metric: "Total capital raised (ZAR)", value: me.outcomes.totalCapitalRaisedZar });
  sheet.addRow({ metric: "Total monthly revenue (ZAR)", value: me.outcomes.totalMonthlyRevenueZar });
  sheet.addRow({ metric: "Total headcount", value: me.outcomes.totalHeadcount });
  sheet.addRow({ metric: "Still operating", value: me.outcomes.stillOperatingCount });
  sheet.addRow({ metric: "Graduated to supplier", value: me.outcomes.graduatedToSupplierCount });
  sheet.addRow({});
  sheet.addRow({ metric: "Framework version", value: me.provenance.frameworkVersion });
  sheet.addRow({ metric: "Generated", value: me.provenance.generatedAt });
}
