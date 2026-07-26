"use client";

import { useState } from "react";
import { Field, Select, Input, Textarea, PrimaryButton } from "@/components/ui";
import { sendCohortDeadlineAnnouncement } from "@/lib/actions/cohort-announcement";

const STAGE_LABELS: Record<number, string> = {
  1: "Stage 1 · Idea & Reality",
  2: "Stage 2 · Company & Traction",
  3: "Stage 3 · Investor & Deal Readiness",
};

// The compulsory fairness mechanism (§ CohortCard never demands a stage) —
// this is where a funder actually tells a cohort "complete Stage X by Y",
// sent to everyone at once so nobody gets extra days for signing in early.
export function CohortDeadlineAnnouncement({
  cohortId,
  founderCount,
  announcedStage,
  announcedDeadline,
  announcedAt,
}: {
  cohortId: string;
  founderCount: number;
  announcedStage: number | null;
  announcedDeadline: string | null;
  announcedAt: string | null;
}) {
  const [open, setOpen] = useState(!announcedStage);
  const [sending, setSending] = useState(false);

  return (
    <div className="rounded-xl border border-brand/20 bg-brand/[0.03] px-5 py-4 flex flex-col gap-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-navy font-semibold text-sm">Stage deadline for this cohort</p>
        {!open && (
          <button type="button" onClick={() => setOpen(true)} className="text-emerald text-sm font-semibold hover:underline">
            Send a new announcement
          </button>
        )}
      </div>

      {announcedStage && announcedDeadline ? (
        <p className="text-navy/70 text-sm">
          Everyone in this cohort was told to complete <strong>{STAGE_LABELS[announcedStage]}</strong> by{" "}
          <strong>{new Date(announcedDeadline).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}</strong>
          {announcedAt && ` (announced ${new Date(announcedAt).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })})`}.
        </p>
      ) : (
        <p className="text-navy/60 text-sm">
          No deadline announced yet. The recruitment card only asks founders to sign in, it never demands a stage,
          so everyone gets equal time, tell this cohort what to complete and by when here, once, and everyone hears
          it at the same moment.
        </p>
      )}

      {open && (
        <form
          action={sendCohortDeadlineAnnouncement}
          onSubmit={() => setSending(true)}
          className="flex flex-col gap-3 border-t border-navy/10 pt-3"
        >
          <input type="hidden" name="cohortId" value={cohortId} />
          <div className="flex gap-3 flex-wrap">
            <Field label="Stage to complete">
              <Select name="requestedStage" defaultValue="1" required>
                {([1, 2, 3] as const).map((stage) => (
                  <option key={stage} value={stage}>
                    {STAGE_LABELS[stage]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Days to complete it">
              <Input name="daysToComplete" type="number" min={1} max={90} defaultValue={7} required className="w-28" />
            </Field>
          </div>
          <Field label="Personal note (optional)">
            <Textarea name="message" rows={2} placeholder="Add any extra context for this cohort." />
          </Field>
          <PrimaryButton type="submit" disabled={sending} className="self-start text-sm px-5 py-2">
            {sending ? "Sending…" : `Send to ${founderCount} founder${founderCount === 1 ? "" : "s"}`}
          </PrimaryButton>
        </form>
      )}
    </div>
  );
}
