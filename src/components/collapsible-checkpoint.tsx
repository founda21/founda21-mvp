"use client";

import { useId, useState } from "react";

// §3.3 (Brief 2): "Do not use tabs or `display: none` for the collapsed
// state during initial render — render all content in the DOM and collapse
// with CSS height/overflow, so nothing is invisible to crawlers." React
// always renders `children` regardless of `open` — only the wrapper's CSS
// grid-template-rows animates between 0fr (clipped) and 1fr (full height),
// so the full requirement/dimension text is present in the server-rendered
// HTML from the first byte, just visually collapsed, not display:none and
// not conditionally unmounted.
export function CollapsibleCheckpoint({
  id,
  name,
  passThreshold,
  children,
}: {
  id: number;
  name: string;
  passThreshold: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const contentId = useId();

  return (
    <div className="rounded-xl border border-navy/10 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={contentId}
        className="w-full text-left p-4 flex items-center gap-3"
      >
        <span className="text-emerald font-mono text-xs w-9 shrink-0">CP{id}</span>
        <span className="text-navy font-semibold text-sm flex-1">{name}</span>
        <span className="text-navy/40 text-xs whitespace-nowrap">Pass {passThreshold}/100</span>
        <span className={`text-navy/30 text-xs shrink-0 transition-transform ${open ? "rotate-90" : ""}`} aria-hidden>
          ▶
        </span>
      </button>
      <div
        id={contentId}
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-3 border-t border-navy/10 flex flex-col gap-2">{children}</div>
        </div>
      </div>
    </div>
  );
}
