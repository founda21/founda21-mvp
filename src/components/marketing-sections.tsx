import Link from "next/link";
import { FUNDER_TYPE_OPTIONS } from "@/lib/funder-type";
import { ScrollReveal } from "@/components/scroll-reveal";
import { DIMENSIONS } from "@/lib/dimensions";

const DELIVERABLES = [
  {
    name: "Venture Readiness Report",
    tagline: "One per venture",
    body: "Score out of 100 per checkpoint across five dimensions, written reasoning for every dimension, the evidence submitted, and a dated record of every attempt. Delivered to you and to the founder, free to the founder, permanently.",
  },
  {
    name: "Cohort Report",
    tagline: "One per group",
    body: "Every venture ranked by measured readiness, pass rates by stage and checkpoint, failure patterns across the group, and the eligibility/outcome fields you need for reporting, recorded, never scored. Exports to Excel.",
  },
  {
    name: "Progress Report",
    tagline: "When a cohort is assessed twice",
    body: "The same ventures measured before and after a programme, showing movement per venture and per dimension, so you can show what your programme actually changed.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Scope the engagement",
    body: "Tell us how many ventures you're bringing and when. We confirm scope and pricing before anything starts.",
  },
  {
    step: "2",
    title: "We issue a passcode",
    body: "One passcode covers your whole cohort. You distribute it, we don't market to your ventures directly.",
  },
  {
    step: "3",
    title: "Ventures are assessed",
    body: "Each venture works through 21 fixed checkpoints, every checkpoint scored against the same five dimensions.",
  },
  {
    step: "4",
    title: "We deliver the reports",
    body: "A Venture Readiness Report per venture and a Cohort Report for the group, both written, both yours to keep.",
  },
  {
    step: "5",
    title: "Re-assess to track progress",
    body: "Run the same cohort through again later and we'll show you what actually moved, checkpoint by checkpoint.",
  },
];

const FUNDER_ACCENTS = ["bg-emerald", "bg-navy", "bg-emerald/60", "bg-navy/60", "bg-emerald", "bg-navy"];

const DISCLAIMERS = [
  "We are not a decision-maker. We do not select, admit, fund or reject anyone.",
  "We do not replace anyone's criteria. Your own rubric and priorities stay exactly as they are.",
  "We are not an application or programme management system.",
  "We are not an investor, incubator or accelerator. We take no equity and provide no capital.",
];

export function MarketingSections() {
  return (
    <>
      {/* What you get */}
      <section id="deliverables" className="w-full max-w-5xl px-4 sm:px-12 py-14 sm:py-20 scroll-mt-24">
        <ScrollReveal className="flex flex-col gap-10 sm:gap-12">
          <div className="text-center flex flex-col gap-2">
            <span className="text-emerald text-xs font-semibold uppercase tracking-wide">Section 1</span>
            <h2 className="text-navy text-2xl sm:text-3xl font-bold">What you receive</h2>
            <p className="text-navy/60 text-sm max-w-xl mx-auto">
              Three written deliverables, given equal weight, none of them a decision on your behalf.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 tilt-group">
            {DELIVERABLES.map((d) => (
              <div
                key={d.name}
                className="tilt-card rounded-2xl border border-navy/10 bg-white p-6 flex flex-col gap-2 shadow-[0_8px_24px_rgba(10,31,68,0.06)]"
              >
                <p className="text-emerald text-xs font-semibold uppercase tracking-wide">{d.tagline}</p>
                <p className="text-navy font-bold text-lg">{d.name}</p>
                <p className="text-navy/60 text-sm mt-1">{d.body}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="w-full bg-navy/[0.03] px-4 sm:px-12 py-14 sm:py-20 scroll-mt-24">
        <ScrollReveal className="max-w-5xl mx-auto flex flex-col gap-10 sm:gap-12">
          <div className="text-center flex flex-col gap-2">
            <span className="text-emerald text-xs font-semibold uppercase tracking-wide">Section 2</span>
            <h2 className="text-navy text-2xl sm:text-3xl font-bold">How an engagement runs</h2>
          </div>
          <div className="grid sm:grid-cols-5 gap-5 tilt-group">
            {HOW_IT_WORKS.map((s) => (
              <div
                key={s.step}
                className="tilt-card relative rounded-2xl border border-navy/10 bg-white p-5 flex flex-col gap-2 shadow-[0_8px_24px_rgba(10,31,68,0.06)]"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-brand text-white text-sm font-bold shadow-[0_6px_16px_rgba(10,31,68,0.3)]">
                  {s.step}
                </span>
                <p className="text-navy font-semibold text-sm mt-1">{s.title}</p>
                <p className="text-navy/60 text-xs">{s.body}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Who we work with */}
      <section id="who-we-work-with" className="w-full px-4 sm:px-12 py-14 sm:py-20 scroll-mt-24">
        <ScrollReveal className="max-w-5xl mx-auto flex flex-col gap-8 sm:gap-10">
          <div className="text-center flex flex-col gap-2">
            <span className="text-emerald text-xs font-semibold uppercase tracking-wide">Section 3</span>
            <h2 className="text-navy text-2xl sm:text-3xl font-bold">Who we work with</h2>
            <p className="text-navy/60 text-sm max-w-xl mx-auto">
              Six categories of institution send us ventures to assess.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5 tilt-group">
            {FUNDER_TYPE_OPTIONS.map((f, i) => (
              <div
                key={f.value}
                className="tilt-card overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-[0_8px_24px_rgba(10,31,68,0.06)]"
              >
                <div className={`h-1.5 ${FUNDER_ACCENTS[i % FUNDER_ACCENTS.length]}`} />
                <div className="p-5 flex flex-col gap-1.5">
                  <p className="text-navy font-semibold text-sm">{f.label}</p>
                  <p className="text-navy/60 text-xs">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* How we score — summary only, full rubric lives at /assessment */}
      <section id="how-we-score" className="w-full bg-navy/[0.03] px-4 sm:px-12 py-14 sm:py-20 scroll-mt-24">
        <ScrollReveal className="max-w-3xl mx-auto flex flex-col gap-8 sm:gap-10">
          <div className="text-center flex flex-col gap-2">
            <span className="text-emerald text-xs font-semibold uppercase tracking-wide">Section 4</span>
            <h2 className="text-navy text-2xl sm:text-3xl font-bold">How we score</h2>
            <p className="text-navy/60 text-sm max-w-xl mx-auto">
              Every checkpoint is scored out of 100, split evenly across five fixed dimensions, no
              weighting change by stage, venture type or checkpoint.
            </p>
          </div>
          <div className="table-wrap overflow-x-auto rounded-2xl border border-navy/10 bg-white shadow-[0_8px_24px_rgba(10,31,68,0.06)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy/10">
                  <th className="px-5 py-3 text-left text-navy/50 text-xs uppercase tracking-wide font-semibold">Dimension</th>
                  <th className="px-5 py-3 text-right text-navy/50 text-xs uppercase tracking-wide font-semibold">Points</th>
                </tr>
              </thead>
              <tbody>
                {DIMENSIONS.map((d, i) => (
                  <tr key={d.name} className={i !== DIMENSIONS.length - 1 ? "border-b border-navy/10" : ""}>
                    <td className="px-5 py-3 text-navy font-medium">{d.name}</td>
                    <td className="px-5 py-3 text-right text-navy/70 font-mono">{d.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link href="/assessment" className="text-emerald font-semibold text-sm underline self-center">
            See the full rubric, all 21 checkpoints
          </Link>
        </ScrollReveal>
      </section>

      {/* Why an independent assessor */}
      <section id="why-independent" className="w-full px-4 sm:px-12 py-14 sm:py-20 scroll-mt-24">
        <ScrollReveal className="max-w-2xl mx-auto flex flex-col gap-5 text-center">
          <span className="text-emerald text-xs font-semibold uppercase tracking-wide">Section 5</span>
          <h2 className="text-navy text-2xl sm:text-3xl font-bold">Why an independent assessor</h2>
          <p className="text-navy/70 text-base sm:text-lg">
            An institution doesn&apos;t need to believe our 21 checkpoints are the only correct 21. It
            needs three things to be true: the same checkpoints were applied to every venture, every
            score carries written reasoning you can check, and nobody involved had a stake in the
            outcome. None of that requires trusting our judgement, it requires reading our output.
          </p>
          <Link href="/why-us" className="text-emerald font-semibold text-sm underline self-center">
            Read why we built it this way
          </Link>
        </ScrollReveal>
      </section>

      {/* Pricing — model only, no figures on the public site */}
      <section id="pricing" className="w-full bg-navy/[0.03] px-4 sm:px-12 py-14 sm:py-20 scroll-mt-24">
        <ScrollReveal className="max-w-xl mx-auto flex flex-col gap-3 text-center">
          <span className="text-emerald text-xs font-semibold uppercase tracking-wide">Section 6</span>
          <h2 className="text-navy text-2xl sm:text-3xl font-bold">Pricing</h2>
          <p className="text-navy/70 text-base">
            Priced per cohort, by size, not per venture. Founders never pay, at any stage, for any
            reason.
          </p>
          <Link href="/institutions" className="text-emerald font-semibold text-sm underline self-center">
            See how pricing works
          </Link>
        </ScrollReveal>
      </section>

      {/* Disclaimers */}
      <section className="w-full px-4 sm:px-12 py-12 sm:py-16">
        <ScrollReveal className="max-w-3xl mx-auto flex flex-col gap-4">
          <p className="text-navy/50 text-xs font-semibold uppercase tracking-wide text-center">What we are not</p>
          <ul className="flex flex-col gap-2">
            {DISCLAIMERS.map((d) => (
              <li key={d} className="flex items-start gap-2.5 text-navy/60 text-sm">
                <span className="w-1 h-1 rounded-full bg-navy/40 shrink-0 mt-2" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </ScrollReveal>
      </section>
    </>
  );
}
