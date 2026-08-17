import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { PrimaryButton } from "@/components/ui";
import { MarketingSections } from "@/components/marketing-sections";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TiltCard } from "@/components/tilt-card";
import { ScrollReveal } from "@/components/scroll-reveal";
import { RequestAssessmentForm } from "@/components/request-assessment-form";

export const metadata: Metadata = {
  title: "Founda21 — Independent Readiness Assessment for African Ventures",
  description:
    "We assess your ventures against 21 fixed checkpoints and give you a written report on each one. Independent, not a decision-maker, no equity taken.",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 flex flex-col items-center w-full">
        {/* Hero */}
        <section className="relative w-full flex flex-col items-center overflow-hidden">
          <div
            aria-hidden
            className="animate-drift pointer-events-none absolute -top-24 -left-24 w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-emerald/20 blur-[70px]"
          />
          <div
            aria-hidden
            className="animate-drift pointer-events-none absolute -top-16 -right-24 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-navy/15 blur-[80px]"
            style={{ animationDelay: "1.5s" }}
          />

          <div className="relative w-full max-w-6xl px-4 sm:px-12 pt-8 sm:pt-24 pb-12 sm:pb-20 grid lg:grid-cols-[1.1fr_0.9fr] gap-8 sm:gap-14 items-center">
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4 sm:gap-6">
              <p className="text-emerald text-xs sm:text-base font-semibold tracking-wide uppercase">
                Independent Readiness Assessment · South Africa First
              </p>
              <h1 className="text-navy text-3xl sm:text-6xl font-bold tracking-tight leading-tight">
                Independent readiness assessment for
                <br className="hidden sm:block" />{" "}
                <span className="text-emerald">early-stage African ventures.</span>
              </h1>
              <p className="text-navy/70 max-w-xl text-sm sm:text-lg">
                We assess your ventures against 21 fixed checkpoints and give you a written report on
                each one, scored consistently against five dimensions, not invented, not self-reported.
              </p>
              <Link href="#request-assessment" className="animate-float-loop-slow inline-block">
                <PrimaryButton type="button" className="px-7 sm:px-9 py-3 sm:py-4 text-base sm:text-lg shadow-[0_10px_30px_rgba(1,136,78,0.3)] hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(1,136,78,0.4)] transition-transform">
                  Request an assessment
                </PrimaryButton>
              </Link>
              <p className="text-navy/60 text-xs">
                No founder ever pays. You get a written report per venture, a cohort report for the
                group, and a live dashboard.
              </p>
            </div>

            {/* Floating 3D report-summary card, desktop only. Three nested
                layers, each owning its own transform, so the one-shot
                entrance, the infinite bob, and the mouse-driven tilt never
                fight over the same element's `transform` property. */}
            <div className="hidden lg:flex justify-center [perspective:1200px]">
              <div className="animate-float-in">
                <div className="animate-float-loop">
                  <TiltCard className="rounded-3xl border border-navy/10 bg-white p-7 w-80 shadow-[0_30px_60px_rgba(10,31,68,0.16)]">
                    <div className="flex items-center justify-between mb-5">
                      <Wordmark className="text-base" />
                      <span className="rounded-full bg-emerald/15 text-emerald text-[10px] font-bold uppercase tracking-wide px-2.5 py-1">
                        Investable
                      </span>
                    </div>
                    <p className="text-navy/60 text-xs uppercase tracking-wide font-semibold">Venture Readiness Report</p>
                    <p className="text-navy text-3xl font-bold mb-4">21 / 21 checkpoints</p>
                    <div className="flex flex-col gap-2">
                      {[
                        { label: "Idea & Reality", value: 100 },
                        { label: "Company & Traction", value: 100 },
                        { label: "Investor & Deal Readiness", value: 100 },
                      ].map((row) => (
                        <div key={row.label}>
                          <div className="flex items-center justify-between text-[11px] text-navy/50 mb-1">
                            <span>{row.label}</span>
                            <span>{row.value}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-navy/10 overflow-hidden">
                            <div className="h-full rounded-full bg-emerald" style={{ width: `${row.value}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </TiltCard>
                </div>
              </div>
            </div>
          </div>
        </section>

        <MarketingSections />

        {/* Provenance (scroll section, not a tab) */}
        <section className="relative w-full bg-navy/[0.03] px-4 sm:px-12 py-12 sm:py-20 overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-[420px] sm:h-[420px] rounded-full bg-emerald/5 blur-[80px]"
          />
          <ScrollReveal className="relative max-w-4xl mx-auto grid sm:grid-cols-[0.8fr_1.2fr] gap-6 sm:gap-10 items-center tilt-group">
            <div className="tilt-card-alt tilt-card mx-auto rounded-3xl border border-navy/10 bg-white p-6 sm:p-7 w-full max-w-xs shadow-[0_20px_40px_rgba(10,31,68,0.1)]">
              <p className="text-emerald text-4xl sm:text-5xl font-bold">60%+</p>
              <p className="text-navy/60 text-sm mt-2">
                of rejected African startup pitches in 2024 lacked robust financial projections or a
                clear go-to-market strategy (CcHUB).
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:gap-4 text-center sm:text-left">
              <h2 className="text-navy text-2xl sm:text-3xl font-bold">Not invented by AI</h2>
              <p className="text-navy/70 text-base sm:text-lg">
                The 21 checkpoints come from structured research into what real funders, ESD fund
                managers, DFIs, and accelerators publicly say they require. AI applies those checkpoints
                consistently to every venture; it didn&apos;t decide what matters.
              </p>
              <Link href="/provenance" className="text-emerald font-semibold text-sm underline self-center sm:self-start">
                Read the full provenance and methodology statement
              </Link>
            </div>
          </ScrollReveal>
        </section>

        {/* Request an assessment */}
        <section className="relative w-full bg-brand px-4 sm:px-12 py-14 sm:py-20 flex flex-col items-center gap-8 overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 left-1/2 -translate-x-1/2 w-72 h-40 sm:w-[500px] sm:h-52 rounded-full bg-emerald/25 blur-[70px]"
          />
          <div className="relative text-center flex flex-col gap-2">
            <h2 className="text-white text-2xl sm:text-3xl font-bold">Ready to see who&apos;s actually ready?</h2>
            <p className="text-white/70 text-sm sm:text-base max-w-lg">
              Send us your ventures. We&apos;ll assess them independently and hand you the report.
            </p>
          </div>
          <div className="relative w-full">
            <RequestAssessmentForm redirectTo="/" error={error} message={message} />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
