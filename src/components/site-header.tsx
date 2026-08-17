import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { SiteNav } from "@/components/site-nav";

// Shared header across every public marketing page (§ Brief 2 §5) — Wordmark
// + SiteNav on the left, "Enter passcode" / "Log in" on the right. Those two
// stay bordered pill buttons at every width (not just mobile): most
// visitors, on any device, are either a founder with a passcode or a
// returning user, not someone browsing institution copy for the first time.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 px-4 sm:px-12 py-4 sm:py-5 flex items-center justify-between gap-4 bg-white/85 backdrop-blur-sm border-b border-navy/5">
      <div className="flex items-center gap-3 lg:gap-6 min-w-0">
        <Link href="/">
          <Wordmark className="text-xl sm:text-2xl shrink-0" />
        </Link>
        <SiteNav />
      </div>
      <nav className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/get-started"
          className="rounded-full border border-navy text-navy px-3.5 py-2 text-sm font-semibold hover:bg-navy hover:text-white transition-colors"
        >
          Enter passcode
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-navy text-navy px-3.5 py-2 text-sm font-semibold hover:bg-navy hover:text-white transition-colors"
        >
          Log in
        </Link>
      </nav>
    </header>
  );
}
