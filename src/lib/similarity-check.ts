import { prisma } from "@/lib/prisma";
import { checkpointsForStage, type Stage } from "@/lib/checkpoints";

// System integrity fix 3.3 — intra-cohort similarity flag. pgvector is
// technically installable on this Supabase project but unused today, and
// using it properly would mean a new embedding-generation call per
// submission (real added infrastructure and cost for a flag-only MVP
// feature). Shingle/Jaccard overlap is the genuinely lightest method: pure
// computation, no new dependency, no new API call, no schema beyond the
// existing similarityFlags JSON column. Never shown to founders; flag-only,
// never blocks or rescores anything.

const SHINGLE_SIZE = 5; // words per shingle
const SIMILARITY_THRESHOLD = 0.6; // Jaccard similarity at/above this is flagged
const MIN_LENGTH = 100; // characters — too short to compare meaningfully below this

function shingles(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const result = new Set<string>();
  for (let i = 0; i <= words.length - SHINGLE_SIZE; i++) {
    result.add(words.slice(i, i + SHINGLE_SIZE).join(" "));
  }
  return result;
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const shingle of Array.from(a)) {
    if (b.has(shingle)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export type SimilarityFlag = {
  checkpointId: number;
  otherFounderId: string;
  similarity: number;
};

// Called once per fully-scored stage from maybeRecordStageAttempt (§
// attempts.ts). Compares this founder's latest answer for each checkpoint
// in the stage against every other founder's latest answer for that same
// checkpoint, across the whole dataset (not scoped to one cohort — the
// underlying concern, near-identical answers, doesn't respect cohort
// boundaries).
export async function generateSimilarityFlags(founderId: string, stage: number): Promise<SimilarityFlag[] | null> {
  const checkpoints = checkpointsForStage(stage as Stage);
  const flags: SimilarityFlag[] = [];

  for (const checkpoint of checkpoints) {
    const submission = await prisma.submission.findFirst({
      where: { founderId, checkpointId: checkpoint.id },
      orderBy: { attemptNumber: "desc" },
    });
    if (!submission || submission.artifactContent.length < MIN_LENGTH) continue;

    const otherSubmissions = await prisma.submission.findMany({
      where: { checkpointId: checkpoint.id, founderId: { not: founderId } },
      orderBy: { attemptNumber: "desc" },
      distinct: ["founderId"],
    });

    const mine = shingles(submission.artifactContent);
    for (const other of otherSubmissions) {
      if (other.artifactContent.length < MIN_LENGTH) continue;
      const similarity = jaccardSimilarity(mine, shingles(other.artifactContent));
      if (similarity >= SIMILARITY_THRESHOLD) {
        flags.push({
          checkpointId: checkpoint.id,
          otherFounderId: other.founderId,
          similarity: Math.round(similarity * 100) / 100,
        });
      }
    }
  }

  return flags.length > 0 ? flags : null;
}
