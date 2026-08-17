import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { FixedBackLink } from "@/components/back-link";
import { FUNDER_TYPE_OPTIONS } from "@/lib/funder-type";

export default function FunderTypeChooserPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 gap-10">
      <FixedBackLink href="/" label="Home" />
      <Wordmark className="text-2xl" />

      <div className="text-center max-w-lg">
        <h1 className="text-navy text-3xl font-bold tracking-tight">What kind of institution are you?</h1>
        <p className="text-navy/60 text-sm mt-2">
          This tailors your dashboard and reports, the underlying assessment is the same for
          everyone.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 w-full max-w-3xl">
        {FUNDER_TYPE_OPTIONS.map((option) => (
          <Link
            key={option.value}
            href={`/signup?type=${option.value}`}
            className="flex flex-col gap-2 rounded-2xl border border-navy/15 p-6 hover:border-emerald hover:shadow-sm transition-all"
          >
            <span className="text-navy text-lg font-bold">{option.label}</span>
            <span className="text-navy/60 text-sm">{option.description}</span>
          </Link>
        ))}
      </div>

      <Link href="/login" className="text-navy/50 text-sm hover:text-navy">
        Already have an account? Log in
      </Link>
    </div>
  );
}
