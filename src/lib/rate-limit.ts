import { prisma } from "@/lib/prisma";

// Generic sliding-window rate limiter (§ abuse prevention). Backed by
// RateLimitHit — a single append-only table, one row per hit, counted
// within `windowMs` of now. Deliberately simple (no Redis/external store):
// this app has no other shared-state infra, and a Postgres count query is
// more than fast enough at this scale.
export type RateLimitResult = { ok: true } | { ok: false; retryAfter: Date };

export async function checkRateLimit(key: string, maxHits: number, windowMs: number): Promise<RateLimitResult> {
  const windowStart = new Date(Date.now() - windowMs);

  const recentHits = await prisma.rateLimitHit.findMany({
    where: { key, createdAt: { gte: windowStart } },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });

  if (recentHits.length >= maxHits) {
    const retryAfter = new Date(recentHits[0].createdAt.getTime() + windowMs);
    return { ok: false, retryAfter };
  }

  await prisma.rateLimitHit.create({ data: { key } });

  // Opportunistic cleanup so the table doesn't grow unbounded — no cron
  // needed, just a low-probability sweep piggybacking on normal traffic.
  if (Math.random() < 0.01) {
    const staleCutoff = new Date(Date.now() - windowMs * 4);
    prisma.rateLimitHit.deleteMany({ where: { createdAt: { lt: staleCutoff } } }).catch(() => {});
  }

  return { ok: true };
}
