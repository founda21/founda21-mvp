import { NextResponse } from "next/server";
import { requireApprovedInstitutionAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCohortReport, shortlistToCsv } from "@/lib/cohort-report";

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

  const csv = shortlistToCsv(report);
  const filename = `${report.cohortName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-shortlist.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
