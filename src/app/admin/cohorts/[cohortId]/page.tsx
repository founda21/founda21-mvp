import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCohortReport } from "@/lib/cohort-report";
import { CohortReportView } from "@/components/cohort-report-view";

export default async function AdminCohortDetailPage({
  params,
}: {
  params: Promise<{ cohortId: string }>;
}) {
  const { cohortId } = await params;
  await requirePlatformAdmin();

  const cohort = await prisma.cohort.findUnique({ where: { id: cohortId } });
  if (!cohort) notFound();

  const report = await getCohortReport(cohortId);
  if (!report) notFound();

  return (
    <CohortReportView
      report={report}
      cohort={cohort}
      cohortId={cohortId}
      basePath="/admin"
      backHref={`/admin/institutions/${cohort.institutionId}`}
      backLabel="Back to institution"
      readOnly
    />
  );
}
