import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    rateLimitHit: {
      findMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "./rate-limit";

const mockFindMany = vi.mocked(prisma.rateLimitHit.findMany);
const mockCreate = vi.mocked(prisma.rateLimitHit.create);
const mockDeleteMany = vi.mocked(prisma.rateLimitHit.deleteMany);

describe("checkRateLimit", () => {
  beforeEach(() => {
    mockFindMany.mockReset();
    mockCreate.mockReset().mockResolvedValue({} as never);
    mockDeleteMany.mockReset().mockResolvedValue({ count: 0 } as never);
    // Above the 1% opportunistic-cleanup threshold by default, so tests
    // that don't care about cleanup aren't affected by it.
    vi.spyOn(Math, "random").mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("allows a hit under the limit and records it", async () => {
    mockFindMany.mockResolvedValue([] as never);
    const result = await checkRateLimit("key1", 3, 60_000);
    expect(result).toEqual({ ok: true });
    expect(mockCreate).toHaveBeenCalledWith({ data: { key: "key1" } });
  });

  it("blocks once maxHits is reached within the window", async () => {
    const now = Date.now();
    mockFindMany.mockResolvedValue([
      { createdAt: new Date(now - 1000) },
      { createdAt: new Date(now - 500) },
      { createdAt: new Date(now - 100) },
    ] as never);

    const result = await checkRateLimit("key1", 3, 60_000);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.retryAfter.getTime()).toBe(now - 1000 + 60_000);
    }
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("queries only hits for the given key within the sliding window", async () => {
    mockFindMany.mockResolvedValue([] as never);
    await checkRateLimit("key1", 1, 60_000);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { key: "key1", createdAt: { gte: expect.any(Date) } },
      }),
    );
  });

  it("opportunistically sweeps stale hits on a low-probability roll", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.001);
    mockFindMany.mockResolvedValue([] as never);
    await checkRateLimit("key1", 3, 60_000);
    expect(mockDeleteMany).toHaveBeenCalled();
  });

  it("does not sweep on a normal-probability roll", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    mockFindMany.mockResolvedValue([] as never);
    await checkRateLimit("key1", 3, 60_000);
    expect(mockDeleteMany).not.toHaveBeenCalled();
  });
});
