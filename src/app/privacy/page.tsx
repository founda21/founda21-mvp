import { Wordmark } from "@/components/wordmark";
import { BackLink } from "@/components/back-link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <BackLink href="/" label="Home" />
          <Wordmark className="text-2xl" />
        </div>

        <div className="flex flex-col gap-6 text-navy/80 text-sm leading-relaxed">
          <div>
            <h1 className="text-navy text-2xl font-bold mb-1">Data Policy</h1>
            <p className="text-navy/60 text-xs">Last updated 19 July 2026</p>
          </div>

          <section className="flex flex-col gap-2">
            <h2 className="text-navy font-semibold text-base">1. What we collect</h2>
            <p className="font-medium text-navy">From founders:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Account details: name, email, phone number, password (stored hashed by our authentication provider).</li>
              <li>
                Venture information and checkpoint submissions: text, documents, and links you submit
                for scoring.
              </li>
              <li>
                Eligibility and outcome data: B-BBEE ownership percentages, entity type, turnover
                band, and self-reported outcomes (capital raised, headcount, revenue), captured for
                funder reporting purposes only.
              </li>
            </ul>
            <p className="text-navy/70 text-xs mt-1">
              We deliberately don&apos;t ask for a government ID or passport number. Phone number is
              what we use to keep one account per person; we&apos;d rather collect less sensitive data
              even if it means a lighter check for now. If a stronger identity check becomes necessary
              later, this policy will be updated before it&apos;s introduced, not after.
            </p>
            <p className="font-medium text-navy mt-2">From funders (institutions):</p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Organisation name, funder type, contact name and email.</li>
              <li>Cohort and passcode configuration you create.</li>
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-navy font-semibold text-base">2. How we use it</h2>
            <p>
              Checkpoint submissions are sent to a third-party AI model for scoring.
              Eligibility and outcome data is never sent to the scoring model, it is used only to
              generate funder-facing reports and cohort-level M&amp;E summaries. We use account data
              to operate logins, cohort membership, and email notifications about your account
              activity.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-navy font-semibold text-base">3. Who can see your data</h2>
            <p>
              A founder&apos;s checkpoint results and profile are visible to every funder whose cohort
              that founder has joined. Founda21 accounts are portable, joining a second funder&apos;s
              cohort shares your existing progress with that funder too. We do not sell personal data
              to third parties.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-navy font-semibold text-base">4. Data storage and security</h2>
            <p>
              Data is stored with our infrastructure providers (Supabase for authentication and file
              storage, a managed PostgreSQL database for application data). We apply reasonable
              technical safeguards, but no system is 100% secure.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-navy font-semibold text-base">5. Your rights</h2>
            <p>
              You can request access to, correction of, or deletion of your personal data at any
              time, either through your funder or account admin, or by emailing{" "}
              <a className="underline" href="mailto:foundarsa@gmail.com">
                foundarsa@gmail.com
              </a>
              . Deleting a founder account removes that founder&apos;s data from Founda21, subject
              to any records a funder is legally required to retain for reporting purposes.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-navy font-semibold text-base">6. Cookies</h2>
            <p>
              We use strictly necessary cookies to keep you logged in. We don&apos;t use third-party
              advertising or tracking cookies.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-navy font-semibold text-base">7. Contact</h2>
            <p>
              Questions about this policy can be sent to{" "}
              <a className="underline" href="mailto:foundarsa@gmail.com">
                foundarsa@gmail.com
              </a>
              .
            </p>
          </section>

          <p className="text-navy/60 text-xs border-t border-navy/10 pt-4">
            This is a plain-language description of what we actually do, written to be honest and
            easy to read rather than formal legal drafting. It isn&apos;t a substitute for a lawyer&apos;s
            review (including for POPIA/GDPR compliance), which is worth getting as Founda21 scales,
            but it accurately reflects our current practice.
          </p>
        </div>
      </div>
    </div>
  );
}
