import { describe, it, expect } from "vitest";
import { CHECKPOINTS, STAGE_AVERAGE_THRESHOLDS } from "@/lib/checkpoints";
import { DIMENSION_NAMES } from "@/lib/scoring/schema";

// Structural invariants for the 21-checkpoint framework — catches exactly
// the kind of regression this suite would have caught before it shipped:
// an "ungrounded" saThread, a dimension typo, or a checkpoint's points not
// summing to 100 (§ rubric fix — checkpoints.ts saThread grounding).
describe("CHECKPOINTS", () => {
  it("has exactly 21 checkpoints with unique, sequential ids 1-21", () => {
    expect(CHECKPOINTS).toHaveLength(21);
    const ids = CHECKPOINTS.map((c) => c.id).sort((a, b) => a - b);
    expect(ids).toEqual(Array.from({ length: 21 }, (_, i) => i + 1));
  });

  it("every checkpoint's scoringBreakdown covers exactly the 5 required dimensions once each, summing to 100", () => {
    for (const checkpoint of CHECKPOINTS) {
      const names = checkpoint.scoringBreakdown.map((d) => d.dimension);
      expect(new Set(names).size, `CP${checkpoint.id} has duplicate dimensions`).toBe(5);
      for (const name of DIMENSION_NAMES) {
        expect(names, `CP${checkpoint.id} is missing dimension "${name}"`).toContain(name);
      }
      const total = checkpoint.scoringBreakdown.reduce((sum, d) => sum + d.points, 0);
      expect(total, `CP${checkpoint.id} points don't sum to 100`).toBe(100);
    }
  });

  it("has no ungrounded SA Reality Fit thread — every saThread is a real, checkpoint-specific anchor", () => {
    for (const checkpoint of CHECKPOINTS) {
      expect(checkpoint.saThread.toLowerCase(), `CP${checkpoint.id} saThread`).not.toMatch(/none specified/);
      expect(checkpoint.saThread.length, `CP${checkpoint.id} saThread too short to be a real anchor`).toBeGreaterThan(20);
    }
  });

  it("passThreshold matches the stage (60 for stages 1-2, 70 for stage 3)", () => {
    for (const checkpoint of CHECKPOINTS) {
      const expected = checkpoint.stage === 3 ? 70 : 60;
      expect(checkpoint.passThreshold, `CP${checkpoint.id}`).toBe(expected);
    }
  });

  it("stage average thresholds are defined for all 3 stages", () => {
    expect(STAGE_AVERAGE_THRESHOLDS[1]).toBeGreaterThan(0);
    expect(STAGE_AVERAGE_THRESHOLDS[2]).toBeGreaterThan(0);
    expect(STAGE_AVERAGE_THRESHOLDS[3]).toBeGreaterThan(0);
  });
});
