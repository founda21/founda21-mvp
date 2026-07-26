"use client";

import { useState } from "react";

// The founder list is the main thing on this page now — stage pass rates
// and the M&E summary are real numbers a funder needs, just not what they
// look at first, so they're tucked behind this toggle instead of always on
// screen.
export function CohortSummaryToggle({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="self-start rounded-full border border-navy text-navy px-5 py-2 text-sm font-semibold hover:bg-brand hover:text-white transition-colors flex items-center gap-2"
      >
        Summary
        <span className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      {open && <div className="flex flex-col gap-6">{children}</div>}
    </div>
  );
}
