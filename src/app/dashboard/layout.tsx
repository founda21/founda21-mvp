import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { requireInstitutionAdmin } from "@/lib/auth";
import { funderTypeLabel } from "@/lib/funder-type";
import { getTheme } from "@/lib/actions/theme";
import { ProfileMenu } from "@/components/profile-menu";
import { logout } from "@/lib/actions/auth";

// Chrome shared by both the holding screens below and the real dashboard —
// avoids duplicating the header/theme-wrapper JSX three times.
function Shell({
  theme,
  right,
  children,
  logoLinked = false,
}: {
  theme: string;
  right: React.ReactNode;
  children: React.ReactNode;
  logoLinked?: boolean;
}) {
  const logo = <Wordmark className="text-xl" />;
  return (
    <div className={`${theme === "dark" ? "dark" : ""} min-h-screen flex flex-col bg-surface text-navy transition-colors`}>
      <header className="px-6 sm:px-12 py-5 flex items-center justify-between border-b border-navy/10">
        {logoLinked ? <Link href="/dashboard">{logo}</Link> : logo}
        {right}
      </header>
      <main className="flex-1 px-6 sm:px-12 py-10">{children}</main>
    </div>
  );
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { institution } = await requireInstitutionAdmin();
  const theme = await getTheme();

  // Manual review gate (§ InstitutionStatus) — anyone could otherwise
  // self-serve into an account that sees founders' checkpoint data,
  // eligibility %, and outcome data. New signups start pending; only an
  // approved institution gets the real dashboard below.
  if (institution.status === "pending") {
    return (
      <Shell
        theme={theme}
        right={
          <form action={logout}>
            <button className="text-navy/60 text-sm font-semibold hover:text-navy" type="submit">
              Log out
            </button>
          </form>
        }
      >
        <div className="max-w-md mx-auto text-center flex flex-col items-center gap-3 mt-12">
          <svg
            className="text-emerald"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <h1 className="text-navy text-xl font-bold">Your account is under review</h1>
          <p className="text-navy/60 text-sm">
            Thanks for signing up, {institution.name}. Founda21 reviews every new funder account
            before granting dashboard access. We&apos;ll respond by email within 48 hours to confirm
            you&apos;re approved, once that email lands, you can log back in and continue straight
            away, no extra step needed.
          </p>
        </div>
      </Shell>
    );
  }

  if (institution.status === "rejected") {
    return (
      <Shell
        theme={theme}
        right={
          <form action={logout}>
            <button className="text-navy/60 text-sm font-semibold hover:text-navy" type="submit">
              Log out
            </button>
          </form>
        }
      >
        <div className="max-w-md mx-auto text-center flex flex-col gap-3 mt-12">
          <h1 className="text-navy text-xl font-bold">This account wasn&apos;t approved</h1>
          <p className="text-navy/60 text-sm">
            Founda21 wasn&apos;t able to verify {institution.name} as a funder account. If you
            believe this is a mistake, reach out to the Founda21 team directly.
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell
      theme={theme}
      logoLinked
      right={
        <div className="flex items-center gap-4">
          <Link href="/dashboard/cohorts" className="text-navy/70 text-sm font-semibold hover:text-navy transition-colors">
            Cohorts
          </Link>
          <span className="text-navy/50 text-sm hidden sm:inline">
            {funderTypeLabel(institution.funderType)}
          </span>
          <ProfileMenu institutionName={institution.name} />
        </div>
      }
    >
      {children}
    </Shell>
  );
}
