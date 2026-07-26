// Platform-owner ops access, distinct from an Institution admin account —
// lets the Founda21 team see across every institution (§ ops-tooling gap).
// Deliberately an env-var allowlist rather than a DB role: this is for a
// small, fixed set of internal operators, not a customer-facing permission
// system.
const PLATFORM_ADMIN_EMAILS = new Set(
  (process.env.PLATFORM_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

export function isPlatformAdminEmail(email: string | null | undefined): boolean {
  return !!email && PLATFORM_ADMIN_EMAILS.has(email.toLowerCase());
}
