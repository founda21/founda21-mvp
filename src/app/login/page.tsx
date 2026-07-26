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
          <p className="text-navy/60 text-sm mt-1">
            Founders, funders, and Founda21 admins all log in right here, one account, one password.
          </p>
        </div>

        <ErrorBanner message={error} />
        <InfoBanner message={message} />

        <form action={login} className="flex flex-col gap-4" autoComplete="off">
          <Field label="Email">
            <Input name="email" type="email" required placeholder="you@example.com" autoComplete="off" />
          </Field>
          <Field label="Password">
            <Input name="password" type="password" required placeholder="Your password" autoComplete="off" />
          </Field>
          <Link href="/forgot-password" className="text-emerald text-sm font-semibold -mt-2 self-end">
            Forgot password?
          </Link>
          <PrimaryButton type="submit" className="mt-2">
            Log in
          </PrimaryButton>
        </form>

        <p className="text-center text-sm text-navy/60">
          Founder, already have an account? Log in above to check your progress, update checkpoints,
          or add an outcome snapshot, no passcode needed unless you&apos;re joining a new funder.
        </p>

        <p className="text-center text-sm text-navy/60">
          New institution?{" "}
          <Link href="/signup" className="text-emerald font-semibold">
            Create an account
          </Link>
          <br />
          New founder, no account yet?{" "}
          <Link href="/get-started/founder" className="text-emerald font-semibold">
            Enter your funder&apos;s passcode
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
