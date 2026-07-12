import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { requireInstitutionAdmin } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";
import { funderTypeLabel } from "@/lib/funder-type";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { institution } = await requireInstitutionAdmin();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 sm:px-12 py-5 flex items-center justify-between border-b border-navy/10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Wordmark className="text-xl" />
          </Link>
          <span className="text-navy/50 text-sm hidden sm:inline">
            {institution.name}
            {` · ${funderTypeLabel(institution.funderType)}`}
          </span>
        </div>
        <form action={logout}>
          <button className="text-navy/60 text-sm font-semibold hover:text-navy" type="submit">
            Log out
          </button>
        </form>
      </header>
      <main className="flex-1 px-6 sm:px-12 py-10">{children}</main>
    </div>
  );
}
