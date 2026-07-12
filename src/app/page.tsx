import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { FUNDER_TYPE_OPTIONS } from "@/lib/funder-type";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 sm:px-12 py-6 flex items-center justify-between">
        <Wordmark className="text-2xl" />
        <nav className="flex items-center gap-4">
          <Link href="/login" className="text-navy/60 text-sm font-semibold hover:text-navy">
            Log in
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 sm:px-12 py-16 gap-16">
        <div className="flex flex-col items-center text-center gap-6 max-w-3xl">
          <p className="text-emerald text-sm sm:text-base font-semibold tracking-wide uppercase">
            The Founder Readiness Standard · South Africa First
          </p>

          <h1 className="text-navy text-4xl sm:text-6xl font-bold tracking-tight leading-tight">
            Know which founders are
            <br />
            <span className="text-emerald">actually investable.</span>
          </h1>

          <p className="text-navy/70 max-w-xl text-base sm:text-lg">
            21 checkpoints, five dimensions, scored by AI — not a self-reported survey. Founda21
            gives funders a portable, verifiable readiness credential for every founder in their
            pipeline, plus the eligibility and outcome reporting that goes with it.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 w-full max-w-2xl">
          <Link
            href="/get-started/funder"
            className="flex flex-col gap-2 rounded-2xl border-2 border-emerald bg-emerald/5 p-6 hover:shadow-md transition-all"
          >
            <span className="text-emerald text-xs font-semibold uppercase tracking-wide">Funder</span>
            <span className="text-navy text-lg font-bold">I&apos;m a Funder</span>
            <span className="text-navy/60 text-sm">
              Corporates, DFIs, universities, accelerators, and investors — issue passcodes, track
              readiness, and get funder-facing reports.
            </span>
          </Link>

          <Link
            href="/get-started/founder/funding-guide"
            className="flex flex-col gap-2 rounded-2xl border-2 border-navy/15 p-6 hover:border-navy hover:shadow-md transition-all"
          >
            <span className="text-navy/60 text-xs font-semibold uppercase tracking-wide">Founder</span>
            <span className="text-navy text-lg font-bold">I&apos;m a Founder</span>
            <span className="text-navy/60 text-sm">
              Have a passcode from your funder? Enter it to start the 21 checkpoints and earn your
              Founda21 Investable credential.
            </span>
          </Link>
        </div>

        <div className="w-full max-w-4xl flex flex-col items-center gap-6">
          <p className="text-navy/40 text-xs font-semibold uppercase tracking-wide">Who it&apos;s for</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
            {FUNDER_TYPE_OPTIONS.map((option) => (
              <div key={option.value} className="rounded-xl border border-navy/10 px-4 py-3 text-center">
                <p className="text-navy text-sm font-semibold">{option.label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="px-6 sm:px-12 py-8 text-center text-navy/50 text-xs">
        <Wordmark /> — Founda21 Investable, earned only by clearing all 21. No founder ever pays.
      </footer>
    </div>
  );
}
