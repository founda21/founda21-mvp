import { requireFounder } from "@/lib/auth";
import { deleteFounderAccount } from "@/lib/actions/founder";
import { Field, Input, ErrorBanner } from "@/components/ui";
import { BackLink } from "@/components/back-link";

export default async function FounderSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { founder } = await requireFounder();

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-8">
      <BackLink href="/founder" label="Back to your checkpoints" />

      <div>
        <h1 className="text-navy text-2xl font-bold">Account settings</h1>
        <p className="text-navy/60 text-sm mt-1">{founder.fullName} · {founder.ventureName}</p>
      </div>

      <div className="rounded-xl border border-red-300 bg-red-50 p-5 flex flex-col gap-4">
        <div>
          <p className="text-red-700 font-bold text-sm">Delete my account</p>
          <p className="text-navy/70 text-sm mt-1">
            This permanently deletes your Founda21 account, your login, every checkpoint submission
            and score, your eligibility/outcome data, and your identity records. This cannot be undone
            and cannot be recovered by Founda21 or your funder(s). If you&apos;re enrolled with more
            than one funder, this removes your data from all of them at once.
          </p>
        </div>

        <ErrorBanner message={error} />

        <form action={deleteFounderAccount} className="flex flex-col gap-4">
          <Field label="Confirm your password">
            <Input name="password" type="password" required placeholder="Your password" />
          </Field>
          <Field label='Type "DELETE" to confirm'>
            <Input name="confirmText" type="text" required placeholder="DELETE" />
          </Field>
          <button
            type="submit"
            className="rounded-full bg-red-600 text-white px-6 py-2.5 text-sm font-semibold hover:bg-red-700 transition-colors self-start"
          >
            Permanently delete my account
          </button>
        </form>
      </div>
    </div>
  );
}
