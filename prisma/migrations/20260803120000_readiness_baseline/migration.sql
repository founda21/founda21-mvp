-- Permanent, one-time snapshot of a founder's readiness the moment a
-- CohortMembership is created — the funder-facing "documented baseline,
-- progress measured in later cycles" feature.
CREATE TABLE "readiness_baselines" (
    "id" TEXT NOT NULL,
    "membership_id" TEXT NOT NULL,
    "captured_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stage" INTEGER NOT NULL,
    "checkpoints_passed" INTEGER NOT NULL,
    "total_points" INTEGER NOT NULL,
    "checkpoint_results" JSONB NOT NULL,

    CONSTRAINT "readiness_baselines_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "readiness_baselines_membership_id_key" ON "readiness_baselines"("membership_id");

ALTER TABLE "readiness_baselines"
  ADD CONSTRAINT "readiness_baselines_membership_id_fkey"
  FOREIGN KEY ("membership_id") REFERENCES "cohort_memberships"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Same enable-with-zero-policies treatment as every other table (§ the
-- 20260722165717 migration) — Prisma/the admin API bypass RLS entirely
-- (BYPASSRLS role), this just blocks the public anon/authenticated
-- PostgREST roles from reading founder readiness data directly.
ALTER TABLE "readiness_baselines" ENABLE ROW LEVEL SECURITY;
