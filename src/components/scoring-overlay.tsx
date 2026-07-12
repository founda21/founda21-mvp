"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

// Scoring is a single opaque server call with no real progress signal — this
// simulates progress toward a typical scoring duration (~15s observed) so
// founders get a sense of movement instead of an indefinite spinner, but
// never claims 100% until the page actually navigates away or the caller's
// own loading flag clears.
const ESTIMATED_DURATION_MS = 15000;
const MAX_SIMULATED_PROGRESS = 95;
const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function useSimulatedProgress(active: boolean): number {
  const [progress, setProgress] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      setProgress(0);
      startRef.current = null;
      return;
    }
    startRef.current = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - (startRef.current ?? Date.now());
      setProgress(Math.min(MAX_SIMULATED_PROGRESS, Math.round((elapsed / ESTIMATED_DURATION_MS) * 100)));
    }, 200);
    return () => clearInterval(interval);
  }, [active]);

  return progress;
}

export function ProgressOverlay({ active, label }: { active: boolean; label: string }) {
  const progress = useSimulatedProgress(active);
  if (!active) return null;

  const offset = CIRCUMFERENCE * (1 - progress / 100);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white/95 backdrop-blur-sm">
      <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="#0A1F4415" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke="#01884E"
          strokeWidth="8"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.2s linear" }}
        />
      </svg>
      <p className="text-navy text-3xl font-bold tabular-nums">{progress}%</p>
      <p className="text-navy/70 text-sm">{label}</p>
    </div>
  );
}

// Form-based checkpoints (everything except CP21's chat) drive the overlay
// from useFormStatus rather than passing an explicit `active` flag.
export function ScoringOverlay({ label = "Scoring your submission…" }: { label?: string }) {
  const { pending } = useFormStatus();
  return <ProgressOverlay active={pending} label={label} />;
}
