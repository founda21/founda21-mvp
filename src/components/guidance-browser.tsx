"use client";

import { useMemo, useState } from "react";
import { CHECKPOINTS } from "@/lib/checkpoints";
import { GUIDANCE_FAQ } from "@/lib/guidance-faq";
import { Input } from "@/components/ui";

export function GuidanceBrowser() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const checkpoints = useMemo(() => {
    if (!q) return CHECKPOINTS;
    return CHECKPOINTS.filter(
      (c) =>
        `cp${c.id}`.includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.focus.toLowerCase().includes(q) ||
        c.requirement.toLowerCase().includes(q),
    );
  }, [q]);

  const faq = useMemo(() => {
    if (!q) return GUIDANCE_FAQ;
    return GUIDANCE_FAQ.filter(
      (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q),
    );
  }, [q]);

  return (
    <div className="flex flex-col gap-8">
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search, e.g. 'CP8', 'cooldown', 'traction'…"
      />

      <div>
        <h2 className="text-navy font-bold mb-3">Common questions</h2>
        <div className="flex flex-col gap-2">
          {faq.map((f) => (
            <details key={f.question} className="rounded-xl border border-navy/10 px-5 py-3">
              <summary className="cursor-pointer text-navy font-semibold text-sm">{f.question}</summary>
              <p className="text-navy/70 text-sm mt-2">{f.answer}</p>
            </details>
          ))}
          {faq.length === 0 && <p className="text-navy/60 text-sm">No matches.</p>}
        </div>
      </div>

      <div>
        <h2 className="text-navy font-bold mb-3">Every checkpoint, what it needs</h2>
        <div className="flex flex-col gap-2">
          {checkpoints.map((c) => (
            <details key={c.id} className="rounded-xl border border-navy/10 px-5 py-3">
              <summary className="cursor-pointer text-navy font-semibold text-sm">
                CP{c.id} · {c.name}
              </summary>
              <p className="text-navy/50 text-xs mt-2">{c.focus}</p>
              <p className="text-navy/70 text-sm mt-2">{c.requirement}</p>
            </details>
          ))}
          {checkpoints.length === 0 && <p className="text-navy/60 text-sm">No matches.</p>}
        </div>
      </div>
    </div>
  );
}
