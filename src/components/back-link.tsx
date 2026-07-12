import Link from "next/link";

export function BackLink({
  href,
  label,
  className = "",
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`text-navy/50 text-xs hover:underline hover:text-navy transition-colors ${className}`}
    >
      ← {label}
    </Link>
  );
}

// For centered auth/onboarding-style pages (flex items-center justify-center,
// no relative ancestor) — pins the back link to the viewport corner instead
// of getting centered along with the rest of the page content. Some of these
// pages (e.g. the founder passcode form) scroll well past one screen on
// mobile, so this needs its own opaque background — otherwise scrolled
// content passes directly underneath and visually merges with the link text.
export function FixedBackLink(props: { href: string; label: string }) {
  return (
    <BackLink {...props} className="fixed top-6 left-6 z-20 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full" />
  );
}
