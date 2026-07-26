-- Closes the Supabase Security Advisor "RLS Disabled in Public" warning.
--
-- Every table below had Row Level Security completely OFF, meaning anyone
-- holding the public NEXT_PUBLIC_SUPABASE_ANON_KEY (shipped to every
-- browser — required for login) could query these tables directly through
-- Supabase's auto-generated REST API (e.g. GET .../rest/v1/founders),
-- bypassing every requireFounder/requireInstitutionAdmin/requirePlatformAdmin
-- check in the app entirely. That would have exposed founder PII, B-BBEE
-- ownership %, checkpoint submission content, AI scores, institution
-- contacts — everything.
--
-- The fix is enable-with-zero-policies (default deny), not writing per-role
-- policies, because this app never queries these tables through PostgREST —
-- every real query goes through Prisma over DATABASE_URL (role: postgres) or
-- the admin API (role: service_role), and both roles have BYPASSRLS = true
-- (confirmed via pg_roles), so they ignore RLS entirely. The anon/
-- authenticated roles PostgREST actually uses do NOT have BYPASSRLS, so
-- enabling RLS with no policies blocks them completely without touching any
-- app behavior.
ALTER TABLE "institutions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cohorts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cohort_memberships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "founders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "assessment_attempts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "submissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "scores" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stage_statuses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "founder_eligibility" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "founder_outcomes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rate_limit_hits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
