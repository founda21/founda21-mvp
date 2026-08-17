import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FUNDER_TYPE_OPTIONS } from "@/lib/funder-type";
import { RequestAssessmentForm } from "@/components/request-assessment-form";

export const metadata: Metadata = {
  title: "For Institutions — Founda21",
  description: "Client categories, engagement process, deliverables, and how pricing works for Founda21's independent venture assessment.",
};

const ENGAGEMENT = [
  { step: "1", title: "Scope the engagement", body: "Tell us how many ventures, and when. We confirm scope and pricing before anything starts, no online checkout." },
  { step: "2", title: "We issue a passcode", body: "One passcode covers your whole cohort. You distribute it through your own channels." },
  { step: "3", title: "Ventures are assessed", body: "Each venture works through 21 fixed checkpoints, scored against five dimensions, at no cost to them." },
  { step: "4", title: "We deliver the reports", body: "A Venture Readiness Report per venture and a Cohort Report for the group, both written, both yours." },
  { step: "5", title: "Re-assess to track progress", body: "Run the same cohort through again later for a Progress Report showing what actually moved." },
];

const DELIVERABLES = [
  {
    name: "Venture Readiness Report",
    tagline: "One per venture",
    body: "Score out of 100 per checkpoint across five dimensions; written reasoning for every dimension; the evidence submitted; a dated record of every attempt. Delivered to you and to the founder, free to the founder, permanently.",
  },
  {
    name: "Cohort Report",
    tagline: "One per group",
    body: "Every venture ranked by measured readiness; pass rates by stage and checkpoint; failure patterns across the group; eligibility and outcome fields captured for your own reporting, recorded, never scored. Excel export.",
  },
  {
    name: "Progress Report",
    tagline: "Where a cohort is assessed twice",
    body: "The same ventures measured before and after a programme, showing movement per venture and per dimension.",
  },
];

export default async function InstitutionsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 px-6 sm:px-12 py-14 sm:py-20">
        <div className="max-w-3xl mx-auto flex flex-col gap-14">
          <div className="flex flex-col gap-3">
            <p className="text-emerald text-xs font-semibold uppercase tracking-wide">For institutions</p>
            <h1 className="text-navy text-3xl sm:text-4xl font-bold tracking-tight">
              An independent read on every venture in your pipeline.
            </h1>
            <p className="text-navy/70 text-base sm:text-lg max-w-2xl">
              An institution sends us its ventures. We run each one through the same 21 checkpoints,
              score every checkpoint against the same five dimensions, and return a written report
              saying where that venture is strong, where it is weak, and exactly what it needs to fix.
              You keep the reports and make every decision yourself.
            </p>
          </div>

          {/* Who we work with */}
          <section className="flex flex-col gap-5">
            <h2 className="text-navy text-xl font-bold">Who we work with</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {FUNDER_TYPE_OPTIONS.map((f) => (
                <div key={f.value} className="rounded-xl border border-navy/10 p-5">
                  <p className="text-navy font-semibold text-sm">{f.label}</p>
                  <p className="text-navy/60 text-xs mt-1">{f.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Engagement process */}
          <section className="flex flex-col gap-5">
            <h2 className="text-navy text-xl font-bold">How an engagement runs</h2>
            <div className="flex flex-col gap-4">
              {ENGAGEMENT.map((s) => (
                <div key={s.step} className="flex items-start gap-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand text-white text-sm font-bold shrink-0">
                    {s.step}
                  </span>
                  <div>
                    <p className="text-navy font-semibold text-sm">{s.title}</p>
                    <p className="text-navy/60 text-sm mt-0.5">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Deliverables */}
          <section className="flex flex-col gap-5">
            <h2 className="text-navy text-xl font-bold">What you receive</h2>
            <div className="flex flex-col gap-4">
              {DELIVERABLES.map((d) => (
                <div key={d.name} className="rounded-xl border border-navy/10 bg-navy/[0.03] p-5">
                  <p className="text-emerald text-xs font-semibold uppercase tracking-wide">{d.tagline}</p>
                  <p className="text-navy font-bold">{d.name}</p>
                  <p className="text-navy/60 text-sm mt-1">{d.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing — model only, no figures published (§ Brief 2 §2) */}
          <section className="flex flex-col gap-3">
            <h2 className="text-navy text-xl font-bold">Pricing</h2>
            <p className="text-navy/70 text-base max-w-2xl">
              Founda21 is priced per cohort, by size. A cohort is one group of ventures assessed in one
              cycle, and the price covers every Venture Readiness Report plus the Cohort Report.
            </p>
            <p className="text-navy/70 text-base max-w-2xl">Founders never pay, at any stage, for any reason.</p>
            <p className="text-navy/70 text-base max-w-2xl">
              Request a quote and we will price against your cohort size and cycle.
            </p>
          </section>

          <RequestAssessmentForm redirectTo="/institutions" error={error} message={message} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
