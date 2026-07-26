"use client";

import { useState } from "react";
import { Field, Select, Textarea, PrimaryButton } from "@/components/ui";
import { sendFounderNudge } from "@/lib/actions/founder-nudge";

const STAGE_LABELS: Record<number, string> = {
  1: "Stage 1 · Idea & Reality",
  2: "Stage 2 · Company & Traction",
  3: "Stage 3 · Investor & Deal Readiness",
};

// Lets a funder ask a founder (by real email, § founder-nudge.ts) to
// continue to a specific stage, or send a general note — the founder-side
// counterpart to the read-only checkpoint view above it.
export function FounderNudgeForm({
  founderId,
  founderName,
  currentStage,
  investable,
  redirectTo,
}: {
  founderId: string;
  founderName: string;
  currentStage: number;
  investable: boolean;
  redirectTo: string;
}) {
  const [sending, setSending] = useState(false);

  return (
    <form
      action={sendFounderNudge}
      onSubmit={() => setSending(true)}
      className="rounded-xl border border-navy/10 p-5 flex flex-col gap-3"
    >
      <p className="text-navy font-semibold text-sm">Ask {founderName} to continue</p>
      <input type="hidden" name="founderId" value={founderId} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <Field label="Ask for">
        <Select name="requestedStage" defaultValue={investable ? "" : String(currentStage)}>
          <option value="">General message (no specific stage)</option>
          {([1, 2, 3] as const).map((stage) => (
            <option key={stage} value={stage}>
              {STAGE_LABELS[stage]}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Personal note (optional)">
        <Textarea
          name="message"
          rows={3}
          placeholder="Add a personal note, e.g. why you'd like them to continue."
        />
      </Field>
      <PrimaryButton type="submit" disabled={sending} className="self-start text-sm px-5 py-2">
        {sending ? "Sending…" : "Send message"}
      </PrimaryButton>
    </form>
  );
}
