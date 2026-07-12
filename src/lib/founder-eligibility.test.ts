import { describe, it, expect } from "vitest";
import { computeEligibilityDerived } from "@/lib/founder-eligibility";

describe("computeEligibilityDerived", () => {
  it("classifies a majority-Black-owned, pre-revenue venture as EME (ESD-eligible)", () => {
    const result = computeEligibilityDerived({
      blackOwnershipPct: 100,
      blackWomenOwnershipPct: 0,
      annualTurnoverBand: "pre_revenue",
    });
    expect(result).toEqual({ esdBeneficiaryEligible: true, beneficiaryClass: "EME", blackWomenOwned: false });
  });

  it("classifies a majority-Black-owned, R10m-50m venture as QSE (ESD-eligible)", () => {
    const result = computeEligibilityDerived({
      blackOwnershipPct: 51,
      blackWomenOwnershipPct: 0,
      annualTurnoverBand: "ten_m_to_50m",
    });
    expect(result.beneficiaryClass).toBe("QSE");
    expect(result.esdBeneficiaryEligible).toBe(true);
  });

  it("classifies a majority-Black-owned, over-R50m venture as generic (not ESD-eligible)", () => {
    const result = computeEligibilityDerived({
      blackOwnershipPct: 60,
      blackWomenOwnershipPct: 0,
      annualTurnoverBand: "over_50m",
    });
    expect(result.beneficiaryClass).toBe("generic");
    expect(result.esdBeneficiaryEligible).toBe(false);
  });

  it("treats exactly 50% Black ownership as NOT majority-owned (boundary is >=51)", () => {
    const result = computeEligibilityDerived({
      blackOwnershipPct: 50,
      blackWomenOwnershipPct: 50,
      annualTurnoverBand: "pre_revenue",
    });
    expect(result.beneficiaryClass).toBe("n_a");
    expect(result.esdBeneficiaryEligible).toBe(false);
    expect(result.blackWomenOwned).toBe(false);
  });

  it("treats exactly 51% as majority-owned (boundary is inclusive)", () => {
    const result = computeEligibilityDerived({
      blackOwnershipPct: 51,
      blackWomenOwnershipPct: 51,
      annualTurnoverBand: "under_10m",
    });
    expect(result.beneficiaryClass).toBe("EME");
    expect(result.blackWomenOwned).toBe(true);
  });

  it("computes blackWomenOwned independently of overall Black ownership beneficiary class", () => {
    // Not majority Black-owned overall, but is majority Black-women-owned —
    // both facts should still be reported accurately, not short-circuited.
    const result = computeEligibilityDerived({
      blackOwnershipPct: 0,
      blackWomenOwnershipPct: 100,
      annualTurnoverBand: "pre_revenue",
    });
    expect(result.blackWomenOwned).toBe(true);
    expect(result.beneficiaryClass).toBe("n_a");
  });
});
