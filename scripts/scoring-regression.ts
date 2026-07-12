// Scoring consistency regression harness. Re-runs a fixed set of real,
// already-scored submissions (scripts/scoring-golden-set.json) through the
// LIVE production scoring pipeline (src/lib/scoring — imported, never
// reimplemented) and diffs the new output against the original baseline
// score. This is the guardrail against silent drift: a Gemini model
// update, a prompt tweak, or a schema change could all shift what
// "passing" means without anyone noticing until a founder complains.
//
// This costs one real Gemini call per entry — run it deliberately
// (after any scoring-adjacent change, or periodically), not on every commit.
//
// Run with: npx tsx scripts/scoring-regression.ts
// or:       npm run scoring:regression

import { config } from "dotenv";
config({ path: __dirname + "/../.env.local" });

import { readFileSync } from "fs";
// Dynamically imported below (after dotenv has loaded env vars) rather than
// statically here — static imports are hoisted above this file's own code,
// so a static import of scoring/prisma would read process.env before
// config() above ever ran.
import type { scoreSubmission as ScoreSubmissionFn } from "../src/lib/scoring";
import type { VentureType } from "../src/generated/prisma/enums";

type GoldenSetEntry = {
  label: string;
  checkpointId: number;
  ventureType: string;
  artifactContent: string;
  priorArtifacts: { checkpointId: number; name: string; content: string }[];
  baseline: {
    checkpointScore: number;
    passed: boolean;
    dimensions: { dimension: string; score: number }[];
    modelVersion: string;
    capturedAt: string;
  };
};

// Flags anything beyond ordinary LLM-call-to-call noise for a human to look
// at — not a hard pass/fail bar in itself.
const SCORE_DRIFT_WARN_THRESHOLD = 15;

async function main() {
  const { scoreSubmission }: { scoreSubmission: typeof ScoreSubmissionFn } = await import("../src/lib/scoring");

  const fixturePath = __dirname + "/scoring-golden-set.json";
  const entries: GoldenSetEntry[] = JSON.parse(readFileSync(fixturePath, "utf-8"));

  console.log(`Running scoring regression against ${entries.length} golden-set entries...\n`);

  const rows: {
    label: string;
    baselineScore: number;
    currentScore: number;
    delta: number;
    baselinePassed: boolean;
    currentPassed: boolean;
    flipped: boolean;
    flag: string;
  }[] = [];

  for (const entry of entries) {
    process.stdout.write(`Scoring ${entry.label}... `);
    try {
      const { output } = await scoreSubmission({
        checkpointId: entry.checkpointId,
        artifactContent: entry.artifactContent,
        ventureType: entry.ventureType as VentureType,
        priorArtifacts: entry.priorArtifacts,
      });

      const delta = output.checkpoint_score - entry.baseline.checkpointScore;
      const flipped = output.passed !== entry.baseline.passed;
      const flag = flipped
        ? "PASS/FAIL FLIPPED"
        : Math.abs(delta) >= SCORE_DRIFT_WARN_THRESHOLD
          ? "SCORE DRIFT"
          : "";

      rows.push({
        label: entry.label,
        baselineScore: entry.baseline.checkpointScore,
        currentScore: output.checkpoint_score,
        delta,
        baselinePassed: entry.baseline.passed,
        currentPassed: output.passed,
        flipped,
        flag,
      });
      console.log(`${output.checkpoint_score} (baseline ${entry.baseline.checkpointScore}, delta ${delta >= 0 ? "+" : ""}${delta})${flag ? ` — ${flag}` : ""}`);
    } catch (error) {
      console.log(`ERROR: ${error instanceof Error ? error.message : String(error)}`);
      rows.push({
        label: entry.label,
        baselineScore: entry.baseline.checkpointScore,
        currentScore: -1,
        delta: NaN,
        baselinePassed: entry.baseline.passed,
        currentPassed: false,
        flipped: false,
        flag: "SCORING ERROR",
      });
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log("SUMMARY");
  console.log("=".repeat(70));

  const flips = rows.filter((r) => r.flipped);
  const drifts = rows.filter((r) => !r.flipped && r.flag === "SCORE DRIFT");
  const errors = rows.filter((r) => r.flag === "SCORING ERROR");
  const clean = rows.filter((r) => !r.flag);

  console.log(`Clean (no flag):     ${clean.length}/${rows.length}`);
  console.log(`Score drift (>=${SCORE_DRIFT_WARN_THRESHOLD}pt): ${drifts.length}/${rows.length}`);
  console.log(`Pass/fail flipped:   ${flips.length}/${rows.length}`);
  console.log(`Errors:              ${errors.length}/${rows.length}`);

  if (flips.length > 0) {
    console.log("\n⚠ PASS/FAIL FLIPS (most serious — a founder's outcome would change):");
    for (const r of flips) {
      console.log(`  ${r.label}: was ${r.baselinePassed ? "PASS" : "FAIL"} (${r.baselineScore}), now ${r.currentPassed ? "PASS" : "FAIL"} (${r.currentScore})`);
    }
  }
  if (drifts.length > 0) {
    console.log("\n⚠ SCORE DRIFT (same pass/fail outcome, but score moved a lot):");
    for (const r of drifts) {
      console.log(`  ${r.label}: ${r.baselineScore} -> ${r.currentScore} (${r.delta >= 0 ? "+" : ""}${r.delta})`);
    }
  }
  if (errors.length > 0) {
    console.log("\n⚠ ERRORS (scoring call failed — investigate separately from drift):");
    for (const r of errors) {
      console.log(`  ${r.label}`);
    }
  }

  if (flips.length === 0 && errors.length === 0) {
    console.log("\nNo pass/fail flips or errors. " + (drifts.length > 0 ? "Some score drift to review above." : "Scoring is consistent with the golden-set baseline."));
  }

  process.exit(flips.length > 0 || errors.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
