-- Generalizes the single "institution type" into the real funder segments,
-- adds passcode configuration to Cohort, membership status, and the three
-- new eligibility/outcome/reporting tables. Additive and backward-compatible
-- except for institution_type -> funder_type (see safe-replace steps below).

-- 1. New enums
CREATE TYPE "FunderType" AS ENUM (
  'corporate_esd', 'esd_fund_manager', 'dfi_government',
  'university', 'accelerator_incubator', 'impact_investor_vc'
);
CREATE TYPE "CohortMembershipStatus" AS ENUM ('active', 'completed', 'withdrawn');
CREATE TYPE "AnnualTurnoverBand" AS ENUM ('pre_revenue', 'under_10m', 'ten_m_to_50m', 'over_50m');
CREATE TYPE "EntityType" AS ENUM ('not_yet_registered', 'pty_ltd', 'other');
CREATE TYPE "CapitalType" AS ENUM ('equity', 'debt', 'grant', 'esd_grant', 'none');
CREATE TYPE "BeneficiaryClass" AS ENUM ('EME', 'QSE', 'generic', 'n_a');

-- 2. Institution: safe additive enum replacement (institution_type -> funder_type)
ALTER TABLE "institutions" ADD COLUMN "funder_type" "FunderType";

UPDATE "institutions" SET "funder_type" = CASE "institution_type"
  WHEN 'UNIVERSITY' THEN 'university'::"FunderType"
  WHEN 'ACCELERATOR' THEN 'accelerator_incubator'::"FunderType"
  WHEN 'INCUBATOR' THEN 'accelerator_incubator'::"FunderType"
  WHEN 'OTHER' THEN 'impact_investor_vc'::"FunderType"
  ELSE 'impact_investor_vc'::"FunderType"
END;

ALTER TABLE "institutions" ALTER COLUMN "funder_type" SET NOT NULL;
ALTER TABLE "institutions" DROP COLUMN "institution_type";
DROP TYPE "InstitutionType";

ALTER TABLE "institutions" ADD COLUMN "contact_name" TEXT;
ALTER TABLE "institutions" ADD COLUMN "contact_email" TEXT;

-- 3. Cohort: passcode configuration
ALTER TABLE "cohorts" ADD COLUMN "intended_entry_stage" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "cohorts" ADD COLUMN "max_uses" INTEGER;
ALTER TABLE "cohorts" ADD COLUMN "uses_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "cohorts" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "cohorts" ADD COLUMN "expires_at" TIMESTAMP(3);

-- Backfill uses_count from existing membership counts so pre-existing
-- cohorts report accurate usage immediately.
UPDATE "cohorts" c SET "uses_count" = (
  SELECT COUNT(*) FROM "cohort_memberships" m WHERE m."cohort_id" = c."id"
);

-- 4. CohortMembership: status
ALTER TABLE "cohort_memberships" ADD COLUMN "status" "CohortMembershipStatus" NOT NULL DEFAULT 'active';

-- 5. FounderEligibility (1:1 with Founder)
CREATE TABLE "founder_eligibility" (
    "id" TEXT NOT NULL,
    "founder_id" TEXT NOT NULL,
    "black_ownership_pct" INTEGER NOT NULL,
    "black_women_ownership_pct" INTEGER NOT NULL,
    "annual_turnover_band" "AnnualTurnoverBand" NOT NULL,
    "cipc_number" TEXT,
    "entity_type" "EntityType" NOT NULL,
    "esd_beneficiary_eligible" BOOLEAN NOT NULL,
    "beneficiary_class" "BeneficiaryClass" NOT NULL,
    "black_women_owned" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "founder_eligibility_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "founder_eligibility_founder_id_key" ON "founder_eligibility"("founder_id");
ALTER TABLE "founder_eligibility" ADD CONSTRAINT "founder_eligibility_founder_id_fkey"
  FOREIGN KEY ("founder_id") REFERENCES "founders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 6. FounderOutcome (one-to-many, snapshot time series)
CREATE TABLE "founder_outcomes" (
    "id" TEXT NOT NULL,
    "founder_id" TEXT NOT NULL,
    "capital_raised_zar" INTEGER NOT NULL DEFAULT 0,
    "capital_type" "CapitalType"[] NOT NULL DEFAULT '{}',
    "monthly_revenue_zar" INTEGER NOT NULL DEFAULT 0,
    "headcount" INTEGER NOT NULL DEFAULT 0,
    "still_operating" BOOLEAN NOT NULL DEFAULT true,
    "graduated_to_supplier" BOOLEAN NOT NULL DEFAULT false,
    "snapshot_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "founder_outcomes_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "founder_outcomes_founder_id_snapshot_date_idx" ON "founder_outcomes"("founder_id", "snapshot_date");
ALTER TABLE "founder_outcomes" ADD CONSTRAINT "founder_outcomes_founder_id_fkey"
  FOREIGN KEY ("founder_id") REFERENCES "founders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 7. InstitutionalReport (per founder x institution x stage x membership)
CREATE TABLE "institutional_reports" (
    "id" TEXT NOT NULL,
    "founder_id" TEXT NOT NULL,
    "institution_id" TEXT NOT NULL,
    "cohort_membership_id" TEXT NOT NULL,
    "stage" INTEGER NOT NULL,
    "beneficiary_eligibility_snapshot" JSONB NOT NULL,
    "baseline_needs_analysis" JSONB NOT NULL,
    "development_delta" JSONB,
    "reportable_metrics" JSONB NOT NULL,
    "framework_version" TEXT NOT NULL,
    "model_version" TEXT NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "institutional_reports_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "institutional_reports_founder_id_institution_id_stage_idx"
  ON "institutional_reports"("founder_id", "institution_id", "stage");
ALTER TABLE "institutional_reports" ADD CONSTRAINT "institutional_reports_founder_id_fkey"
  FOREIGN KEY ("founder_id") REFERENCES "founders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "institutional_reports" ADD CONSTRAINT "institutional_reports_institution_id_fkey"
  FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "institutional_reports" ADD CONSTRAINT "institutional_reports_cohort_membership_id_fkey"
  FOREIGN KEY ("cohort_membership_id") REFERENCES "cohort_memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;
