import { DIMENSION_NAMES } from "@/lib/scoring/schema";

// Marketing/documentation copy for the five scoring dimensions — read-only
// display data, not part of the scoring engine. `name` values are pinned to
// DIMENSION_NAMES (the actual scoring schema) via the assertion below so
// this can never silently drift from what the engine actually scores.
export type Dimension = {
  name: (typeof DIMENSION_NAMES)[number];
  points: 20;
  description: string;
};

export const DIMENSIONS: Dimension[] = [
  {
    name: "Substance",
    points: 20,
    description: "Is the actual thing there, clearly stated, without jargon or padding?",
  },
  {
    name: "Evidence",
    points: 20,
    description: "Is it backed by documented proof rather than assertion?",
  },
  {
    name: "SA Reality Fit",
    points: 20,
    description:
      "Does it hold up under real South African conditions — load-shedding, data cost, device class, township and income realities, and local regulation?",
  },
  {
    name: "Rigour & Coherence",
    points: 20,
    description: "Is it internally consistent, and does it agree with the venture's other submissions?",
  },
  {
    name: "Investor Credibility",
    points: 20,
    description: "Would a real South African investor believe it?",
  },
];
