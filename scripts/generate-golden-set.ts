// One-time-ish fixture generator for the scoring regression harness (§
// scripts/scoring-regression.ts). Pulls real, already-scored submissions
// from the DB — spanning all 3 stages, multiple checkpoints, both pass and
// fail outcomes, and both venture types in use — and freezes them plus
// their original scores into scripts/scoring-golden-set.json.
//
// Re-run this only if you want to refresh/expand the golden set with new
// real submissions. It does not call Gemini — it just snapshots existing
// DB data.
//
// Run with: npx tsx scripts/generate-golden-set.ts
// or:       npm run scoring:golden-set

import { config } from "dotenv";
config({ path: __dirname + "/../.env.local" });

import { writeFileSync } from "fs";
// Dynamically imported inside main() (after dotenv has loaded env vars)
// rather than statically here — static imports are hoisted above this
// file's own code, and prisma.ts reads DATABASE_URL at module-load time.
import type { prisma as PrismaClientInstance } from "../src/lib/prisma";
import type { getCheckpoint as GetCheckpointFn } from "../src/lib/checkpoints";
import type { ScoringOutput } from "../src/lib/scoring/schema";

// Deliberately NOT the production getPriorArtifacts helper — that always
// pulls every OTHER checkpoint's *current* latest submission, which is
// correct for a live founder submitting today but wrong for freezing a
// historical baseline: at the time CP1 was originally scored, CP2-21
// didn't exist yet, so using today's (much richer) cross-referencing
// context would inflate the apparent drift with a methodology artifact,
// not a real model-consistency signal. This reconstructs prior artifacts
// exactly as they existed at the moment the baseline submission was
// created — the only fair comparison.
async function getPriorArtifactsAsOf(
  prisma: typeof PrismaClientInstance,
  getCheckpoint: typeof GetCheckpointFn,
  founderId: string,
  excludeCheckpointId: number,
  asOf: Date,
) {
  const otherSubmissions = await prisma.submission.findMany({
    where: { founderId, checkpointId: { not: excludeCheckpointId }, createdAt: { lt: asOf } },
    orderBy: { attemptNumber: "desc" },
  });
  const priorByCheckpoint = new Map<number, (typeof otherSubmissions)[number]>();
  for (const s of otherSubmissions) {
    const existing = priorByCheckpoint.get(s.checkpointId);
    if (!existing || s.attemptNumber > existing.attemptNumber) priorByCheckpoint.set(s.checkpointId, s);
  }
  return Array.from(priorByCheckpoint.values()).map((s) => ({
    checkpointId: s.checkpointId,
    name: getCheckpoint(s.checkpointId).name,
    content: s.artifactContent,
  }));
}

// Hand-picked for diversity: all 3 stages, a mix of clear passes, clear
// fails, near-threshold fails, and one known-cause score swing (Thandeka
// CP18 a1->a2, which moved from 21 to 71 after fixing a date-consistency
// issue in the artifact itself — a useful known-behavior sanity check).
const SELECTED_SUBMISSION_IDS = [
  "cmr3kas1w0002tou453wymtvw", // Jane Founder CP1 a1 (28, fail)
  "cmr3q8kmh0000j4u4nhr0jnc2", // Jane Founder CP1 a3 (93, pass)
  "cmr90nqzs0006tgu4lq7ostkd", // Jane Founder CP9 a3 (59, fail — near miss)
  "cmr910rot0009tgu45cj5mli9", // Jane Founder CP10 a2 (16, fail — very short)
  "cmr3ooxsu0015qku4jwe9jb1y", // Jane Founder CP15 a1 (58, fail)
  "cmr3p3d4m001nqku4ldpxhpo5", // Jane Founder CP20 a1 (93, pass)
  "cmr3rklop0000d0u4bfuyen5r", // Sam Direct CP1 a1 (0, fail — extreme low-effort)
  "cmr98i8q00002g4u4b37v4ssb", // Thabo Nkosi CP1 a1 (52, fail — near miss)
  "cmr98kdn30005g4u4bplqb859", // Thabo Nkosi CP1 a2 (67, pass)
  "cmr98oua3000bg4u4bpqr4zi7", // Thabo Nkosi CP3 a1 (32, fail)
  "cmr995xx6000wg4u41lc61yxq", // Thabo Nkosi CP3 a4 (82, pass — 4th attempt)
  "cmr9bvu8d000040u4hdlla4m1", // Thabo Nkosi CP12 a1 (50, fail — near miss)
  "cmr999ajb0010g4u47lmttyov", // Thabo Nkosi CP11 a1 (62, pass — structured traction)
  "cmrdieuyp000hsou4k19bj8nn", // Thandeka Founder CP4 a1 (63, pass — borderline)
  "cmrdik2bi000tsou4wydzddfu", // Thandeka Founder CP6 a1 (62, pass — borderline)
  "cmrdjdqp8001vsou41q0blye7", // Thandeka Founder CP18 a1 (21, fail — known cause)
  "cmrdjfnqs001zsou4sfy3q7w7", // Thandeka Founder CP18 a2 (71, pass — same, fixed)
  "cmrdiqx0e0000s8u4brn974za", // Thandeka Founder CP8 a1 (66, pass — file-required)
  "cmrdjraku0000p4u42388pckq", // Thandeka Founder CP19 a1 (94, pass — file-required deck)
  "cmrdi8w5h0005sou4oztwgizp", // Thandeka Founder CP1 a1 (95, pass — B2B, strong)
];

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

async function main() {
  const { prisma }: { prisma: typeof PrismaClientInstance } = await import("../src/lib/prisma");
  const { getCheckpoint }: { getCheckpoint: typeof GetCheckpointFn } = await import("../src/lib/checkpoints");

  const entries: GoldenSetEntry[] = [];

  for (const submissionId of SELECTED_SUBMISSION_IDS) {
    const submission = await prisma.submission.findUniqueOrThrow({
      where: { id: submissionId },
      include: { founder: true, score: true },
    });
    if (!submission.score) {
      console.warn(`Skipping ${submissionId} — no score attached.`);
      continue;
    }

    // As-of the moment THIS submission was created — not today's full
    // history — so the regression run cross-references exactly what the
    // original scoring call saw.
    const priorArtifacts = await getPriorArtifactsAsOf(
      prisma,
      getCheckpoint,
      submission.founderId,
      submission.checkpointId,
      submission.createdAt,
    );
    const output = submission.score.dimensionsJson as unknown as ScoringOutput;

    entries.push({
      label: `${submission.founder.fullName} CP${submission.checkpointId} a${submission.attemptNumber}`,
      checkpointId: submission.checkpointId,
      ventureType: submission.founder.ventureType,
      artifactContent: submission.artifactContent,
      priorArtifacts,
      baseline: {
        checkpointScore: submission.score.checkpointScore,
        passed: submission.score.passed,
        dimensions: output.dimensions.map((d) => ({ dimension: d.dimension, score: d.score })),
        modelVersion: submission.score.modelVersion,
        capturedAt: new Date().toISOString(),
      },
    });
    console.log(`Captured: ${entries[entries.length - 1].label}`);
  }

  const outPath = __dirname + "/scoring-golden-set.json";
  writeFileSync(outPath, JSON.stringify(entries, null, 2));
  console.log(`\nWrote ${entries.length} entries to ${outPath}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
