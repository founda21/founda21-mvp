import { requireFounder } from "@/lib/auth";
import { Wordmark } from "@/components/wordmark";
import { Field, Textarea, ErrorBanner, PrimaryButton } from "@/components/ui";
import { VentureStageField } from "@/components/venture-stage-field";
import { FounderEligibilityFields } from "@/components/founder-eligibility-fields";
import { FounderOutcomeIntakeFields } from "@/components/founder-outcome-intake-fields";
import { completeFounderProfile } from "@/lib/actions/founder";

// One-time required step between signup and the checkpoint dashboard — see
// FounderLayout, which redirects here for any founder without a
// FounderEligibility row yet. Deliberately not nested under /founder, so this
// page itself isn't subject to that same redirect.
export default async function CompleteProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { founder } = await requireFounder();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 gap-8">
      <Wordmark className="text-2xl" />

      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-navy text-2xl font-bold">One more thing, {founder.fullName.split(" ")[0]}</h1>
          <p className="text-navy/60 text-sm mt-1">
            Before you start your checkpoints, tell your funder a bit about you and your startup,
            and give them a quick baseline for eligibility and outcome reporting. None of this
            affects your scores.
          </p>
        </div>

        <ErrorBanner message={error} />

        <form action={completeFounderProfile} className="flex flex-col gap-4">
          <Field label="About you">
            <Textarea
              name="bio"
              required
              rows={3}
              placeholder="e.g. Naledi, from Soweto, Johannesburg. Ex-logistics coordinator, now building GreenCart."
            />
          </Field>
          <p className="text-navy/60 text-xs -mt-3">
            Funders will see this, keep it short, it doesn&apos;t need to be formal.
          </p>

          <Field label="About your startup">
            <Textarea
              name="startupSummary"
              required
              rows={3}
              placeholder="e.g. GreenCart helps township spaza shops order stock directly from wholesalers, cutting out middlemen markups."
            />
          </Field>
          <p className="text-navy/60 text-xs -mt-3">
            A quick one-liner or two, not a pitch deck, funders will read this before diving into
            your checkpoints.
          </p>

          <VentureStageField />
          <FounderEligibilityFields />
          <FounderOutcomeIntakeFields />
          <PrimaryButton type="submit" className="mt-2">
            Continue to Stage 1
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
}
