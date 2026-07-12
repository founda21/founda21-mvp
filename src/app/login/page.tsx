import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { Field, Input, PrimaryButton, ErrorBanner, InfoBanner } from "@/components/ui";
import { FixedBackLink } from "@/components/back-link";
import { login } from "@/lib/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 gap-8">
      <FixedBackLink href="/" label="Home" />
      <Wordmark className="text-2xl" />

      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-navy text-2xl font-bold">Log in</h1>
        </div>

        <ErrorBanner message={error} />
        <InfoBanner message={message} />

        <form action={login} className="flex flex-col gap-4">
          <Field label="Email">
            <Input name="email" type="email" required placeholder="you@example.com" />
          </Field>
          <Field label="Password">
            <Input name="password" type="password" required placeholder="Your password" />
          </Field>
          <Link href="/forgot-password" className="text-emerald text-sm font-semibold -mt-2 self-end">
            Forgot password?
          </Link>
          <PrimaryButton type="submit" className="mt-2">
            Log in
          </PrimaryButton>
        </form>

        <p className="text-center text-sm text-navy/60">
          Institution admin?{" "}
          <Link href="/signup" className="text-emerald font-semibold">
            Create an account
          </Link>
          <br />
          Founder?{" "}
          <Link href="/get-started/founder" className="text-emerald font-semibold">
            Enter your funder&apos;s passcode
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
