import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { Field, Input, PrimaryButton, ErrorBanner } from "@/components/ui";
import { VentureTypeField } from "@/components/venture-type-field";
import { IdentityFields } from "@/components/identity-fields";
import { FixedBackLink } from "@/components/back-link";
import { joinViaPasscode, joinExistingAccountViaPasscode } from "@/lib/actions/founder";

export default async function FounderGetStartedPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; mode?: string }>;
}) {
  const { error, mode } = await searchParams;
  const isLogin = mode === "login";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 gap-8">
      <FixedBackLink href="/" label="Home" />
      <Wordmark className="text-2xl" />

      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-navy text-2xl font-bold">Start your Founda21 assessment</h1>
          <p className="text-navy/60 text-sm mt-1">
            You&apos;ll need the passcode your institution gave you, Founda21 doesn&apos;t offer
            self-serve signup without one.
          </p>
        </div>

        <div className="flex rounded-full border border-navy/15 p-1 text-sm font-semibold">
          <Link
            href="/get-started/founder"
            className={`flex-1 text-center rounded-full py-2 transition-colors ${
              !isLogin ? "bg-brand text-white" : "text-navy/60 hover:bg-navy/5"
            }`}
          >
            New here? Sign up
          </Link>
          <Link
            href="/get-started/founder?mode=login"
            className={`flex-1 text-center rounded-full py-2 transition-colors ${
              isLogin ? "bg-brand text-white" : "text-navy/60 hover:bg-navy/5"
            }`}
          >
            Already have an account? Log in
          </Link>
        </div>

        <ErrorBanner message={error} />

        {isLogin ? (
          <>
            <p className="text-navy/60 text-sm text-center">
              Already working through Founda21 with another institution? Enter the new passcode and log
              in, your checkpoint progress carries over, nothing restarts.
            </p>
            <form action={joinExistingAccountViaPasscode} className="flex flex-col gap-4" autoComplete="off">
              <Field label="Passcode">
                <Input name="passcode" type="text" required placeholder="Passcode from your institution" autoComplete="off" />
              </Field>
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
                Log in and join
              </PrimaryButton>
            </form>
          </>
        ) : (
          <form action={joinViaPasscode} className="flex flex-col gap-4" autoComplete="off">
            <Field label="Passcode">
              <Input name="passcode" type="text" required placeholder="Passcode from your institution" autoComplete="off" />
            </Field>
            <Field label="Your full name">
              <Input name="fullName" type="text" required placeholder="Jane Founder" autoComplete="off" />
            </Field>
            <Field label="Venture name">
              <Input name="ventureName" type="text" required placeholder="Your startup's name" autoComplete="off" />
            </Field>
            <VentureTypeField />
            <Field label="Email">
              <Input name="email" type="email" required placeholder="you@example.com" autoComplete="off" />
            </Field>
            <Field label="Password">
              <Input name="password" type="password" required minLength={8} placeholder="At least 8 characters" autoComplete="new-password" />
            </Field>
            <IdentityFields />

            <label className="flex items-start gap-2.5 text-xs text-navy/60">
              <input type="checkbox" name="provenanceAcknowledged" required className="mt-0.5 accent-emerald" />
              <span>
                I have read and understood the Founda21{" "}
                <Link href="/provenance" target="_blank" rel="noreferrer" className="underline">
                  Provenance &amp; Methodology Statement
                </Link>
                , including how assessment criteria are derived and how to make representations if I
                disagree with an outcome.
              </span>
            </label>

            <PrimaryButton type="submit" className="mt-2">
              Join and start Stage 1
            </PrimaryButton>
          </form>
        )}

        {!isLogin && (
          <p className="text-center text-xs text-navy/60">
            By joining you agree to our{" "}
            <Link href="/terms" className="text-navy/60 underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-navy/60 underline">
              Privacy Policy
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
