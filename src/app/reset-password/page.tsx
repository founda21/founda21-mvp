import { Wordmark } from "@/components/wordmark";
import { Field, Input, PrimaryButton, ErrorBanner } from "@/components/ui";
import { updatePassword } from "@/lib/actions/auth";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 gap-8">
      <Wordmark className="text-2xl" />

      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-navy text-2xl font-bold">Set a new password</h1>
        </div>

        <ErrorBanner message={error} />

        <form action={updatePassword} className="flex flex-col gap-4">
          <Field label="New password">
            <Input name="password" type="password" required minLength={8} placeholder="At least 8 characters" />
          </Field>
          <Field label="Confirm new password">
            <Input name="confirmPassword" type="password" required minLength={8} placeholder="Repeat your new password" />
          </Field>
          <PrimaryButton type="submit" className="mt-2">
            Update password
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
}
