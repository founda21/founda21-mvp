"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { VentureType, VentureStage, IdType } from "@/generated/prisma/enums";
import { requireFounder } from "@/lib/auth";
import { parseEligibilityForm, computeEligibilityDerived } from "@/lib/founder-eligibility";
import { parseOutcomeIntakeForm } from "@/lib/founder-outcome";
import { validatePasscode, recordPasscodeUse } from "@/lib/passcode";
import { validateIdNumber, normalizePhoneToE164, hashIdNumber } from "@/lib/identity";
import { checkRateLimit } from "@/lib/rate-limit";

const VALID_VENTURE_TYPES = new Set(Object.values(VentureType));
const VALID_VENTURE_STAGES = new Set(Object.values(VentureStage));
const VALID_ID_TYPES = new Set(Object.values(IdType));

const SIGNUP_RATE_LIMIT = 5;
const SIGNUP_RATE_WINDOW_MS = 60 * 60 * 1000;

// Best-effort client IP from proxy headers (Vercel/most hosts set
// x-forwarded-for). Returns null in local dev where these headers aren't
// set — signup rate limiting is skipped rather than bucketing all local
// traffic together under one key.
async function getClientIp(): Promise<string | null> {
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headersList.get("x-real-ip");
}

type FounderFormFields = {
  fullName: string;
  ventureName: string;
  ventureType: VentureType;
  ventureStage: VentureStage;
  email: string;
  password: string;
  phoneNumber: string;
  idType: IdType;
  idNumber: string;
};

// Signup captures name, venture, venture type/stage, email, password, and
// the identity anchor (§ system integrity fix 1: phone + ID/passport,
// consent to collecting the ID number). Ownership/entity and outcome
// baseline (funder reporting data, not needed to start checkpoints) are
// captured separately right after signup, on /complete-profile — see
// completeFounderProfile below.
function parseFounderForm(formData: FormData): FounderFormFields | { error: string } {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const ventureName = String(formData.get("ventureName") ?? "").trim();
  const ventureType = String(formData.get("ventureType") ?? "");
  const ventureStageRaw = String(formData.get("ventureStage") ?? "");
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const phoneRaw = String(formData.get("phoneNumber") ?? "").trim();
  const idTypeRaw = String(formData.get("idType") ?? "");
  const idNumberRaw = String(formData.get("idNumber") ?? "").trim();
  const consent = formData.get("identityConsent");

  if (!fullName || !ventureName || !email || !password || !phoneRaw || !idNumberRaw) {
    return { error: "All fields are required." };
  }
  if (!VALID_VENTURE_TYPES.has(ventureType as VentureType)) {
    return { error: "Select a venture type." };
  }
  if (!VALID_VENTURE_STAGES.has(ventureStageRaw as VentureStage)) {
    return { error: "Select your venture stage." };
  }
  if (!VALID_ID_TYPES.has(idTypeRaw as IdType)) {
    return { error: "Select whether you're providing an SA ID or a passport number." };
  }
  if (!consent) {
    return { error: "You must consent to Founda21 collecting your ID/passport number to verify your identity." };
  }

  const phoneResult = normalizePhoneToE164(phoneRaw);
  if (!phoneResult.ok) return { error: phoneResult.error };

  const idValidation = validateIdNumber(idTypeRaw as IdType, idNumberRaw);
  if (!idValidation.ok) return { error: idValidation.error };

  return {
    fullName,
    ventureName,
    ventureType: ventureType as VentureType,
    ventureStage: ventureStageRaw as VentureStage,
    email,
    password,
    phoneNumber: phoneResult.value,
    idType: idTypeRaw as IdType,
    idNumber: idNumberRaw,
  };
}

// A founder account is portable across institutions — the same login can be
// a member of any number of cohorts, keeping one shared set of checkpoint
// progress rather than starting over per institution. Idempotent: joining a
// cohort they're already in is a no-op.
async function ensureCohortMembership(founderId: string, cohortId: string) {
  await prisma.cohortMembership.upsert({
    where: { founderId_cohortId: { founderId, cohortId } },
    update: {},
    create: { founderId, cohortId },
  });
}

// Creates the Supabase auth user + Founder + initial StageStatus row for a
// given cohort. Shared by every founder entry point that creates a brand-new
// account. Eligibility/outcome intake happens separately, right after, on
// /complete-profile (§ requireFounder callers gate on it via FounderLayout).
type CreateFounderResult = { ok: true; hasSession: boolean } | { ok: false; error: string };

async function createFounderInCohort(
  cohortId: string,
  fields: FounderFormFields,
): Promise<CreateFounderResult> {
  // Created via the admin API with email_confirm: true so no confirmation
  // email is sent — Supabase's free-tier email rate limit (a handful per
  // hour) otherwise blocks signup entirely under any real testing volume.
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: fields.email,
    password: fields.password,
    email_confirm: true,
  });

  if (error || !data.user) {
    const message = error?.message?.toLowerCase().includes("already")
      ? "An account already exists for that email — use \"Already have an account? Log in\" below instead."
      : (error?.message ?? "Sign up failed.");
    return { ok: false, error: message };
  }

  // The raw ID/passport number only ever exists here, in memory — hashed
  // immediately, never stored or logged. Uniqueness (§ identity anchor) is
  // enforced by the DB unique indexes on phone_number/id_number_hash; a
  // duplicate identity surfaces as a Prisma P2002 error below, not a
  // pre-check, so there's no TOCTOU gap between checking and creating.
  const idNumberHash = hashIdNumber(fields.idNumber);

  let founder = await prisma.founder.findUnique({ where: { userId: data.user.id } });
  if (!founder) {
    try {
      founder = await prisma.founder.create({
        data: {
          userId: data.user.id,
          cohortId,
          fullName: fields.fullName,
          ventureName: fields.ventureName,
          ventureType: fields.ventureType,
          ventureStage: fields.ventureStage,
          currentStage: 1,
          phoneNumber: fields.phoneNumber,
          idType: fields.idType,
          idNumberHash,
        },
      });
    } catch (createError) {
      // Roll back the just-created auth user so a rejected signup doesn't
      // leave an orphaned Supabase account with no Founder row behind it.
      await admin.auth.admin.deleteUser(data.user.id);
      if (isUniqueConstraintError(createError, "phone_number")) {
        return { ok: false, error: "This phone number already has a Founda21 account — log in instead." };
      }
      if (isUniqueConstraintError(createError, "id_number_hash")) {
        return {
          ok: false,
          error: "This identity already has a Founda21 account — log in instead of creating a new one.",
        };
      }
      throw createError;
    }
    await prisma.stageStatus.create({
      data: { founderId: founder.id, stage: 1, status: "in_progress" },
    });
  }
  await ensureCohortMembership(founder.id, cohortId);

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: fields.email,
    password: fields.password,
  });

  return { ok: true, hasSession: !signInError };
}

// Prisma P2002 (unique constraint violation). meta.target is meant to name
// the violated column(s), but with the driver-adapter setup this project
// uses it comes back empty — the column name only reliably appears in the
// error message text itself (confirmed directly: "Unique constraint failed
// on the fields: (`phone_number`)"), so match on that instead.
function isUniqueConstraintError(error: unknown, column: string): boolean {
  if (typeof error !== "object" || error === null) return false;
  const err = error as { code?: string; message?: string; meta?: { target?: string[] | string } };
  if (err.code !== "P2002") return false;
  const target = err.meta?.target;
  if (Array.isArray(target) && target.includes(column)) return true;
  if (typeof target === "string" && target.includes(column)) return true;
  return typeof err.message === "string" && err.message.includes(column);
}

// Lets a founder who already has a Founda21 account (from a previous
// funder) enroll under a new funder's passcode without starting over — their
// existing checkpoint progress carries over and becomes visible to this
// funder too.
async function joinWithExistingAccount(passcode: string, formData: FormData, errorBase: string) {
  const validation = await validatePasscode(passcode);
  if (!validation.ok) {
    redirect(`${errorBase}?error=${encodeURIComponent(validation.reason)}&mode=login`);
  }
  const cohort = validation.cohort;

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    redirect(`${errorBase}?error=${encodeURIComponent("Enter your email and password.")}&mode=login`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    redirect(
      `${errorBase}?error=${encodeURIComponent("Couldn't log in — check your email and password.")}&mode=login`,
    );
  }

  const founder = await prisma.founder.findUnique({ where: { userId: data.user.id } });
  if (!founder) {
    await supabase.auth.signOut();
    redirect(
      `${errorBase}?error=${encodeURIComponent('No Founda21 founder account found for that email — sign up instead.')}&mode=login`,
    );
  }

  const alreadyMember = await prisma.cohortMembership.findUnique({
    where: { founderId_cohortId: { founderId: founder.id, cohortId: cohort.id } },
  });
  await ensureCohortMembership(founder.id, cohort.id);
  if (!alreadyMember) await recordPasscodeUse(cohort.id);
  redirect("/founder");
}

export async function joinExistingAccountViaPasscode(formData: FormData) {
  const passcode = String(formData.get("passcode") ?? "").trim();
  if (!passcode) {
    redirect(`/get-started/founder?error=${encodeURIComponent("Enter your passcode.")}&mode=login`);
  }
  await joinWithExistingAccount(passcode, formData, "/get-started/founder");
}

// Lets a founder self-report progressing to a later venture stage, which
// unlocks the checkpoints gated to that stage (§ STAGE_MIN_VENTURE_STAGE) —
// without this, an idea-stage founder who builds real traction would stay
// capped at Stage 1 checkpoints forever.
export async function updateVentureStage(formData: FormData) {
  const { founder } = await requireFounder();
  const ventureStageRaw = String(formData.get("ventureStage") ?? "");

  if (!VALID_VENTURE_STAGES.has(ventureStageRaw as VentureStage)) {
    redirect(`/founder?error=${encodeURIComponent("Select a valid venture stage.")}`);
  }

  await prisma.founder.update({
    where: { id: founder.id },
    data: { ventureStage: ventureStageRaw as VentureStage },
  });

  redirect(`/founder?message=${encodeURIComponent("Venture stage updated.")}`);
}

// Lets a founder revise the bio/summary they gave funders at intake
// (§ completeFounderProfile) — that's a one-time gate before checkpoints
// start, this is the ongoing edit path once they're already in.
export async function updateFounderBio(formData: FormData) {
  const { founder } = await requireFounder();
  const bio = String(formData.get("bio") ?? "").trim();
  const startupSummary = String(formData.get("startupSummary") ?? "").trim();

  if (!bio || !startupSummary) {
    redirect(`/founder/profile?error=${encodeURIComponent("Both fields are required.")}`);
  }

  await prisma.founder.update({
    where: { id: founder.id },
    data: { bio, startupSummary },
  });

  redirect(`/founder/profile?message=${encodeURIComponent("Profile updated.")}`);
}

// The founder entry point (spec §6): stage picker -> passcode -> auth. No
// self-serve, no-passcode path exists anymore — a valid passcode is required
// to reach the scoring engine at all.
export async function joinViaPasscode(formData: FormData) {
  const passcode = String(formData.get("passcode") ?? "").trim();
  if (!passcode) {
    redirect(`/get-started/founder?error=${encodeURIComponent("Enter your passcode.")}`);
  }

  const ip = await getClientIp();
  if (ip) {
    const rateLimit = await checkRateLimit(`signup:${ip}`, SIGNUP_RATE_LIMIT, SIGNUP_RATE_WINDOW_MS);
    if (!rateLimit.ok) {
      redirect(
        `/get-started/founder?error=${encodeURIComponent(
          `Too many signup attempts from this network. Try again after ${rateLimit.retryAfter.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}.`,
        )}`,
      );
    }
  }

  const validation = await validatePasscode(passcode);
  if (!validation.ok) {
    redirect(`/get-started/founder?error=${encodeURIComponent(validation.reason)}`);
  }
  const cohort = validation.cohort;

  const parsed = parseFounderForm(formData);
  if ("error" in parsed) {
    redirect(`/get-started/founder?error=${encodeURIComponent(parsed.error)}`);
  }

  const result = await createFounderInCohort(cohort.id, parsed);
  if (!result.ok) {
    redirect(`/get-started/founder?error=${encodeURIComponent(result.error)}`);
  }
  await recordPasscodeUse(cohort.id);

  if (result.hasSession) redirect("/founder");
  redirect(
    `/login?message=${encodeURIComponent("Check your email to confirm your account, then log in.")}`,
  );
}

// POPIA data-deletion — founder-initiated, not funder-initiated: a founder
// account is portable across institutions, so no single institution admin
// should be able to unilaterally delete data another institution also
// relies on. Password-reconfirmed (not just the existing session) and a
// literal-text confirmation, since this is irreversible and destroys every
// checkpoint submission/score permanently.
export async function deleteFounderAccount(formData: FormData) {
  const { user, founder } = await requireFounder();
  const password = String(formData.get("password") ?? "");
  const confirmText = String(formData.get("confirmText") ?? "").trim();

  if (confirmText !== "DELETE") {
    redirect(`/founder/settings?error=${encodeURIComponent('Type DELETE (in capitals) to confirm.')}`);
  }
  if (!user.email) {
    redirect(`/founder/settings?error=${encodeURIComponent("Couldn't verify your account email.")}`);
  }

  // Verified on a throwaway, non-session-bound client — not the request's
  // real Supabase client — so a wrong-password attempt here can never touch
  // the founder's actual session cookies.
  const verifyClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const { error } = await verifyClient.auth.signInWithPassword({ email: user.email, password });
  if (error) {
    redirect(`/founder/settings?error=${encodeURIComponent("Incorrect password.")}`);
  }

  // Prisma cascade deletes every child row (submissions, scores, stage
  // statuses, memberships, eligibility, outcomes, assessment attempts) —
  // all declared onDelete: Cascade against Founder already.
  await prisma.founder.delete({ where: { id: founder.id } });

  const admin = createAdminClient();
  await admin.auth.admin.deleteUser(user.id);

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/login?message=${encodeURIComponent("Your Founda21 account and all associated data have been deleted.")}`);
}

// The one-time eligibility/outcome intake, moved off the signup form (§ not
// needed to start checkpoints, and cramming B-BBEE ownership/turnover into
// account creation reads as a screening gate even though it never touches
// scoring). Also collects the founder's own bio + a plain-language startup
// summary — funder-facing intro text, not scored. Gated via FounderLayout:
// any founder missing any of these is redirected here before /founder.
export async function completeFounderProfile(formData: FormData) {
  const { founder } = await requireFounder();

  const bio = String(formData.get("bio") ?? "").trim();
  const startupSummary = String(formData.get("startupSummary") ?? "").trim();
  if (!bio || !startupSummary) {
    redirect(`/complete-profile?error=${encodeURIComponent("Tell us a bit about you and your startup.")}`);
  }

  const eligibility = parseEligibilityForm(formData);
  if ("error" in eligibility) {
    redirect(`/complete-profile?error=${encodeURIComponent(eligibility.error)}`);
  }
  const outcome = parseOutcomeIntakeForm(formData);
  if ("error" in outcome) {
    redirect(`/complete-profile?error=${encodeURIComponent(outcome.error)}`);
  }

  await prisma.founder.update({
    where: { id: founder.id },
    data: { bio, startupSummary },
  });

  const derived = computeEligibilityDerived(eligibility);
  await prisma.founderEligibility.upsert({
    where: { founderId: founder.id },
    update: {
      blackOwnershipPct: eligibility.blackOwnershipPct,
      blackWomenOwnershipPct: eligibility.blackWomenOwnershipPct,
      annualTurnoverBand: eligibility.annualTurnoverBand,
      cipcNumber: eligibility.cipcNumber,
      entityType: eligibility.entityType,
      esdBeneficiaryEligible: derived.esdBeneficiaryEligible,
      beneficiaryClass: derived.beneficiaryClass,
      blackWomenOwned: derived.blackWomenOwned,
    },
    create: {
      founderId: founder.id,
      blackOwnershipPct: eligibility.blackOwnershipPct,
      blackWomenOwnershipPct: eligibility.blackWomenOwnershipPct,
      annualTurnoverBand: eligibility.annualTurnoverBand,
      cipcNumber: eligibility.cipcNumber,
      entityType: eligibility.entityType,
      esdBeneficiaryEligible: derived.esdBeneficiaryEligible,
      beneficiaryClass: derived.beneficiaryClass,
      blackWomenOwned: derived.blackWomenOwned,
    },
  });
  await prisma.founderOutcome.create({
    data: {
      founderId: founder.id,
      capitalRaisedZar: outcome.capitalRaisedZar,
      capitalType: outcome.capitalType,
      monthlyRevenueZar: outcome.monthlyRevenueZar,
      headcount: outcome.headcount,
      stillOperating: outcome.stillOperating,
      graduatedToSupplier: outcome.graduatedToSupplier,
    },
  });

  redirect("/founder");
}
