import { Field, Input, Select, PrimaryButton, ErrorBanner } from "@/components/ui";
import { BackLink } from "@/components/back-link";
import { createCohort } from "@/lib/actions/cohort";

export default async function NewCohortPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="max-w-md mx-auto flex flex-col gap-6">
      <BackLink href="/dashboard" label="Back to cohorts" />
      <h1 className="text-navy text-2xl font-bold">New cohort</h1>
      <ErrorBanner message={error} />
      <form action={createCohort} className="flex flex-col gap-4">
        <Field label="Cohort name">
          <Input name="name" type="text" required placeholder="e.g. 2026 Q1 Cohort" />
        </Field>
        <Field label="Intended entry stage">
          <Select name="intendedEntryStage" defaultValue="1">
            <option value="1">Stage 1</option>
            <option value="2">Stage 2</option>
            <option value="3">Stage 3</option>
          </Select>
        </Field>
        <Field label="Max uses (optional)">
          <Input name="maxUses" type="number" min={1} placeholder="Unlimited" />
        </Field>
        <Field label="Expires on (optional)">
          <Input name="expiresAt" type="date" />
        </Field>
        <PrimaryButton type="submit" className="mt-2">
          Create cohort
        </PrimaryButton>
      </form>
    </div>
  );
}
