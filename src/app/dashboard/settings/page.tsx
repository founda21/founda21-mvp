import { requireInstitutionAdmin } from "@/lib/auth";
import { updatePassword } from "@/lib/actions/auth";
import { updateInstitutionDetails } from "@/lib/actions/institution";
import { updateTheme, getTheme } from "@/lib/actions/theme";
import { Field, Input, PrimaryButton, SecondaryButton, ErrorBanner, InfoBanner } from "@/components/ui";
import { BackLink } from "@/components/back-link";

export default async function DashboardSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const { user, institution } = await requireInstitutionAdmin();
  const theme = await getTheme();

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-8">
      <BackLink href="/dashboard" label="Back to dashboard" />

      <div>
        <h1 className="text-navy text-2xl font-bold">Settings</h1>
        <p className="text-navy/60 text-sm mt-1">{user.email}</p>
      </div>

      <ErrorBanner message={error} />
      <InfoBanner message={message} />

      <div className="rounded-xl border border-navy/10 p-5 flex flex-col gap-4">
        <p className="text-navy font-semibold text-sm">Theme</p>
        <p className="text-navy/60 text-xs -mt-2">Applies to your view only, other institution users choose their own.</p>
        <form action={updateTheme} className="flex gap-2">
          <button
            type="submit"
            name="theme"
            value="light"
            className={`flex-1 rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${
              theme === "light" ? "border-emerald bg-emerald/5 text-navy" : "border-navy/15 text-navy/60 hover:bg-navy/5"
            }`}
          >
            Light
          </button>
          <button
            type="submit"
            name="theme"
            value="dark"
            className={`flex-1 rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${
              theme === "dark" ? "border-emerald bg-emerald/5 text-navy" : "border-navy/15 text-navy/60 hover:bg-navy/5"
            }`}
          >
            Dark
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-navy/10 p-5 flex flex-col gap-4">
        <p className="text-navy font-semibold text-sm">Organisation details</p>
        <form action={updateInstitutionDetails} className="flex flex-col gap-4">
          <Field label="Organisation name">
            <Input name="name" type="text" required defaultValue={institution.name} />
          </Field>
          <Field label="Contact name">
            <Input name="contactName" type="text" defaultValue={institution.contactName ?? ""} placeholder="Optional" />
          </Field>
          <Field label="Contact email">
            <Input name="contactEmail" type="email" defaultValue={institution.contactEmail ?? ""} placeholder="Optional" />
          </Field>
          <SecondaryButton type="submit" className="self-start">
            Save details
          </SecondaryButton>
        </form>
      </div>

      <div className="rounded-xl border border-navy/10 p-5 flex flex-col gap-4">
        <p className="text-navy font-semibold text-sm">Change password</p>
        <form action={updatePassword} className="flex flex-col gap-4">
          <input type="hidden" name="redirectPath" value="/dashboard/settings" />
          <Field label="New password">
            <Input name="password" type="password" required minLength={8} placeholder="At least 8 characters" />
          </Field>
          <Field label="Confirm new password">
            <Input name="confirmPassword" type="password" required minLength={8} placeholder="Repeat your new password" />
          </Field>
          <PrimaryButton type="submit" className="self-start">
            Update password
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
}
