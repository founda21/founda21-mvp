import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocked at the Prisma boundary, same pattern as scoring/index.test.ts —
// exercises the real active/expiresAt/maxUses gating logic with no DB.
vi.mock("@/lib/prisma", () => ({
  prisma: {
    cohort: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import type { Cohort } from "@/generated/prisma/client";
import { validatePasscode, recordPasscodeUse } from "./passcode";

const mockFindUnique = vi.mocked(prisma.cohort.findUnique);
const mockUpdate = vi.mocked(prisma.cohort.update);

function makeCohort(overrides: Partial<Cohort> = {}): Cohort {
  return {
    id: "cohort_1",
    institutionId: "inst_1",
    name: "Test Cohort",
    inviteCode: "ABC123",
    intendedEntryStage: 1,
    maxUses: null,
    usesCount: 0,
    active: true,
    expiresAt: null,
    createdAt: new Date(),
    announcedStage: null,
    announcedDeadline: null,
    announcedAt: null,
    ...overrides,
  };
}

describe("validatePasscode", () => {
  beforeEach(() => {
    mockFindUnique.mockReset();
    mockUpdate.mockReset();
  });

  it("rejects an unknown code", async () => {
    mockFindUnique.mockResolvedValue(null);
    expect(await validatePasscode("NOPE")).toEqual({ ok: false, reason: "Invalid passcode." });
  });

  it("rejects an inactive cohort", async () => {
    mockFindUnique.mockResolvedValue(makeCohort({ active: false }));
    const result = await validatePasscode("ABC123");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/no longer active/);
  });

  it("rejects an expired cohort", async () => {
    mockFindUnique.mockResolvedValue(makeCohort({ expiresAt: new Date(Date.now() - 1000) }));
    const result = await validatePasscode("ABC123");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/expired/);
  });

  it("accepts a cohort with a future expiry", async () => {
    mockFindUnique.mockResolvedValue(makeCohort({ expiresAt: new Date(Date.now() + 3600_000) }));
    expect((await validatePasscode("ABC123")).ok).toBe(true);
  });

  it("rejects a cohort that has hit its max uses", async () => {
    mockFindUnique.mockResolvedValue(makeCohort({ maxUses: 5, usesCount: 5 }));
    const result = await validatePasscode("ABC123");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/usage limit/);
  });

  it("accepts a cohort under its max uses", async () => {
    mockFindUnique.mockResolvedValue(makeCohort({ maxUses: 5, usesCount: 4 }));
    expect((await validatePasscode("ABC123")).ok).toBe(true);
  });

  it("treats maxUses: null as unlimited", async () => {
    mockFindUnique.mockResolvedValue(makeCohort({ maxUses: null, usesCount: 999_999 }));
    expect((await validatePasscode("ABC123")).ok).toBe(true);
  });
});

describe("recordPasscodeUse", () => {
  it("increments usesCount for the given cohort", async () => {
    mockUpdate.mockResolvedValue(makeCohort());
    await recordPasscodeUse("cohort_1");
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "cohort_1" },
      data: { usesCount: { increment: 1 } },
    });
  });
});
