"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui";
import { toggleShortlist } from "@/lib/actions/cohort";

export type FounderListItem = {
  founderId: string;
  membershipId: string;
  fullName: string;
  ventureName: string;
  ventureType: string;
  ventureStageLabel: string | null;
  currentStage: number;
  investable: boolean;
  passedCount: number;
  totalPoints: number;
  rank: number;
  shortlisted: boolean;
};

export function FounderSearchList({ founders, cohortId }: { founders: FounderListItem[]; cohortId: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | "shortlist">("all");
  const [isPending, startTransition] = useTransition();
  // Optimistic local copy so the button/tab counts flip instantly — synced
  // back to server state once revalidation lands via router.refresh().
  const [items, setItems] = useState(founders);
  useEffect(() => setItems(founders), [founders]);

  // Stretch the panel to fill the rest of the viewport below wherever it
  // sits on the page, instead of a fixed height that leaves dead white
  // space underneath on tall screens.
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState<number | null>(null);
  useEffect(() => {
    function updateHeight() {
      if (!containerRef.current) return;
      const top = containerRef.current.getBoundingClientRect().top;
      setMaxHeight(Math.max(320, window.innerHeight - top - 24));
    }
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const shortlistedCount = items.filter((f) => f.shortlisted).length;
  const scoped = tab === "shortlist" ? items.filter((f) => f.shortlisted) : items;

  const q = query.trim().toLowerCase();
  const filtered = q
    ? scoped.filter((f) => f.fullName.toLowerCase().includes(q) || f.ventureName.toLowerCase().includes(q))
    : scoped;

  function handleToggle(membershipId: string) {
    setItems((prev) => prev.map((f) => (f.membershipId === membershipId ? { ...f, shortlisted: !f.shortlisted } : f)));
    startTransition(async () => {
      await toggleShortlist(membershipId, cohortId);
      router.refresh();
    });
  }

  return (
    <div
      ref={containerRef}
      className="rounded-xl border border-navy/10 overflow-y-auto"
      style={maxHeight !== null ? { maxHeight } : undefined}
    >
      {/* Sticky within this panel's own scroll — as the rows below scroll
          past, the tabs + search bar stay pinned at the top instead of
          scrolling away with them (§ funder feedback: only the row list
          should scroll, not the whole page past the search bar). */}
      <div className="sticky top-0 z-10 bg-white flex flex-col gap-3 p-4 border-b border-navy/10">
        <div className="flex gap-1 rounded-full border border-navy/10 p-1 w-fit shrink-0">
          <button
            type="button"
            onClick={() => setTab("all")}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              tab === "all" ? "bg-navy text-white" : "text-navy/60 hover:text-navy"
            }`}
          >
            All ({founders.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("shortlist")}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              tab === "shortlist" ? "bg-navy text-white" : "text-navy/60 hover:text-navy"
            }`}
          >
            Shortlist ({shortlistedCount})
          </button>
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search founders or startups…"
          className="rounded-lg border border-navy/20 px-4 py-2.5 text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-2 focus:ring-emerald shrink-0"
        />
      </div>

      <div className="flex flex-col divide-y divide-navy/5">
        {filtered.map((f) => (
          <div
            key={f.founderId}
            className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-navy/[0.03] transition-colors"
          >
            <Link href={`/dashboard/founders/${f.founderId}`} className="flex items-center gap-4 flex-1 min-w-0">
              <span className="text-navy/40 text-sm font-bold w-8 shrink-0 text-center">#{f.rank}</span>
              <div className="min-w-0">
                <p className="text-navy font-semibold text-sm">{f.fullName}</p>
                <p className="text-navy/60 text-sm truncate">
                  {f.ventureName} · {f.ventureType}
                  {f.ventureStageLabel ? ` · ${f.ventureStageLabel}` : ""}
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-navy/50 text-xs hidden sm:inline">
                {f.totalPoints} pts · {f.passedCount}/21 passed
              </span>
              {f.investable ? (
                <Badge tone="success">Investable</Badge>
              ) : (
                <Badge tone="neutral">Stage {f.currentStage}</Badge>
              )}
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleToggle(f.membershipId)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                  f.shortlisted
                    ? "bg-emerald text-white hover:opacity-90"
                    : "border border-navy text-navy hover:bg-navy hover:text-white"
                }`}
              >
                {f.shortlisted ? "★ Shortlisted" : "☆ Shortlist"}
              </button>
              <Link href={`/dashboard/founders/${f.founderId}`} className="text-navy/30">
                →
              </Link>
            </div>
          </div>
        ))}

        {filtered.length === 0 && tab === "shortlist" && !q && (
          <p className="px-5 py-6 text-navy/50 text-sm text-center">
            No founders shortlisted yet — use the Shortlist button on the All tab.
          </p>
        )}
        {filtered.length === 0 && q && (
          <p className="px-5 py-6 text-navy/50 text-sm text-center">
            No founders or startups match &quot;{query}&quot;.
          </p>
        )}
      </div>
    </div>
  );
}
