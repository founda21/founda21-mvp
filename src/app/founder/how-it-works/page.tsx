import { requireFounder } from "@/lib/auth";
import { FounderTabs } from "@/components/founder-tabs";
import { ventureStageLabel } from "@/lib/venture-stage";

export default async function HowItWorksPage() {
  const { founder } = await requireFounder();

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-navy text-2xl font-bold">{founder.ventureName}</h1>
        <p className="text-navy/60 text-sm mt-1">
          {founder.fullName} · {founder.ventureType} · {ventureStageLabel(founder.ventureStage)}
        </p>
      </div>

      <FounderTabs active="/founder/how-it-works" />

      <section className="rounded-xl border border-emerald/30 bg-emerald/5 p-6 flex flex-col gap-2">
        <p className="text-navy font-bold">This isn't a test of how smart you are</p>
        <p className="text-navy/70 text-sm">
          Founda21 exists to help you get honestly ready for investment — not to catch you out or make you
          feel small. Some checkpoints are genuinely hard, and a strong founder can fail one on the first
          try — that's normal, and it's the system working, not you failing. When something isn't ready, we
          try to tell you clearly and specifically what's missing, so you know exactly what to fix.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-navy font-bold">The structure</h2>
        <p className="text-navy/70 text-sm">
          There are 21 checkpoints across 3 stages: <span className="font-semibold text-navy">Idea & Reality</span>{" "}
          (CP1–7), <span className="font-semibold text-navy">Company & Traction</span> (CP8–14), and{" "}
          <span className="font-semibold text-navy">Investor & Deal Readiness</span> (CP15–21). Stages unlock in
          order, and each also needs your venture to genuinely be at the right stage of life — Stage 2 needs
          real traction, Stage 3 needs a raise underway, because the checkpoints ask for evidence you simply
          can't have any earlier.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-navy font-bold">How a submission is actually assessed</h2>
        <p className="text-navy/70 text-sm">
          Each checkpoint is read by an AI trained to look for five things — the same five, every time, so
          the standard stays consistent:
        </p>
        <ul className="flex flex-col gap-2">
          <li className="text-navy/70 text-sm">
            <span className="font-semibold text-navy">Substance</span> — is the thing we actually asked for
            genuinely there?
          </li>
          <li className="text-navy/70 text-sm">
            <span className="font-semibold text-navy">Evidence</span> — is it backed by something real and
            specific, not just asserted?
          </li>
          <li className="text-navy/70 text-sm">
            <span className="font-semibold text-navy">SA Reality Fit</span> — does it engage honestly with the
            real South African context for this checkpoint, not a generic global answer?
          </li>
          <li className="text-navy/70 text-sm">
            <span className="font-semibold text-navy">Rigour & Coherence</span> — does it hold together and
            follow from your own venture's facts?
          </li>
          <li className="text-navy/70 text-sm">
            <span className="font-semibold text-navy">Investor Credibility</span> — would this survive a
            skeptical investor's direct follow-up question, and is it honest about its own weak spots?
          </li>
        </ul>
        <p className="text-navy/70 text-sm">
          Each checkpoint has a pass mark (60 for Stage 1 and 2, 70 for Stage 3 — the closer you get to
          investment, the higher the bar). When a result lands close to that line, we quietly run it past the
          AI a second time and average the two reads — so a single unlucky pass isn't what decides your
          outcome.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-navy font-bold">If a checkpoint doesn't pass</h2>
        <p className="text-navy/70 text-sm">
          You'll see specifically what was missing and what to fix, and you can resubmit. If a full stage
          doesn't clear on an attempt, there's a 14-day cooldown before you can retry that stage — not as a
          punishment, but because real fixes (new evidence, a rebuilt model, an actual customer conversation)
          take real time, and rushing back in with the same gaps rarely helps.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-navy font-bold">Being honest with you</h2>
        <p className="text-navy/70 text-sm">
          We'd rather tell you now, clearly, that something isn't ready — while you still have time to fix
          it — than let you walk into a real investor meeting and find out the hard way. That's the whole
          point of Founda21.
        </p>
      </section>
    </div>
  );
}
