import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/auth";
import { getCohortReport } from "@/lib/cohort-report";
import { cohortReportToXlsx } from "@/lib/cohort-report-xlsx";

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

  const buffer = await cohortReportToXlsx(report);
  const filename = `${report.cohortName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-report.xlsx`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
