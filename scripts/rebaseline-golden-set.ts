// Refreshes scripts/scoring-golden-set.json baselines to reflect the current
// scoring rubric (§ FRAMEWORK_VERSION in src/lib/scoring/index.ts). The v0.1
// baselines were real DB-scored submissions from before the rubric fix
// (grounded SA Reality Fit threads for 7 checkpoints + redefined Investor
// Credibility) — running scoring:regression against those old baselines
// after an intentional rubric change reports a flood of "flips"/"drift" that
// are the rubric working as designed, not a bug. This re-scores every
// golden-set entry under the CURRENT rubric and overwrites `baseline` with
// the result, so future scoring:regression runs only flag genuine,
// unintended drift going forward — not this one deliberate, already-reviewed
// shift.
//
// Reuses the same frozen artifactContent/priorArtifacts already in the
// golden set (captured as-of each submission's original creation time) —
// only the baseline scores change, not what's being scored or against what
// context.
//
// Run with: npx tsx scripts/rebaseline-golden-set.ts
// or:       npm run scoring:rebaseline

import { config } from "dotenv";
config({ path: __dirname + "/../.env.local" });

import { readFileSync, writeFileSync } from "fs";
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
    frameworkVersion?: string;
  };
};

async function main() {
  const { scoreSubmission }: { scoreSubmission: typeof ScoreSubmissionFn } = await import("../src/lib/scoring");
  const { FRAMEWORK_VERSION }: { FRAMEWORK_VERSION: string } = await import("../src/lib/scoring");

  const fixturePath = __dirname + "/scoring-golden-set.json";
  const entries: GoldenSetEntry[] = JSON.parse(readFileSync(fixturePath, "utf-8"));

  console.log(`Rebaselining ${entries.length} golden-set entries under ${FRAMEWORK_VERSION}...\n`);

  for (const entry of entries) {
    process.stdout.write(`${entry.label}... `);
    const oldScore = entry.baseline.checkpointScore;
    const oldPassed = entry.baseline.passed;

    const { output } = await scoreSubmission({
      checkpointId: entry.checkpointId,
      artifactContent: entry.artifactContent,
      ventureType: entry.ventureType as VentureType,
      priorArtifacts: entry.priorArtifacts,
    });

    entry.baseline = {
      checkpointScore: output.checkpoint_score,
      passed: output.passed,
      dimensions: output.dimensions.map((d) => ({ dimension: d.dimension, score: d.score })),
      modelVersion: "gemini-2.5-flash",
      capturedAt: new Date().toISOString(),
      frameworkVersion: FRAMEWORK_VERSION,
    };

    console.log(
      `${oldScore} (${oldPassed ? "PASS" : "FAIL"}) -> ${output.checkpoint_score} (${output.passed ? "PASS" : "FAIL"})`,
    );
  }

  writeFileSync(fixturePath, JSON.stringify(entries, null, 2));
  console.log(`\nWrote refreshed baselines to ${fixturePath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
