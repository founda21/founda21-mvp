import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { Field, Input, PrimaryButton, ErrorBanner, InfoBanner } from "@/components/ui";
import { FixedBackLink } from "@/components/back-link";
import { requestPasswordReset } from "@/lib/actions/auth";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 gap-8">
      <FixedBackLink href="/login" label="Log in" />
      <Wordmark className="text-2xl" />

      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-navy text-2xl font-bold">Reset your password</h1>
          <p className="text-navy/60 text-sm mt-1">
            Enter your account email and we&apos;ll send you a link to set a new password. Delivery can
            take a few minutes — please don&apos;t request more than one at a time.
          </p>
        </div>

        <ErrorBanner message={error} />
        <InfoBanner message={message} />

        <form action={requestPasswordReset} className="flex flex-col gap-4" autoComplete="off">
          <Field label="Email">
            <Input name="email" type="email" required placeholder="you@example.com" autoComplete="off" />
          </Field>
          <PrimaryButton type="submit" className="mt-2">
            Send reset link
          </PrimaryButton>
        </form>

        <p className="text-center text-sm text-navy/60">
          Remembered it?{" "}
          <Link href="/login" className="text-emerald font-semibold">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
