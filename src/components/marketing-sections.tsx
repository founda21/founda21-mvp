import { FUNDER_TYPE_OPTIONS } from "@/lib/funder-type";
import { ScrollReveal } from "@/components/scroll-reveal";

export const MARKETING_SECTIONS = [
  { id: "how-it-works", label: "How it works" },
  { id: "who-we-work-with", label: "Who we work with" },
  { id: "for-funders", label: "For funders" },
  { id: "for-founders", label: "For founders" },
] as const;

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Issue a passcode",
    body: "Create a cohort in your dashboard and share one passcode. Founders join in minutes, no self-serve signup.",
  },
  {
    step: "2",
    title: "AI scores 21 checkpoints",
    body: "Across three stages, five dimensions each, against a fixed standard applied the same way to every founder.",
  },
  {
    step: "3",
    title: "You get the readout",
    body: "A live dashboard, per-founder readiness reports, eligibility/outcome data, and a portable Investable credential.",
  },
];

const FUNDER_ACCENTS = ["bg-emerald", "bg-navy", "bg-emerald/60", "bg-navy/60", "bg-emerald", "bg-navy"];

const FOR_FUNDERS = [
  "Rank an entire cohort by real readiness, not gut feel.",
  "Eligibility and B-BBEE/ESD outcome reporting, never seen by the AI.",
  "Export cohort-level M&E data in one click.",
  "One dashboard across every cohort and funder type you run.",
];

const FOR_FOUNDERS = [
  "Know exactly what's missing before a real investor ever does.",
  "Fix and resubmit, no punishment for a hard first attempt.",
  "One account, portable across every funder you join.",
  "No founder ever pays, ever.",
];

export function MarketingSections() {
  return (
    <>
      {/* How it works */}
      <section id="how-it-works" className="w-full max-w-5xl px-4 sm:px-12 py-14 sm:py-20 scroll-mt-24">
        <ScrollReveal className="flex flex-col gap-10 sm:gap-12">
          <div className="text-center flex flex-col gap-2">
            <span className="text-emerald text-xs font-semibold uppercase tracking-wide">Section 1</span>
            <h2 className="text-navy text-2xl sm:text-3xl font-bold">How it works</h2>
          </div>
          <div className="relative grid sm:grid-cols-3 gap-6 tilt-group">
            <div
              aria-hidden
              className="hidden sm:block absolute top-8 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-emerald/40 via-navy/20 to-emerald/40"
            />
            {HOW_IT_WORKS.map((s) => (
              <div
                key={s.step}
                className="tilt-card relative rounded-2xl border border-navy/10 bg-white p-6 flex flex-col gap-2 shadow-[0_8px_24px_rgba(10,31,68,0.06)]"
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-brand text-white text-lg font-bold shadow-[0_6px_16px_rgba(10,31,68,0.3)]">
                  {s.step}
                </span>
                <p className="text-navy font-semibold mt-1">{s.title}</p>
                <p className="text-navy/60 text-sm">{s.body}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Who we work with */}
      <section id="who-we-work-with" className="w-full bg-navy/[0.03] px-4 sm:px-12 py-14 sm:py-20 scroll-mt-24">
        <ScrollReveal className="max-w-5xl mx-auto flex flex-col gap-8 sm:gap-10">
          <div className="text-center flex flex-col gap-2">
            <span className="text-emerald text-xs font-semibold uppercase tracking-wide">Section 2</span>
            <h2 className="text-navy text-2xl sm:text-3xl font-bold">Who we work with</h2>
            <p className="text-navy/60 text-sm max-w-xl mx-auto">
              The categories of institutions that run their founders through the Founda21 standard.
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

      {/* For funders — its own full section, not sharing a scroll position with For founders */}
      <section id="for-funders" className="w-full px-4 sm:px-12 py-14 sm:py-20 scroll-mt-24">
        <ScrollReveal className="max-w-5xl mx-auto grid lg:grid-cols-[0.85fr_1.15fr] gap-8 sm:gap-12 items-center">
          <div className="flex flex-col gap-3 text-center lg:text-left">
            <span className="text-emerald text-xs font-semibold uppercase tracking-wide">Section 3</span>
            <h2 className="text-navy text-2xl sm:text-3xl font-bold">Built for funders</h2>
            <p className="text-navy/70 text-sm sm:text-base">
              Everything you need to run a cohort and see, at a glance, who&apos;s actually ready.
            </p>
          </div>
          <div className="tilt-group">
            <div className="tilt-card rounded-2xl border-2 border-emerald bg-emerald/[0.04] p-6 sm:p-8 flex flex-col gap-3 shadow-[0_16px_40px_rgba(1,136,78,0.1)]">
              <span className="text-emerald text-xs font-semibold uppercase tracking-wide">For funders</span>
              <ul className="text-navy/70 text-sm flex flex-col gap-2.5 mt-1">
                {FOR_FUNDERS.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald text-white text-xs font-bold shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* For founders — its own full section */}
      <section id="for-founders" className="w-full bg-navy/[0.03] px-4 sm:px-12 py-14 sm:py-20 scroll-mt-24">
        <ScrollReveal className="max-w-5xl mx-auto grid lg:grid-cols-[1.15fr_0.85fr] gap-8 sm:gap-12 items-center">
          <div className="tilt-group lg:order-1">
            <div className="tilt-card rounded-2xl border border-navy/15 bg-white p-6 sm:p-8 flex flex-col gap-3 shadow-[0_16px_40px_rgba(10,31,68,0.08)]">
              <span className="text-navy/60 text-xs font-semibold uppercase tracking-wide">For founders</span>
              <ul className="text-navy/70 text-sm flex flex-col gap-2.5 mt-1">
                {FOR_FOUNDERS.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand text-white text-xs font-bold shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-col gap-3 text-center lg:text-left lg:order-2">
            <span className="text-emerald text-xs font-semibold uppercase tracking-wide">Section 4</span>
            <h2 className="text-navy text-2xl sm:text-3xl font-bold">Built for founders</h2>
            <p className="text-navy/70 text-sm sm:text-base">
              A fair, honest shot at proving you&apos;re ready, and a credential that travels with you.
            </p>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
