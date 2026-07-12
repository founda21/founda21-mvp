import { Wordmark } from "@/components/wordmark";
import { BackLink } from "@/components/back-link";

export default function TermsPage() {
  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <BackLink href="/" label="Home" />
          <Wordmark className="text-2xl" />
        </div>

        <div className="flex flex-col gap-6 text-navy/80 text-sm leading-relaxed">
          <div>
            <h1 className="text-navy text-2xl font-bold mb-1">Terms of Service</h1>
            <p className="text-navy/40 text-xs">Last updated 9 July 2026</p>
          </div>

          <section className="flex flex-col gap-2">
            <h2 className="text-navy font-semibold text-base">1. What Founda21 is</h2>
            <p>
              Founda21 is a founder-readiness assessment platform. Funders (accelerators, incubators,
              corporate ESD programmes, fund managers, DFIs, universities, and investors) invite
              founders to complete a 21-checkpoint assessment. Submissions are evaluated by an
              AI-assisted scoring engine against a fixed rubric, and results are shared with the
              inviting funder.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-navy font-semibold text-base">2. Accounts</h2>
            <p>
              Founder accounts are created via a passcode issued by a funder. Funder (institution)
              accounts are created via self-serve signup. You&apos;re responsible for keeping your
              login credentials secure and for all activity under your account.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-navy font-semibold text-base">3. Founder submissions and scoring</h2>
            <p>
              Checkpoint submissions are scored by an AI model against a defined rubric. Scores,
              summaries, and feedback are generated automatically and are provided as a readiness
              signal, not as investment, legal, financial, or professional advice. Founda21 does not
              guarantee funding, admission to any programme, or any particular outcome as a result of
              a score or credential.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-navy font-semibold text-base">4. Portable accounts and data sharing</h2>
            <p>
              A founder&apos;s checkpoint progress is portable across funders — the same account can
              join multiple funders&apos; cohorts via separate passcodes, and each funder can see that
              founder&apos;s scoring history and profile once the founder has joined their cohort.
              Founders should only share their passcode-linked account with funders they intend to
              work with.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-navy font-semibold text-base">5. Acceptable use</h2>
            <p>
              Don&apos;t submit false, plagiarized, or misleading information; attempt to manipulate
              or reverse-engineer the scoring engine; access another user&apos;s account or data
              without authorization; or use the platform for any unlawful purpose.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-navy font-semibold text-base">6. Termination</h2>
            <p>
              We may suspend or terminate accounts that violate these terms. Funders may withdraw a
              founder from a cohort at any time; this does not delete the founder&apos;s underlying
              account or their progress with other funders.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-navy font-semibold text-base">7. Changes to these terms</h2>
            <p>
              We may update these terms from time to time. Continued use of Founda21 after an update
              constitutes acceptance of the revised terms.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-navy font-semibold text-base">8. Contact</h2>
            <p>Questions about these terms can be sent to the Founda21 team via your funder contact.</p>
          </section>

          <p className="text-navy/40 text-xs border-t border-navy/10 pt-4">
            This is a starting template, not legal advice — have it reviewed by qualified counsel
            before relying on it for a live product handling personal and financial data.
          </p>
        </div>
      </div>
    </div>
  );
}
