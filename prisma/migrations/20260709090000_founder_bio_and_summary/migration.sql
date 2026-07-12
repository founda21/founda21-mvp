-- Founder-authored, funder-facing bio + startup summary text, shown on the
-- Summary page. Nullable — captured on /complete-profile, after Founder rows
-- already exist.
ALTER TABLE "founders" ADD COLUMN "bio" TEXT;
ALTER TABLE "founders" ADD COLUMN "startup_summary" TEXT;
