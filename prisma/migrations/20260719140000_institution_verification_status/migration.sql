-- Manual review gate on new institution signups (§ InstitutionStatus) —
-- new signups start 'pending'; existing institutions are backfilled to
-- 'approved' since they've already been operating without incident.
CREATE TYPE "InstitutionStatus" AS ENUM ('pending', 'approved', 'rejected');
ALTER TABLE "institutions" ADD COLUMN "status" "InstitutionStatus" NOT NULL DEFAULT 'pending';
UPDATE "institutions" SET "status" = 'approved';
