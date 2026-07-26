import { requireInstitutionAdmin } from "@/lib/auth";
import { BackLink } from "@/components/back-link";

export default async function DashboardContractsPage() {
  await requireInstitutionAdmin();

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-8">
      <BackLink href="/dashboard" label="Back to dashboard" />

      <div>
        <h1 className="text-navy text-2xl font-bold">Contracts</h1>
        <p className="text-navy/60 text-sm mt-1">Billing and your agreement with Founda21.</p>
      </div>

      <div className="rounded-xl border border-navy/10 p-8 flex flex-col items-center text-center gap-2">
        <p className="text-navy font-semibold">Coming soon</p>
        <p className="text-navy/60 text-sm max-w-sm">
          Pricing and billing aren&apos;t live yet. This is where you&apos;ll review and manage your
          Founda21 agreement once it&apos;s ready.
        </p>
      </div>
    </div>
  );
}
