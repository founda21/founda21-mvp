import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { funderTypeLabel } from "@/lib/funder-type";
import { BackLink } from "@/components/back-link";
import { AdminDeleteRecord } from "@/components/admin-delete-record";
import { deleteInstitutionByAdmin } from "@/lib/actions/platform-admin";

export default async function AdminInstitutionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ institutionId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { institutionId } = await params;
  const { error } = await searchParams;
  await requirePlatformAdmin();

  const institution = await prisma.institution.findUnique({ where: { id: institutionId } });
  if (!institution) notFound();

  const cohorts = await prisma.cohort.findMany({
    where: { institutionId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { memberships: true } } },
  });

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <BackLink href="/admin" label="Back to institutions" />
      <div>
        <h1 className="text-navy text-2xl font-bold">{institution.name}</h1>
        <p className="text-navy/50 text-sm mt-1">{funderTypeLabel(institution.funderType)}</p>
      </div>

      {cohorts.length === 0 ? (
        <p className="text-navy/60 text-sm">This institution has no cohorts yet.</p>
      ) : (
        <div className="flex flex-col divide-y divide-navy/10 border border-navy/10 rounded-xl overflow-hidden">
          {cohorts.map((cohort) => (
            <Link
              key={cohort.id}
              href={`/admin/cohorts/${cohort.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-navy/5 transition-colors"
            >
              <div>
                <p className="text-navy font-semibold">{cohort.name}</p>
                <p className="text-navy/50 text-xs">
                  {cohort._count.memberships} founder{cohort._count.memberships === 1 ? "" : "s"}
                  {!cohort.active && " · inactive passcode"}
                </p>
              </div>
              <span className="text-navy/60 text-sm">View →</span>
            </Link>
          ))}
        </div>
      )}

      <AdminDeleteRecord
        title="Permanently delete this institution"
        description={`This deletes ${institution.name}'s login, every cohort and passcode it created, and its view of every founder. A founder who has also joined a different funder keeps their account and that other funder's data; a founder who only ever belonged to this institution is deleted along with it. This cannot be undone.`}
        action={deleteInstitutionByAdmin}
        hiddenFields={{ institutionId: institution.id }}
        error={error}
      />
    </div>
  );
}
