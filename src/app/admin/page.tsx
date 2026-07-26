import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { funderTypeLabel } from "@/lib/funder-type";
import { formatTenure } from "@/lib/format-duration";
import { AdminTabs } from "@/components/admin-tabs";
import { Badge, PrimaryButton, SecondaryButton } from "@/components/ui";
import { approveInstitution, rejectInstitution } from "@/lib/actions/platform-admin";

export default async function AdminInstitutionsPage() {
  await requirePlatformAdmin();

  const institutions = await prisma.institution.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      cohorts: {
        select: { id: true, createdAt: true, memberships: { select: { founderId: true } } },
      },
    },
  });

  const now = new Date();
  const rows = institutions.map((inst) => {
    const founderIds = new Set(inst.cohorts.flatMap((c) => c.memberships.map((m) => m.founderId)));
    const firstCohortAt = inst.cohorts.length
      ? inst.cohorts.reduce((min, c) => (c.createdAt < min ? c.createdAt : min), inst.cohorts[0].createdAt)
      : null;
    return {
      id: inst.id,
      name: inst.name,
      funderType: inst.funderType,
      contactName: inst.contactName,
      contactEmail: inst.contactEmail,
      status: inst.status,
      cohortCount: inst.cohorts.length,
      founderCount: founderIds.size,
      createdAt: inst.createdAt,
      firstCohortAt,
    };
  });

  const pending = rows.filter((r) => r.status === "pending");
  const rest = rows.filter((r) => r.status !== "pending");

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-navy text-2xl font-bold">Funders</h1>
        <p className="text-navy/50 text-sm mt-1">
          Every funder institution on the platform: {rows.length} total.
        </p>
      </div>

      <AdminTabs active="/admin" />

      {pending.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-navy font-semibold text-sm">
            Pending review ({pending.length})
          </p>
          <div className="flex flex-col divide-y divide-amber-200 border border-amber-300 bg-amber-50 rounded-xl overflow-hidden">
            {pending.map((row) => (
              <div key={row.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="text-navy font-semibold">{row.name}</p>
                  <p className="text-navy/60 text-xs mt-0.5">
                    {funderTypeLabel(row.funderType)}
                    {row.contactName && ` · ${row.contactName}`}
                    {row.contactEmail && ` · ${row.contactEmail}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <form action={rejectInstitution}>
                    <input type="hidden" name="institutionId" value={row.id} />
                    <SecondaryButton type="submit" className="px-4 py-1.5 text-xs">
                      Reject
                    </SecondaryButton>
                  </form>
                  <form action={approveInstitution}>
                    <input type="hidden" name="institutionId" value={row.id} />
                    <PrimaryButton type="submit" className="px-4 py-1.5 text-xs">
                      Approve
                    </PrimaryButton>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {rest.length === 0 ? (
        <p className="text-navy/60 text-sm">No approved institutions yet.</p>
      ) : (
        <div className="flex flex-col divide-y divide-navy/10 border border-navy/10 rounded-xl overflow-hidden">
          {rest.map((row) => (
            <Link
              key={row.id}
              href={`/admin/institutions/${row.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-navy/5 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-navy font-semibold">{row.name}</p>
                  {row.status === "rejected" && <Badge tone="warning">Rejected</Badge>}
                </div>
                <p className="text-navy/50 text-xs mt-0.5">
                  {funderTypeLabel(row.funderType)} · {row.cohortCount} cohort{row.cohortCount === 1 ? "" : "s"} ·{" "}
                  {row.founderCount} founder{row.founderCount === 1 ? "" : "s"}
                </p>
                <p className="text-navy/40 text-xs mt-0.5">
                  Joined {row.createdAt.toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}
                  {" · "}using Founda21 for {formatTenure(row.createdAt, now)}
                  {row.firstCohortAt && row.firstCohortAt.getTime() !== row.createdAt.getTime() && (
                    <> · first cohort {formatTenure(row.firstCohortAt, now)} ago</>
                  )}
                </p>
              </div>
              <span className="text-navy/60 text-sm shrink-0 ml-4">View →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
