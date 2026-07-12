import { describe, it, expect } from "vitest";
import { canAccessCheckpoint, checkpointLockReason } from "@/lib/stage-gating";

describe("canAccessCheckpoint", () => {
  it("locks checkpoints in a stage beyond the founder's current stage", () => {
    expect(canAccessCheckpoint({ currentStage: 1, ventureStage: null }, 8)).toBe(false);
    expect(checkpointLockReason({ currentStage: 1, ventureStage: null }, 8)).toBe("sequential");
  });

  it("allows checkpoints within the founder's current or earlier stage", () => {
    expect(canAccessCheckpoint({ currentStage: 2, ventureStage: null }, 1)).toBe(true);
    expect(canAccessCheckpoint({ currentStage: 2, ventureStage: null }, 8)).toBe(true);
  });

  it("does not retroactively gate founders with no declared venture stage", () => {
    expect(canAccessCheckpoint({ currentStage: 3, ventureStage: null }, 15)).toBe(true);
    expect(checkpointLockReason({ currentStage: 3, ventureStage: null }, 15)).toBeNull();
  });

  it("gates Stage 2 (needs Pre-seed+) for an Idea-stage founder even if sequentially unlocked", () => {
    expect(canAccessCheckpoint({ currentStage: 2, ventureStage: "IDEA" }, 8)).toBe(false);
    expect(checkpointLockReason({ currentStage: 2, ventureStage: "IDEA" }, 8)).toBe("venture-stage");
  });

  it("gates Stage 3 (needs Seed+) for a Pre-seed founder even if sequentially unlocked", () => {
    expect(canAccessCheckpoint({ currentStage: 3, ventureStage: "PRE_SEED" }, 15)).toBe(false);
    expect(checkpointLockReason({ currentStage: 3, ventureStage: "PRE_SEED" }, 15)).toBe("venture-stage");
  });

  it("allows a Seed-stage founder into Stage 3", () => {
    expect(canAccessCheckpoint({ currentStage: 3, ventureStage: "SEED" }, 15)).toBe(true);
  });

  it("allows a Series-A+ founder into every stage", () => {
    expect(canAccessCheckpoint({ currentStage: 3, ventureStage: "SERIES_A_PLUS" }, 15)).toBe(true);
    expect(canAccessCheckpoint({ currentStage: 3, ventureStage: "SERIES_A_PLUS" }, 8)).toBe(true);
  });

  it("returns false/null for an unknown checkpoint id", () => {
    expect(canAccessCheckpoint({ currentStage: 3, ventureStage: null }, 999)).toBe(false);
    expect(checkpointLockReason({ currentStage: 3, ventureStage: null }, 999)).toBeNull();
  });
});
