import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CollapsibleCheckpoint } from "@/components/collapsible-checkpoint";
import { CHECKPOINTS, STAGE_AVERAGE_THRESHOLDS, TRACTION_MINIMUMS, checkpointsForStage } from "@/lib/checkpoints";
import { DIMENSIONS } from "@/lib/dimensions";

export const metadata: Metadata = {
  title: "The Assessment — Founda21",
  description: "21 fixed checkpoints, five scored dimensions, and the integrity controls behind every Founda21 report.",
};

const STAGES = [
  { stage: 1 as const, name: "Idea & Reality", range: "CP1–CP7", question: "Is this worth a coffee?", passPerCheckpoint: 60 },
  { stage: 2 as const, name: "Company & Traction", range: "CP8–CP14", question: "Is this worth diligence?", passPerCheckpoint: 60 },
  { stage: 3 as const, name: "Investor & Deal Readiness", range: "CP15–CP21", question: "Is this worth a term sheet?", passPerCheckpoint: 70 },
];

const INTEGRITY_CONTROLS = [
  {
    name: "Retake cooldown",
    body: "A venture that fails a stage waits 14 days before it can retry. It's a full waiting period, not a same-day do-over.",
  },
  {
    name: "Restricted fail feedback",
    body: "A founder who fails is told which checkpoints need work, never the numeric score. The score is reserved for the report you receive.",
  },
  {
    name: "Artifact-first evidence",
    body: "Checkpoints that claim traction, compliance, or a working product require a real link, file, or document, not a written description of one.",
  },
  {
    name: "Cross-checkpoint consistency",
    body: "A venture's submissions are checked against each other for contradictions, a separate pass looking for claims that don't agree.",
  },
  {
    name: "Cohort similarity detection",
    body: "Submissions within the same cohort are checked against each other, so copied or shared answers don't pass unnoticed.",
  },
  {
    name: "Borderline second pass",
    body: "A score that lands close to the pass threshold is scored a second time, independently, before the outcome is finalised.",
  },
];

export default function AssessmentPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 px-6 sm:px-12 pb-16">
        <div className="max-w-3xl mx-auto flex flex-col gap-12">
          <div className="flex flex-col gap-3 pt-4">
            <p className="text-emerald text-xs font-semibold uppercase tracking-wide">The assessment</p>
            <h1 className="text-navy text-3xl sm:text-4xl font-bold tracking-tight">
              21 checkpoints. Five dimensions. One fixed rubric.
            </h1>
            <p className="text-navy/70 text-base sm:text-lg max-w-2xl">
              Every venture we assess goes through the same 21 checkpoints, organised into three
              stages, scored the same way every time. This page is the rubric itself — no part of it
              changes venture to venture.
            </p>
          </div>

          {/* How scoring works — leads with the model before the checkpoint list (§ Brief 2 §3) */}
          <section className="flex flex-col gap-5">
            <h2 className="text-navy text-xl font-bold">How scoring works</h2>
            <p className="text-navy/70 text-sm max-w-2xl">
              Every checkpoint is scored out of 100, split evenly across five dimensions, 20 points
              each, every time. An AI model applies this fixed rubric, the same rubric to every
              venture, and produces written reasoning for each dimension score. The AI did not decide
              what the checkpoints ask for, that came from research into what real funders publish, see{" "}
              <Link href="/provenance" className="text-emerald underline">
                provenance and methodology
              </Link>
              . Its role is narrow: apply the rubric consistently.
            </p>
            {/* Stacked cards below sm (a 3-column table can't fit 375px without
                clipping the description column), real table from sm up. Same
                data, same DOM, just two CSS-selected presentations. */}
            <div className="sm:hidden flex flex-col gap-3">
              {DIMENSIONS.map((d) => (
                <div key={d.name} className="rounded-xl border border-navy/10 p-4">
                  <p className="text-navy font-semibold text-sm">
                    {d.name} <span className="text-navy/40 font-normal">· {d.points} pts</span>
                  </p>
                  <p className="text-navy/60 text-xs mt-1">{d.description}</p>
                </div>
              ))}
            </div>
            <div className="hidden sm:block overflow-x-auto rounded-xl border border-navy/10">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-navy/[0.03] text-left">
                    <th className="px-4 py-3 text-navy font-semibold">Dimension</th>
                    <th className="px-4 py-3 text-navy font-semibold">Points</th>
                    <th className="px-4 py-3 text-navy font-semibold">What is being assessed</th>
                  </tr>
                </thead>
                <tbody>
                  {DIMENSIONS.map((d) => (
                    <tr key={d.name} className="border-t border-navy/10">
                      <td className="px-4 py-3 text-navy font-semibold whitespace-nowrap">{d.name}</td>
                      <td className="px-4 py-3 text-navy/60">{d.points}</td>
                      <td className="px-4 py-3 text-navy/60">{d.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Three stages */}
          <section className="flex flex-col gap-5">
            <div>
              <h2 className="text-navy text-xl font-bold">Three stages, cleared in order</h2>
              <p className="text-navy/60 text-sm mt-1 max-w-2xl">
                A venture can&apos;t attempt Stage 2 before clearing Stage 1, or Stage 3 before
                clearing Stage 2. Each checkpoint has its own pass mark; each stage also has its own
                average bar across all checkpoints in that stage.
              </p>
            </div>
            <div className="sm:hidden flex flex-col gap-3">
              {STAGES.map((s) => (
                <div key={s.stage} className="rounded-xl border border-navy/10 p-4 flex flex-col gap-1.5">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p className="text-navy font-semibold text-sm">
                      Stage {s.stage} · {s.name}
                    </p>
                    <span className="text-navy/40 text-xs font-mono">{s.range}</span>
                  </div>
                  <p className="text-navy/50 text-xs italic">&ldquo;{s.question}&rdquo;</p>
                  <p className="text-navy/60 text-xs">
                    Pass per checkpoint ≥ {s.passPerCheckpoint}/100 · Stage average ≥{" "}
                    {STAGE_AVERAGE_THRESHOLDS[s.stage]}/100
                  </p>
                </div>
              ))}
            </div>
            <div className="hidden sm:block overflow-x-auto rounded-xl border border-navy/10">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-navy/[0.03] text-left">
                    <th className="px-4 py-3 text-navy font-semibold">Stage</th>
                    <th className="px-4 py-3 text-navy font-semibold">The question it answers</th>
                    <th className="px-4 py-3 text-navy font-semibold">Checkpoints</th>
                    <th className="px-4 py-3 text-navy font-semibold whitespace-nowrap">Pass per checkpoint</th>
                    <th className="px-4 py-3 text-navy font-semibold whitespace-nowrap">Stage average</th>
                  </tr>
                </thead>
                <tbody>
                  {STAGES.map((s) => (
                    <tr key={s.stage} className="border-t border-navy/10">
                      <td className="px-4 py-3 text-navy font-semibold whitespace-nowrap">
                        Stage {s.stage} · {s.name}
                      </td>
                      <td className="px-4 py-3 text-navy/60 italic">&ldquo;{s.question}&rdquo;</td>
                      <td className="px-4 py-3 text-navy/60 font-mono text-xs">{s.range}</td>
                      <td className="px-4 py-3 text-navy/60">≥ {s.passPerCheckpoint}/100</td>
                      <td className="px-4 py-3 text-navy/60">≥ {STAGE_AVERAGE_THRESHOLDS[s.stage]}/100</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-navy/60 text-xs max-w-2xl">
              Stage 2 requires a venture stage of at least pre-seed to attempt, Stage 3 requires at
              least seed, a venture still at idea stage genuinely can&apos;t produce real traction data
              or a data room.
            </p>
            <div className="rounded-xl border border-navy/10 bg-navy/[0.03] p-4 text-sm text-navy/70">
              <p className="text-navy font-semibold text-xs uppercase tracking-wide mb-1">
                CP11 traction minimums, by venture type
              </p>
              <p>
                B2C: at least {TRACTION_MINIMUMS.B2C.signups} signups and {TRACTION_MINIMUMS.B2C.mau} monthly
                active users. B2B: {TRACTION_MINIMUMS.B2B.pilotsMin}–{TRACTION_MINIMUMS.B2B.pilotsMax} pilots
                or {TRACTION_MINIMUMS.B2B.payingClientsMin}–{TRACTION_MINIMUMS.B2B.payingClientsMax} paying
                clients. Hardware: confirmed case by case against the framework, no fixed minimum published
                here.
              </p>
            </div>
          </section>

          {/* All 21 checkpoints, grouped by stage, CSS-collapse (crawler-visible) */}
          <section className="flex flex-col gap-8">
            <h2 className="text-navy text-xl font-bold">All 21 checkpoints</h2>
            {STAGES.map((s) => (
              <div key={s.stage} className="flex flex-col gap-3">
                <h3 className="text-navy font-bold text-base">
                  Stage {s.stage} · {s.name} <span className="text-navy/40 font-normal text-xs font-mono ml-1">{s.range}</span>
                </h3>
                <div className="flex flex-col gap-2">
                  {checkpointsForStage(s.stage).map((c) => (
                    <CollapsibleCheckpoint key={c.id} id={c.id} name={c.name} passThreshold={c.passThreshold}>
                      <p className="text-navy/70 text-sm">{c.requirement}</p>
                      <p className="text-navy/50 text-xs">
                        <span className="text-navy font-semibold">Artifact: </span>
                        {c.artifactType}
                      </p>
                      <div className="grid sm:grid-cols-2 gap-2 mt-1">
                        {c.scoringBreakdown.map((d) => (
                          <div key={d.dimension} className="text-xs">
                            <span className="text-navy font-semibold">{d.dimension}</span>
                            <span className="text-navy/50"> — {d.expectation}</span>
                          </div>
                        ))}
                      </div>
                    </CollapsibleCheckpoint>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-navy/40 text-xs">{CHECKPOINTS.length} checkpoints total.</p>
          </section>

          {/* Integrity controls */}
          <section className="flex flex-col gap-3">
            <h2 className="text-navy text-xl font-bold">Integrity controls</h2>
            <p className="text-navy/70 text-sm max-w-2xl">
              A report is only useful if it&apos;s hard to game. Six structural controls run behind
              every assessment:
            </p>
            <ul className="flex flex-col gap-2 text-navy/70 text-sm">
              {INTEGRITY_CONTROLS.map((c) => (
                <li key={c.name} className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-emerald shrink-0 mt-2" />
                  <span>
                    <strong className="text-navy">{c.name}.</strong> {c.body}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <div className="rounded-2xl border border-navy/10 bg-navy/[0.03] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-navy/70 text-sm">Ready to send us your ventures?</p>
            <Link
              href="/institutions#request-assessment"
              className="rounded-full bg-emerald text-white px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Request an assessment
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
