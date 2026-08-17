import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Why Us — Founda21",
  description: "Why an independent assessor, where the rubric comes from, and what we can't yet claim.",
};

export default function WhyUsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 px-6 sm:px-12 py-14 sm:py-20">
        <div className="max-w-2xl mx-auto flex flex-col gap-14">
          <div className="flex flex-col gap-3">
            <p className="text-emerald text-xs font-semibold uppercase tracking-wide">Why us</p>
            <h1 className="text-navy text-3xl sm:text-4xl font-bold tracking-tight">
              You don&apos;t have to take our word for it.
            </h1>
          </div>

          <section className="flex flex-col gap-3">
            <h2 className="text-navy text-xl font-bold">1. You don&apos;t have to agree with our rubric</h2>
            <p className="text-navy/70 text-base leading-relaxed">
              An institution does not need to believe our 21 checkpoints are the only correct 21. It
              needs three things to be true, and all three are verifiable by reading the reports:
            </p>
            <ul className="flex flex-col gap-2 pl-1">
              <li className="flex items-start gap-2.5 text-navy/70 text-base">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald shrink-0 mt-2.5" />
                <span>The same checkpoints were applied to every venture.</span>
              </li>
              <li className="flex items-start gap-2.5 text-navy/70 text-base">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald shrink-0 mt-2.5" />
                <span>Every score carries written reasoning you can read and check.</span>
              </li>
              <li className="flex items-start gap-2.5 text-navy/70 text-base">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald shrink-0 mt-2.5" />
                <span>Nobody involved in the assessment had a stake in the outcome.</span>
              </li>
            </ul>
            <p className="text-navy/70 text-base leading-relaxed">
              None of this requires trusting our judgement. It requires reading our output.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-navy text-xl font-bold">2. Where the rubric comes from</h2>
            <p className="text-navy/70 text-base leading-relaxed">
              The criteria were derived from structured research into the publicly stated funding
              requirements of South African and African investors, development finance institutions and
              accelerators, alongside published ecosystem research. They were not invented by an AI.
            </p>
            <p className="text-navy/70 text-base leading-relaxed">
              The AI&apos;s role is narrow and deliberate: to apply that fixed, human-derived standard
              identically to every venture, removing the variance that comes from mood, relationship,
              fatigue or familiarity.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-navy text-xl font-bold">3. The whole rubric is public</h2>
            <p className="text-navy/70 text-base leading-relaxed">
              All 21 checkpoints, all five dimensions and every threshold are published at{" "}
              <Link href="/assessment" className="text-emerald underline font-semibold">
                /assessment
              </Link>
              . Nothing is hidden. Any institution can read the full criteria and disagree with them
              before engaging us.
            </p>
            <p className="text-navy/70 text-base leading-relaxed">
              Hidden criteria are what make assessment feel arbitrary. Ours are open.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-navy text-xl font-bold">4. Anyone can dispute an outcome — or a criterion</h2>
            <p className="text-navy/70 text-base leading-relaxed">
              Any founder or institution may dispute an assessment outcome in writing. Any founder or
              institution may also dispute a criterion in the standard itself.
            </p>
            <p className="text-navy/70 text-base leading-relaxed">
              Where a genuine error is found, we correct it, and where the correction affects the
              rubric, we publish the change.
            </p>
            <p className="text-navy/70 text-base leading-relaxed">
              We think this is a stronger commitment than claiming to be right.
            </p>
          </section>

          <section className="flex flex-col gap-3 rounded-2xl border border-navy/10 bg-navy/[0.03] p-6">
            <h2 className="text-navy text-xl font-bold">5. What we cannot yet claim</h2>
            <p className="text-navy/70 text-base leading-relaxed">
              We do not yet have outcome data. The strongest possible validation of a readiness
              assessment is whether high-scoring ventures go on to raise capital, survive and grow.
              Establishing that takes years of tracked cohorts, and we are at the beginning of that
              work.
            </p>
            <p className="text-navy/70 text-base leading-relaxed">
              What we can demonstrate today is consistency, transparency and independence. What we
              cannot yet demonstrate is predictive accuracy. We would rather say so than imply
              otherwise.
            </p>
          </section>

          <div className="rounded-2xl border border-navy/10 bg-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_8px_24px_rgba(10,31,68,0.06)]">
            <p className="text-navy/70 text-sm">Read the rubric itself, or send us your ventures.</p>
            <div className="flex gap-3 shrink-0">
              <Link
                href="/assessment"
                className="rounded-full border border-navy text-navy px-5 py-2.5 text-sm font-semibold hover:bg-brand hover:text-white transition-colors whitespace-nowrap"
              >
                See the rubric
              </Link>
              <Link
                href="/institutions#request-assessment"
                className="rounded-full bg-emerald text-white px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Request an assessment
              </Link>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
