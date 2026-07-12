import { z } from "zod";

export const DIMENSION_NAMES = [
  "Substance",
  "Evidence",
  "SA Reality Fit",
  "Rigour & Coherence",
  "Investor Credibility",
] as const;

// Gemini's JSON output occasionally emits numeric fields as strings even
// with responseMimeType: "application/json" — coerce before validating.
const dimensionSchema = z.object({
  dimension: z.enum(DIMENSION_NAMES),
  score: z.coerce.number().int().min(0).max(20),
  band: z.string().min(1),
  reasoning: z.string().min(1),
  improvement_guidance: z.string().min(1),
});

// checkpoint_score and passed are informational only from the model's
// perspective — the server always recomputes both from the validated
// dimension scores (see scoreSubmission in ./index.ts), so a malformed or
// missing value here should never fail validation.
export const scoringOutputSchema = z
  .object({
    checkpoint_id: z.coerce.number().int().catch(0),
    dimensions: z.array(dimensionSchema).length(5),
    checkpoint_score: z.coerce.number().catch(0),
    passed: z.boolean().catch(false),
    summary: z.string().min(1),
    top_priority_fix: z.string().min(1),
  })
  .refine(
    (data) => {
      const names = new Set(data.dimensions.map((d) => d.dimension));
      return names.size === 5 && DIMENSION_NAMES.every((name) => names.has(name));
    },
    { message: "dimensions must cover exactly the 5 required dimension names, each once" },
  );

export type ScoringOutput = z.infer<typeof scoringOutputSchema>;
