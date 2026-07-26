import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { Field, Input, PrimaryButton, ErrorBanner } from "@/components/ui";
import { FunderTypeField } from "@/components/funder-type-field";
import { FixedBackLink } from "@/components/back-link";
import { signUpInstitution } from "@/lib/actions/auth";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; type?: string }>;
}) {
  const { error, type } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 gap-8">
      <FixedBackLink href="/get-started/funder" label="What kind of funder are you?" />
      <Wordmark className="text-2xl" />

      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-navy text-2xl font-bold">Create your funder account</h1>
          <p className="text-navy/60 text-sm mt-1">
            For funders running founders through the Founda21 standard.
          </p>
        </div>

        <ErrorBanner message={error} />

        <form action={signUpInstitution} className="flex flex-col gap-4" autoComplete="off">
          <Field label="Organisation name">
            <Input name="institutionName" type="text" required placeholder="e.g. Founda Accelerator" autoComplete="off" />
          </Field>
          <FunderTypeField defaultValue={type} />
          <Field label="Contact name (optional)">
            <Input name="contactName" type="text" placeholder="Jane Admin" autoComplete="off" />
          </Field>
          <Field label="Admin email">
            <Input name="email" type="email" required placeholder="you@organisation.org" autoComplete="off" />
          </Field>
          <Field label="Password">
            <Input name="password" type="password" required minLength={8} placeholder="At least 8 characters" autoComplete="new-password" />
          </Field>

          <label className="flex items-start gap-2.5 text-xs text-navy/60">
            <input type="checkbox" name="provenanceAcknowledged" required className="mt-0.5 accent-emerald" />
            <span>
              I have read and understood the Founda21 Standard{" "}
              <Link href="/methodology" target="_blank" rel="noreferrer" className="underline">
                Provenance &amp; Methodology Statement
              </Link>
              , including how assessment criteria are derived and how to make representations if I
              disagree with an outcome.
            </span>
          </label>

          <PrimaryButton type="submit" className="mt-2">
            Create account
          </PrimaryButton>
        </form>

        <p className="text-center text-xs text-navy/60">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="text-navy/60 underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-navy/60 underline">
            Privacy Policy
          </Link>
          .
        </p>

        <p className="text-center text-sm text-navy/60">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald font-semibold">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
