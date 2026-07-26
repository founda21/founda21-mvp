"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui";

export type CheckpointStatusItem = {
  id: number;
  stage: 1 | 2 | 3;
  name: string;
  focus: string;
  score: number | null;
  passed: boolean;
  attempted: boolean;
};

const STAGE_NAMES: Record<1 | 2 | 3, string> = {
  1: "Idea & Reality",
  2: "Company & Traction",
  3: "Investor & Deal Readiness",
};

export function CheckpointStatusGrid({
  founderId,
  items,
  basePath = "/dashboard",
  linkPrefix,
}: {
  founderId: string;
  items: CheckpointStatusItem[];
  basePath?: string;
  // Overrides the default `${basePath}/founders/${founderId}/checkpoints`
  // link prefix — e.g. the founder's own dashboard links to
  // `/founder/checkpoint` (singular, no founderId segment) instead. Must be
  // a plain string, not a function: this is a client component and a
  // function prop can't cross the server->client boundary from a page.
  linkPrefix?: string;
}) {
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const filtered = items.filter((i) => i.stage === stage);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-navy font-semibold text-sm">Checkpoint status at a glance</p>
      <p className="text-navy/60 text-xs -mt-2">Click a checkpoint to see just that one.</p>

      <div className="flex gap-1 rounded-full border border-navy/10 p-1 w-fit">
        {([1, 2, 3] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStage(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              stage === s ? "bg-brand text-white" : "text-navy/60 hover:text-navy"
            }`}
          >
            Stage {s}
          </button>
        ))}
      </div>
      <p className="text-navy/60 text-xs -mt-1">{STAGE_NAMES[stage]}</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((item) => {
          const tone = !item.attempted
            ? "border-navy/10 bg-navy/[0.02]"
            : item.passed
              ? "border-emerald/30 bg-emerald/5"
              : "border-amber-300 bg-amber-50";
          const badgeTone = !item.attempted ? "neutral" : item.passed ? "success" : "warning";
          return (
            <Link
              key={item.id}
              href={`${linkPrefix ?? `${basePath}/founders/${founderId}/checkpoints`}/${item.id}`}
              className={`rounded-xl border p-3 flex flex-col gap-1.5 hover:shadow-sm transition-shadow ${tone}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-navy font-bold text-sm">CP{item.id}</span>
                <Badge tone={badgeTone}>{item.attempted ? `${item.score}/100` : "Not attempted"}</Badge>
              </div>
              <p className="text-navy text-xs font-semibold">{item.name}</p>
              <p className="text-navy/50 text-xs line-clamp-2">{item.focus}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
