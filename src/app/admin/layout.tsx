import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { requirePlatformAdmin } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";

// Platform-owner ops view — read-only visibility across every institution,
// distinct from the institution-scoped /dashboard (§ ops-tooling gap). Kept
// as a fully separate route tree from /dashboard so the ownership boundary
// on the real institution-admin routes is never touched by this guard.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requirePlatformAdmin();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 sm:px-12 py-5 flex items-center justify-between border-b border-navy/10">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Wordmark className="text-xl" />
          </Link>
          <span className="text-navy/50 text-sm hidden sm:inline">Platform admin · read-only</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/settings" className="text-navy/60 text-sm font-semibold hover:text-navy">
            Settings
          </Link>
          <form action={logout}>
            <button className="text-navy/60 text-sm font-semibold hover:text-navy" type="submit">
              Log out
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 px-6 sm:px-12 py-10">{children}</main>
    </div>
  );
}
