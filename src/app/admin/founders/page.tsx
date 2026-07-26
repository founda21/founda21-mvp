import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatTenure } from "@/lib/format-duration";
import { AdminTabs } from "@/components/admin-tabs";
import { Badge } from "@/components/ui";

export default async function AdminFoundersPage() {
  await requirePlatformAdmin();

  const founders = await prisma.founder.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      stageStatuses: true,
      memberships: {
        where: { status: "active" },
        include: { cohort: { include: { institution: true } } },
      },
    },
  });

  const now = new Date();
  const rows = founders.map((f) => {
    const investable = f.stageStatuses.some((s) => s.stage === 3 && s.status === "passed");
    const institutions = Array.from(
      new Map(f.memberships.map((m) => [m.cohort.institution.id, m.cohort.institution.name])).values(),
    );
    return {
      id: f.id,
      fullName: f.fullName,
      ventureName: f.ventureName,
      currentStage: f.currentStage,
      createdAt: f.createdAt,
      investable,
      institutions,
    };
  });

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-navy text-2xl font-bold">Founders</h1>
        <p className="text-navy/50 text-sm mt-1">Every founder account on the platform: {rows.length} total.</p>
      </div>

      <AdminTabs active="/admin/founders" />

      {rows.length === 0 ? (
        <p className="text-navy/60 text-sm">No founders have signed up yet.</p>
      ) : (
        <div className="flex flex-col divide-y divide-navy/10 border border-navy/10 rounded-xl overflow-hidden">
          {rows.map((row) => (
            <Link
              key={row.id}
              href={`/admin/founders/${row.id}`}
              className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-navy/5 transition-colors"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-navy font-semibold">{row.ventureName}</p>
                  {row.investable ? (
                    <Badge tone="success">Investable</Badge>
                  ) : (
                    <Badge tone="neutral">Stage {row.currentStage}</Badge>
                  )}
                </div>
                <p className="text-navy/50 text-xs mt-0.5">{row.fullName}</p>
                <p className="text-navy/40 text-xs mt-0.5">
                  Started {row.createdAt.toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}
                  {" · "}
                  {formatTenure(row.createdAt, now)} on Founda21
                </p>
                {row.institutions.length > 0 && (
                  <p className="text-navy/40 text-xs mt-1">
                    Used their account with: {row.institutions.join(", ")}
                  </p>
                )}
              </div>
              <span className="text-navy/60 text-sm shrink-0">View →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
