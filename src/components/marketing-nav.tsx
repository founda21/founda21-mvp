"use client";

import { useEffect, useState } from "react";
import { MARKETING_SECTIONS } from "@/components/marketing-sections";

// Pill-style section nav for the (always-visible, sticky) header. Tracks
// which section is currently centered in the viewport via IntersectionObserver
// so the active pill follows you as the page glides, the same way it would
// if this were a real tab switcher.
export function MarketingNav() {
  const [active, setActive] = useState<string>(MARKETING_SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 },
    );

    const elements = MARKETING_SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Native `href="#id"` fragment navigation is flaky on a cold/hydrating
  // Next.js dev page — the hash updates but the browser sometimes skips the
  // actual scroll. Driving the scroll ourselves via scrollIntoView (which
  // still respects each section's scroll-mt-24 offset) sidesteps that race
  // entirely and is reliable on every click.
  function goTo(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  }

  return (
    <nav className="hidden lg:flex items-center gap-1 rounded-full border border-navy/15 bg-white/70 p-1 shrink-0">
      {MARKETING_SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          onClick={(e) => goTo(e, s.id)}
          className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors duration-300 ${
            active === s.id ? "bg-brand text-white shadow-[0_4px_14px_rgba(10,31,68,0.35)]" : "text-navy/60 hover:text-navy hover:bg-navy/5"
          }`}
        >
          {s.label}
        </a>
      ))}
    </nav>
  );
}
