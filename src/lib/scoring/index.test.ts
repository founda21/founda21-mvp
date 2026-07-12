import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mocked at the provider boundary so these tests exercise the real
// consensus/averaging/error-classification logic in index.ts without any
// network dependency on Gemini — the exact logic added for the borderline
// flip-rate fix and the transient-503 resilience fix this session.
vi.mock("./gemini", () => ({
  callGemini: vi.fn(),
}));

import { callGemini } from "./gemini";
import { scoreSubmission, ScoringUnavailableError } from "./index";

const mockCallGemini = vi.mocked(callGemini);

function dims(scores: number[]) {
  const names = ["Substance", "Evidence", "SA Reality Fit", "Rigour & Coherence", "Investor Credibility"];
  return names.map((dimension, i) => ({
    dimension,
    score: scores[i],
    band: "Adequate",
    reasoning: "test",
    improvement_guidance: "test",
  }));
}

function fakeResponse(scores: number[]) {
  return {
    raw: {
      checkpoint_id: 1,
      dimensions: dims(scores),
      checkpoint_score: scores.reduce((a, b) => a + b, 0),
      passed: true,
      summary: "test summary",
      top_priority_fix: "test fix",
    },
    modelVersion: "gemini-2.5-flash",
  };
}

const baseParams = {
  checkpointId: 1,
  artifactContent: "test artifact",
  ventureType: "B2B" as const,
  priorArtifacts: [],
};

describe("scoreSubmission — consensus scoring", () => {
  beforeEach(() => {
    mockCallGemini.mockReset();
  });

  it("returns after a single call when the score is well clear of the threshold (not borderline)", async () => {
    mockCallGemini.mockResolvedValueOnce(fakeResponse([18, 18, 18, 18, 18])); // 90, threshold 60
    const { output } = await scoreSubmission(baseParams);
    expect(output.checkpoint_score).toBe(90);
    expect(output.passed).toBe(true);
    expect(mockCallGemini).toHaveBeenCalledTimes(1);
  });

  it("averages two calls when the first lands within the borderline margin, if they agree on pass/fail", async () => {
    // 65 is within 12 points of the 60 threshold — triggers a second call.
    mockCallGemini.mockResolvedValueOnce(fakeResponse([13, 13, 13, 13, 13])); // 65, pass
    mockCallGemini.mockResolvedValueOnce(fakeResponse([15, 15, 15, 15, 15])); // 75, pass
    const { output } = await scoreSubmission(baseParams);
    expect(mockCallGemini).toHaveBeenCalledTimes(2);
    // averaged dimension scores: (13+15)/2 = 14 each -> 70 total
    expect(output.checkpoint_score).toBe(70);
    expect(output.passed).toBe(true);
  });

  it("makes a third tie-breaking call when the first two calls disagree on pass/fail, and averages all three", async () => {
    mockCallGemini.mockResolvedValueOnce(fakeResponse([12, 12, 12, 12, 12])); // 60, pass (>= 60)
    mockCallGemini.mockResolvedValueOnce(fakeResponse([9, 9, 9, 9, 9])); // 45, fail
    mockCallGemini.mockResolvedValueOnce(fakeResponse([12, 12, 12, 12, 12])); // 60, pass — tiebreak
    const { output } = await scoreSubmission(baseParams);
    expect(mockCallGemini).toHaveBeenCalledTimes(3);
    // averaged: (12+9+12)/3 = 11 each -> 55 total -> fail
    expect(output.checkpoint_score).toBe(55);
    expect(output.passed).toBe(false);
  });

  it("keeps the first call's qualitative text (summary/reasoning) even after averaging", async () => {
    mockCallGemini.mockResolvedValueOnce({
      ...fakeResponse([13, 13, 13, 13, 13]),
      raw: { ...fakeResponse([13, 13, 13, 13, 13]).raw, summary: "FIRST CALL SUMMARY" },
    });
    mockCallGemini.mockResolvedValueOnce(fakeResponse([15, 15, 15, 15, 15]));
    const { output } = await scoreSubmission(baseParams);
    expect(output.summary).toBe("FIRST CALL SUMMARY");
  });
});

describe("scoreSubmission — error classification", () => {
  beforeEach(() => {
    mockCallGemini.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("throws ScoringUnavailableError with a clean message when every retry hits a transient 503", async () => {
    mockCallGemini.mockRejectedValue(
      new Error("[GoogleGenerativeAI Error]: ... [503 Service Unavailable] This model is currently experiencing high demand."),
    );
    const resultPromise = scoreSubmission(baseParams);
    resultPromise.catch(() => {}); // mark handled immediately — avoids a spurious unhandled-rejection warning while timers advance below
    // 4 attempts, exponential retry delay between them — advance past all of it.
    await vi.advanceTimersByTimeAsync(5000 + 10000 + 15000 + 1000);
    await expect(resultPromise).rejects.toThrow(ScoringUnavailableError);
    await expect(resultPromise).rejects.toThrow(/try again in a few minutes/i);
  });

  it("throws a generic Error (not ScoringUnavailableError) for a non-transient failure", async () => {
    mockCallGemini.mockRejectedValue(new Error("invalid JSON response"));
    const resultPromise = scoreSubmission(baseParams);
    resultPromise.catch(() => {}); // mark handled immediately — avoids a spurious unhandled-rejection warning while timers advance below
    await vi.advanceTimersByTimeAsync(5000 + 10000 + 15000 + 1000);
    await expect(resultPromise).rejects.not.toThrow(ScoringUnavailableError);
  });
});
