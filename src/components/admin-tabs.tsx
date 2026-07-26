import Link from "next/link";

const TABS = [
  { href: "/admin", label: "Funders" },
  { href: "/admin/founders", label: "Founders" },
] as const;

export function AdminTabs({ active }: { active: (typeof TABS)[number]["href"] }) {
  return (
    <nav className="flex gap-1 border-b border-navy/10 -mx-1">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
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
