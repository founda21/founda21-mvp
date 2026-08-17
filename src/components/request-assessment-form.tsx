import { Field, Input, Select, PrimaryButton, ErrorBanner, InfoBanner } from "@/components/ui";
import { requestAssessment } from "@/lib/actions/lead";

const VENTURE_COUNT_OPTIONS = ["1–5", "6–15", "16–30", "30+"];
const TIMING_OPTIONS = ["This month", "This quarter", "Next quarter", "Just exploring"];

// Shared between / and /institutions (§ positioning brief §4.5) — the one
// conversion action on the site. No password, no account creation: this
// only sends a notification email (§ actions/lead.ts), the real account
// gets created later through the existing manual-review signup flow.
export function RequestAssessmentForm({
  redirectTo,
  error,
  message,
}: {
  redirectTo: string;
  error?: string;
  message?: string;
}) {
  return (
    <div id="request-assessment" className="w-full max-w-lg mx-auto rounded-2xl border border-navy/10 bg-white p-6 sm:p-8 flex flex-col gap-5 shadow-[0_16px_40px_rgba(10,31,68,0.08)] scroll-mt-24">
      <div>
        <p className="text-emerald text-xs font-semibold uppercase tracking-wide">Request an assessment</p>
        <p className="text-navy/60 text-sm mt-1">
          Tell us about your ventures. We&apos;ll follow up within two business days.
        </p>
      </div>

      <ErrorBanner message={error} />
      <InfoBanner message={message} />

      <form action={requestAssessment} className="flex flex-col gap-4" autoComplete="off">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <Field label="Institution name">
          <Input name="institutionName" type="text" required placeholder="e.g. Edge Growth" autoComplete="off" />
        </Field>
        <Field label="Your name">
          <Input name="contactName" type="text" required placeholder="Jane Ndlovu" autoComplete="off" />
        </Field>
        <Field label="Your role (optional)">
          <Input name="role" type="text" placeholder="e.g. Programme Manager" autoComplete="off" />
        </Field>
        <Field label="Email">
          <Input name="email" type="email" required placeholder="you@institution.org" autoComplete="off" />
        </Field>
        <Field label="Approximate number of ventures">
          <Select name="ventureCount" defaultValue="">
            <option value="" disabled>
              Select a range
            </option>
            {VENTURE_COUNT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="When do you need this">
          <Select name="intakeTiming" defaultValue="">
            <option value="" disabled>
              Select timing
            </option>
            {TIMING_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>
        <PrimaryButton type="submit" className="mt-2">
          Request an assessment
        </PrimaryButton>
      </form>
    </div>
  );
}
