import Link from "next/link";

const TABS = [
  { href: "/founder", label: "Overview" },
  { href: "/founder/profile", label: "Personal details" },
  { href: "/founder/how-it-works", label: "How Founda21 works" },
  { href: "/founder/guidance", label: "Ask for guidance" },
] as const;

export function FounderTabs({ active }: { active: (typeof TABS)[number]["href"] }) {
  return (
    <nav className="flex flex-wrap gap-x-1 gap-y-0.5 border-b border-navy/10">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
            active === tab.href
              ? "border-emerald text-navy"
              : "border-transparent text-navy/50 hover:text-navy"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
