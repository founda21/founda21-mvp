// Human-readable elapsed-time formatting for platform-admin analytics
// (tenure since an institution/founder joined, time-to-pass-checkpoint). Not
// used anywhere in scoring or gating — display only.

const DAY_MS = 24 * 60 * 60 * 1000;

function daysBetween(from: Date, to: Date): number {
  return Math.max(0, Math.round((to.getTime() - from.getTime()) / DAY_MS));
}

// "3 days" / "2 months" / "1 year 4 months" — coarse, human-scale, not exact
// down to the hour, since these are tenure/timeline reads, not billing.
export function formatDuration(days: number): string {
  if (days < 1) return "Today";
  if (days === 1) return "1 day";
  if (days < 30) return `${days} days`;

  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? "1 month" : `${months} months`;

  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  const yearPart = years === 1 ? "1 year" : `${years} years`;
  if (remMonths === 0) return yearPart;
  return `${yearPart} ${remMonths === 1 ? "1 month" : `${remMonths} months`}`;
}

export function formatTenure(since: Date, now: Date = new Date()): string {
  return formatDuration(daysBetween(since, now));
}

export function formatElapsed(from: Date, to: Date): string {
  return formatDuration(daysBetween(from, to));
}

export function daysSince(from: Date, to: Date = new Date()): number {
  return daysBetween(from, to);
}
