-- Founder accounts become portable across institutions: a founder can join
-- multiple cohorts (and therefore multiple institutions) with the same
-- login, keeping shared checkpoint progress everywhere. Founder.cohort_id
-- remains the founder's original/home cohort; actual visibility for
-- institutions comes from this join table.
CREATE TABLE "cohort_memberships" (
    "id" TEXT NOT NULL,
    "founder_id" TEXT NOT NULL,
    "cohort_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cohort_memberships_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "cohort_memberships_founder_id_cohort_id_key" ON "cohort_memberships"("founder_id", "cohort_id");

ALTER TABLE "cohort_memberships" ADD CONSTRAINT "cohort_memberships_founder_id_fkey" FOREIGN KEY ("founder_id") REFERENCES "founders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cohort_memberships" ADD CONSTRAINT "cohort_memberships_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: every existing founder gets a membership row for their current home cohort.
INSERT INTO "cohort_memberships" ("id", "founder_id", "cohort_id", "joined_at")
SELECT md5(random()::text || clock_timestamp()::text || f.id), f.id, f.cohort_id, f.created_at
FROM "founders" f;
