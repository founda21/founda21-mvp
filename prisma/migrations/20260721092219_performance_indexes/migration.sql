-- Foreign-key columns queried without an index — Postgres does not
-- auto-index plain FK columns. cohort_memberships.cohort_id in particular
-- backs the funder dashboard's hottest query (getCohortReport, loaded on
-- every cohort page view).
CREATE INDEX "cohorts_institution_id_idx" ON "cohorts"("institution_id");
CREATE INDEX "cohort_memberships_cohort_id_idx" ON "cohort_memberships"("cohort_id");
