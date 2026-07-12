"use client";

import { useFormStatus } from "react-dom";

export function ScoringSubmitButton({
  idleLabel,
  pendingLabel = "Scoring your submission…",
}: {
  idleLabel: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-full bg-emerald text-white px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed self-start"
    >
      {pending && (
        <span
          aria-hidden
          className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin"
        />
      )}
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
