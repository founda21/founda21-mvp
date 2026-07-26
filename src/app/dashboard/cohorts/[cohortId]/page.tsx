import { notFound } from "next/navigation";
import { requireInstitutionAdmin } from "@/lib/auth";
import { getCohortReport } from "@/lib/cohort-report";
import { prisma } from "@/lib/prisma";
import { CohortReportView } from "@/components/cohort-report-view";

export default async function CohortDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ cohortId: string }>;
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { cohortId } = await params;
  const { error, message } = await searchParams;
  const { institution } = await requireInstitutionAdmin();

  const cohort = await prisma.cohort.findUnique({ where: { id: cohortId } });
  if (!cohort || cohort.institutionId !== institution.id) notFound();

  const report = await getCohortReport(cohortId);
  if (!report) notFound();

  return (
    <CohortReportView
      report={report}
      cohort={cohort}
      cohortId={cohortId}
      marketingCardConsented={!!institution.marketingCardConsentedAt}
      error={error}
      message={message}
    />
  );
}
