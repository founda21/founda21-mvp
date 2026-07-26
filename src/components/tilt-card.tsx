"use client";

import { useRef, type ReactNode } from "react";

// Mouse-driven 3D tilt, desktop-only by nature (no pointer to follow on
// touch) — the parent controls visibility (e.g. `hidden lg:flex`). Tracking
// itself is transition-free (instant, 1:1 with the cursor) and throttled to
// one update per animation frame; the transition only applies on mouse leave,
// so the card eases back to rest instead of snapping.
export function TiltCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const clientX = e.clientX;
    const clientY = e.clientY;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width - 0.5;
      const y = (clientY - rect.top) / rect.height - 0.5;
      el.style.transition = "none";
      el.style.transform = `rotateX(${(-y * 14 + 4).toFixed(2)}deg) rotateY(${(x * 18 - 6).toFixed(2)}deg)`;
    });
  }

  function handleMouseLeave() {
    const el = ref.current;
    if (!el) return;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    el.style.transition = "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)";
    el.style.transform = "rotateX(6deg) rotateY(-10deg)";
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`[transform-style:preserve-3d] ${className}`}
      style={{ transform: "rotateX(6deg) rotateY(-10deg)" }}
    >
      {children}
    </div>
  );
}
