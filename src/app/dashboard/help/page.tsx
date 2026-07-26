import Link from "next/link";
import { requireInstitutionAdmin } from "@/lib/auth";
import { BackLink } from "@/components/back-link";

const SECTIONS = [
  {
    title: "1. Create a cohort",
    body: "From “Cohorts”, click “New cohort” and give it a name. Every cohort gets its own passcode automatically — that passcode is how founders join it, there's no separate invite step.",
  },
  {
    title: "2. Share the passcode",
    body: "Open a cohort to see its passcode. Send it to your founders however you normally reach them (email, WhatsApp, a form). A founder enters it once at signup, or again later if they're joining you from another funder — their existing progress always carries over, it never restarts.",
  },
  {
    title: "3. Watch founders progress",
    body: "Each founder works through 21 checkpoints across 3 stages, scored consistently by AI against the Founda21 standard. You don't score anything yourself — your cohort view just shows you where each founder stands, ranked by real readiness.",
  },
  {
    title: "4. Review and shortlist",
    body: "Inside a cohort, use the “All” / “Shortlist” tabs to star the founders you want to track closely. Click into any founder to see their full checkpoint-by-checkpoint detail, or their “Summary” for a quick AI-generated read on strengths, weaknesses, and an overall recommendation.",
  },
  {
    title: "5. Export your cohort data",
    body: "“Export CSV” on a cohort page downloads every founder's ranking, checkpoint scores, and (where applicable) eligibility/outcome data — useful for your own M&E reporting or a B-BBEE/ESD verification file.",
  },
  {
    title: "6. Manage your account",
    body: "Your profile menu (top right) has Settings — theme, your organisation's contact details, and your password — plus Contracts for billing once that's live.",
  },
];

export default async function DashboardHelpPage() {
  await requireInstitutionAdmin();

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      <BackLink href="/dashboard" label="Back to dashboard" />

      <div>
        <h1 className="text-navy text-2xl font-bold">Help</h1>
        <p className="text-navy/60 text-sm mt-1">How to run a cohort on Founda21, start to finish.</p>
      </div>

      <div className="flex flex-col gap-5">
        {SECTIONS.map((s) => (
          <div key={s.title} className="rounded-xl border border-navy/10 p-5 flex flex-col gap-1.5">
            <p className="text-navy font-semibold text-sm">{s.title}</p>
            <p className="text-navy/70 text-sm">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-navy/10 bg-navy/[0.03] p-5 flex flex-col gap-1.5">
        <p className="text-navy font-semibold text-sm">Still stuck?</p>
        <p className="text-navy/70 text-sm">
          Read the{" "}
          <Link href="/methodology" target="_blank" rel="noreferrer" className="text-emerald font-semibold underline">
            provenance and methodology statement
          </Link>{" "}
          to understand exactly how the 21 checkpoints are scored, or reach out directly for anything
          this page doesn&apos;t cover.
        </p>
      </div>
    </div>
  );
}
