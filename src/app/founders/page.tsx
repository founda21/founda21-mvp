import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "For Founders — Founda21",
  description: "What the Founda21 assessment is, what it costs you (nothing), and your rights as a founder going through it.",
};

// Documentation for founders already holding a passcode, NOT a marketing
// funnel (§ positioning brief §4.3) — linked from the footer and the
// passcode screen, deliberately never a homepage CTA.
export default function FoundersPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 px-6 sm:px-12 pb-16">
        <div className="max-w-2xl mx-auto flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <p className="text-navy/50 text-xs font-semibold uppercase tracking-wide">For founders</p>
            <h1 className="text-navy text-3xl sm:text-4xl font-bold tracking-tight">
              What this is, and what it costs you.
            </h1>
            <p className="text-navy/70 text-base sm:text-lg">
              You&apos;re here because an institution — a corporate ESD programme, DFI, university,
              accelerator or investor — sent you a passcode. Here&apos;s exactly what happens, and
              what you&apos;re entitled to.
            </p>
          </div>

          <section className="flex flex-col gap-2">
            <h2 className="text-navy font-bold text-lg">What you&apos;re being assessed against</h2>
            <p className="text-navy/70 text-sm">
              21 fixed checkpoints across three stages, each scored out of 100 across five dimensions:
              Substance, Evidence, SA Reality Fit, Rigour &amp; Coherence, and Investor Credibility. Every
              founder is scored against the exact same rubric. See the{" "}
              <Link href="/assessment" className="text-emerald underline">
                full checkpoint list
              </Link>{" "}
              and the{" "}
              <Link href="/provenance" className="text-emerald underline">
                provenance and methodology statement
              </Link>
              .
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-navy font-bold text-lg">You never pay, for anything, ever</h2>
            <p className="text-navy/70 text-sm">
              There is no founder wallet, no premium tier, no faster queue. The institution that sent
              you your passcode pays for the assessment, not you. This is not a policy that could
              change on you later — it&apos;s structural to how Founda21 is built.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-navy font-bold text-lg">Your eligibility and outcome data is never scored</h2>
            <p className="text-navy/70 text-sm">
              Some institutions ask for B-BBEE/ESD eligibility details and outcome metrics (capital
              raised, headcount, revenue) for their own reporting. That data is stored separately from
              your checkpoint submissions and is never read by the scoring engine, structurally, not by
              policy. It cannot raise or lower a single checkpoint score.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-navy font-bold text-lg">We don&apos;t ask for a government ID number</h2>
            <p className="text-navy/70 text-sm">
              Your phone number is the only thing used to stop one person opening duplicate accounts.
              No SA ID number, no passport number, is collected at any point.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-navy font-bold text-lg">Your result is yours, and it travels with you</h2>
            <p className="text-navy/70 text-sm">
              Enter a second institution&apos;s passcode and it adds that institution to your existing
              account, nothing resets. A checkpoint you&apos;ve already passed stays passed. Your
              assessment result belongs to you, not to whichever institution first sent you a passcode.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-navy font-bold text-lg">You can delete your account and data</h2>
            <p className="text-navy/70 text-sm">
              Under POPIA, you can permanently delete your account and every checkpoint submission
              yourself, at any time, from your account settings, no one needs to action it for you.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-navy font-bold text-lg">You can dispute an outcome</h2>
            <p className="text-navy/70 text-sm">
              If you disagree with a score, or with any checkpoint itself, write to us at{" "}
              <a className="underline" href="mailto:foundarsa@gmail.com">
                foundarsa@gmail.com
              </a>
              . We read every message and respond in writing. Full detail on how this works is in the{" "}
              <Link href="/provenance" className="text-emerald underline">
                provenance and methodology statement
              </Link>
              .
            </p>
          </section>

          <div className="rounded-xl border border-navy/10 bg-navy/[0.03] p-5">
            <p className="text-navy/70 text-sm">
              Have a passcode already?{" "}
              <Link href="/get-started" className="text-emerald font-semibold underline">
                Enter it here
              </Link>
              .
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
