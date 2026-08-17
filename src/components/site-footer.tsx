import Link from "next/link";
import { Wordmark } from "@/components/wordmark";

const FOOTER_LINKS = [
  { href: "/founders", label: "For founders" },
  { href: "/provenance", label: "Provenance" },
  { href: "mailto:foundarsa@gmail.com", label: "Contact" },
  { href: "/privacy", label: "Data policy" },
] as const;

// Shared across every public marketing/documentation page (§ Brief 2 §5).
export function SiteFooter() {
  return (
    <footer className="px-4 sm:px-12 py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-navy/50 text-xs">
      <Wordmark className="text-base" />
      <div className="flex items-center gap-4 flex-wrap justify-center">
        {FOOTER_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-navy">
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
