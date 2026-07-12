-- Funder-side shortlist toggle for the cohort roster (§ shortlist tabs) — a
-- per cohort-membership boolean, same pattern as existing `status`.
ALTER TABLE "cohort_memberships" ADD COLUMN "shortlisted" BOOLEAN NOT NULL DEFAULT false;
