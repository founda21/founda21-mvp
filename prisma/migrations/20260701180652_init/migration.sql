-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "VentureType" AS ENUM ('B2C', 'B2B', 'HARDWARE');

-- CreateEnum
CREATE TYPE "StageStatusValue" AS ENUM ('in_progress', 'passed');

-- CreateTable
CREATE TABLE "institutions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "admin_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cohorts" (
    "id" TEXT NOT NULL,
    "institution_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "invite_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cohorts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "founders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "cohort_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "venture_name" TEXT NOT NULL,
    "venture_type" "VentureType" NOT NULL,
    "current_stage" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "founders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "founder_id" TEXT NOT NULL,
    "checkpoint_id" INTEGER NOT NULL,
    "artifact_type" TEXT NOT NULL,
    "artifact_content" TEXT NOT NULL,
    "attempt_number" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scores" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "checkpoint_score" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "dimensions_json" JSONB NOT NULL,
    "summary" TEXT NOT NULL,
    "top_priority_fix" TEXT NOT NULL,
    "model_version" TEXT NOT NULL,
    "framework_version" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stage_statuses" (
    "id" TEXT NOT NULL,
    "founder_id" TEXT NOT NULL,
    "stage" INTEGER NOT NULL,
    "status" "StageStatusValue" NOT NULL DEFAULT 'in_progress',
    "stage_average" DOUBLE PRECISION,
    "passed_at" TIMESTAMP(3),

    CONSTRAINT "stage_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "institutions_admin_user_id_key" ON "institutions"("admin_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "cohorts_invite_code_key" ON "cohorts"("invite_code");

-- CreateIndex
CREATE UNIQUE INDEX "founders_user_id_key" ON "founders"("user_id");

-- CreateIndex
CREATE INDEX "submissions_founder_id_checkpoint_id_idx" ON "submissions"("founder_id", "checkpoint_id");

-- CreateIndex
CREATE UNIQUE INDEX "scores_submission_id_key" ON "scores"("submission_id");

-- CreateIndex
CREATE UNIQUE INDEX "stage_statuses_founder_id_stage_key" ON "stage_statuses"("founder_id", "stage");

-- AddForeignKey
ALTER TABLE "cohorts" ADD CONSTRAINT "cohorts_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "founders" ADD CONSTRAINT "founders_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_founder_id_fkey" FOREIGN KEY ("founder_id") REFERENCES "founders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scores" ADD CONSTRAINT "scores_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stage_statuses" ADD CONSTRAINT "stage_statuses_founder_id_fkey" FOREIGN KEY ("founder_id") REFERENCES "founders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

