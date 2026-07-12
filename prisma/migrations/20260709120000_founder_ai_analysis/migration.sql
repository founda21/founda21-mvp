-- AI-generated funder-facing investment analysis, separate from the 21-
-- checkpoint scoring engine — synthesized from already-scored checkpoint
-- results (§ founder-analysis.ts). Nullable, generated after signup.
ALTER TABLE "founders" ADD COLUMN "analysis" JSONB;
ALTER TABLE "founders" ADD COLUMN "analysis_model_version" TEXT;
ALTER TABLE "founders" ADD COLUMN "analysis_generated_at" TIMESTAMP(3);
