import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/auth";
import { getCohortReport, cohortReportToCsv } from "@/lib/cohort-report";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cohortId: string }> },
) {
  const { cohortId } = await params;
  await requirePlatformAdmin();

  const report = await getCohortReport(cohortId);
  if (!report) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const csv = cohortReportToCsv(report);
  const filename = `${report.cohortName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-report.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
