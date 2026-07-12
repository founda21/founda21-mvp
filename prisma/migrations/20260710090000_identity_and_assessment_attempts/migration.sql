-- System integrity fix 1: identity anchor (one human = one founder account).
CREATE TYPE "IdType" AS ENUM ('sa_id', 'passport');

ALTER TABLE "founders" ADD COLUMN "phone_number" TEXT;
ALTER TABLE "founders" ADD COLUMN "id_type" "IdType";
ALTER TABLE "founders" ADD COLUMN "id_number_hash" TEXT;

CREATE UNIQUE INDEX "founders_phone_number_key" ON "founders"("phone_number");
CREATE UNIQUE INDEX "founders_id_number_hash_key" ON "founders"("id_number_hash");

-- System integrity fix 2: permanent per-stage attempt record (retake policy).
CREATE TYPE "AttemptResult" AS ENUM ('pass', 'fail');

CREATE TABLE "assessment_attempts" (
    "id" TEXT NOT NULL,
    "founder_id" TEXT NOT NULL,
    "stage" INTEGER NOT NULL,
    "attempt_number" INTEGER NOT NULL,
    "result" "AttemptResult" NOT NULL,
    "per_checkpoint_outcome" JSONB NOT NULL,
    "consistency_flags" JSONB,
    "similarity_flags" JSONB,
    "framework_version" TEXT NOT NULL,
    "model_version" TEXT NOT NULL,
    "scored_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_attempts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "assessment_attempts_founder_id_stage_attempt_number_key" ON "assessment_attempts"("founder_id", "stage", "attempt_number");
CREATE INDEX "assessment_attempts_founder_id_stage_idx" ON "assessment_attempts"("founder_id", "stage");

ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_founder_id_fkey" FOREIGN KEY ("founder_id") REFERENCES "founders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
