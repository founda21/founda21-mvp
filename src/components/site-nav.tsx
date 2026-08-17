"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/assessment", label: "The assessment" },
  { href: "/why-us", label: "Why us" },
  { href: "/institutions", label: "For institutions" },
] as const;

// The persistent institution-facing nav (§ Brief 2 §5) — lives in the header
// alongside the separate "Enter passcode" / "Log in" actions (kept distinct
// so the mobile priority fix for those two stays intact). Hidden below lg:
// header space is tight and mobile visitors skew founder anyway, who reach
// everything here via the footer instead.
export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:flex items-center gap-1 rounded-full border border-navy/15 bg-white/70 p-1 shrink-0">
      {NAV_LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors duration-300 ${
              active ? "bg-brand text-white shadow-[0_4px_14px_rgba(10,31,68,0.35)]" : "text-navy/60 hover:text-navy hover:bg-navy/5"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
