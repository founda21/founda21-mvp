import Link from "next/link";
import { redirect } from "next/navigation";
import { Wordmark } from "@/components/wordmark";
import { requireFounder } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";
import { prisma } from "@/lib/prisma";

export default async function FounderLayout({ children }: { children: React.ReactNode }) {
  const { founder } = await requireFounder();

  // One-time eligibility/outcome/bio intake happens on /complete-profile, not
  // on signup (§ moved off the signup form — see completeFounderProfile).
  // That page lives outside this layout on purpose, so it isn't itself
  // redirected back here in a loop.
  const eligibility = await prisma.founderEligibility.findUnique({ where: { founderId: founder.id } });
  if (!eligibility || !founder.bio || !founder.startupSummary) redirect("/complete-profile");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 sm:px-12 py-5 flex items-center justify-between border-b border-navy/10">
        <div className="flex items-center gap-4">
          <Link href="/founder">
            <Wordmark className="text-xl" />
          </Link>
          <span className="text-navy/50 text-sm hidden sm:inline">{founder.ventureName}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/founder/settings" className="text-navy/60 text-sm font-semibold hover:text-navy">
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
