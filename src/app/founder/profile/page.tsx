import { requireFounder } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateFounderBio, updateVentureStage } from "@/lib/actions/founder";
import { FounderTabs } from "@/components/founder-tabs";
import { VentureStageField } from "@/components/venture-stage-field";
import { Field, Textarea, PrimaryButton, ErrorBanner, InfoBanner } from "@/components/ui";
import { annualTurnoverBandLabel, entityTypeLabel } from "@/lib/founder-eligibility";
import { ventureStageLabel } from "@/lib/venture-stage";

export default async function FounderProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const { founder } = await requireFounder();
  const eligibility = await prisma.founderEligibility.findUnique({ where: { founderId: founder.id } });

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-navy text-2xl font-bold">{founder.ventureName}</h1>
        <p className="text-navy/60 text-sm mt-1">
          {founder.fullName} · {founder.ventureType} · {ventureStageLabel(founder.ventureStage)}
        </p>
      </div>

      <FounderTabs active="/founder/profile" />

      <ErrorBanner message={error} />
      <InfoBanner message={message} />

      <section className="flex flex-col gap-4">
        <h2 className="text-navy font-bold">About you and your startup</h2>
        <p className="text-navy/60 text-sm -mt-2">Funders see this before they dive into your checkpoints.</p>
        <form action={updateFounderBio} className="flex flex-col gap-4">
          <Field label="About you">
            <Textarea name="bio" required rows={3} defaultValue={founder.bio ?? ""} />
          </Field>
          <Field label="About your startup">
            <Textarea name="startupSummary" required rows={3} defaultValue={founder.startupSummary ?? ""} />
          </Field>
          <PrimaryButton type="submit" className="self-start">
            Save
          </PrimaryButton>
        </form>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-navy font-bold">Venture stage</h2>
        <form action={updateVentureStage} className="flex flex-col gap-4">
          <VentureStageField defaultValue={founder.ventureStage ?? undefined} />
          <PrimaryButton type="submit" className="self-start">
            Save
          </PrimaryButton>
        </form>
      </section>

      {eligibility && (
        <section className="flex flex-col gap-3">
          <div>
            <h2 className="text-navy font-bold">Eligibility & reporting details</h2>
            <p className="text-navy/60 text-sm mt-1">
              This is what your funder(s) use for eligibility and outcome reporting — it never affects your
              checkpoint scores. If anything here is wrong, ask your funder to help you correct it, since it
              feeds their own reporting.
            </p>
          </div>
          <div className="rounded-xl border border-navy/10 bg-navy/[0.03] p-5 grid sm:grid-cols-2 gap-3">
            <ReadOnlyField label="Black ownership" value={`${eligibility.blackOwnershipPct}%`} />
            <ReadOnlyField label="Black women ownership" value={`${eligibility.blackWomenOwnershipPct}%`} />
            <ReadOnlyField label="Annual turnover band" value={annualTurnoverBandLabel(eligibility.annualTurnoverBand)} />
            <ReadOnlyField label="Entity type" value={entityTypeLabel(eligibility.entityType)} />
            <ReadOnlyField label="CIPC number" value={eligibility.cipcNumber ?? "—"} />
          </div>
        </section>
      )}
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-navy/50 text-xs font-semibold uppercase">{label}</p>
      <p className="text-navy text-sm mt-0.5">{value}</p>
    </div>
  );
}
