import { NextResponse } from "next/server";
import { requireApprovedInstitutionAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCohortReport } from "@/lib/cohort-report";
import { cohortReportToXlsx } from "@/lib/cohort-report-xlsx";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cohortId: string }> },
) {
  const { cohortId } = await params;
  const { institution } = await requireApprovedInstitutionAdmin();

  const cohort = await prisma.cohort.findUnique({ where: { id: cohortId } });
  if (!cohort || cohort.institutionId !== institution.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

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
