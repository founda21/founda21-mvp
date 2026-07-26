import { requirePlatformAdmin } from "@/lib/auth";
import { updatePassword } from "@/lib/actions/auth";
import { Field, Input, PrimaryButton, ErrorBanner } from "@/components/ui";
import { BackLink } from "@/components/back-link";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { user } = await requirePlatformAdmin();

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-8">
      <BackLink href="/admin" label="Back to institutions" />

      <div>
        <h1 className="text-navy text-2xl font-bold">Admin settings</h1>
        <p className="text-navy/60 text-sm mt-1">{user.email}</p>
      </div>

      <div className="rounded-xl border border-navy/10 p-5 flex flex-col gap-4">
        <p className="text-navy font-semibold text-sm">Change password</p>

        <ErrorBanner message={error} />

        <form action={updatePassword} className="flex flex-col gap-4">
          <input type="hidden" name="redirectPath" value="/admin/settings" />
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
