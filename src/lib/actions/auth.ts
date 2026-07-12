"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { FunderType } from "@/generated/prisma/enums";
import { checkRateLimit } from "@/lib/rate-limit";

// Brute-force protection — checked per-account (the actual target of a
// credential-stuffing attempt) and per-IP (catches one source hammering many
// different email guesses). Counts every attempt, not just failures, so it
// can't be bypassed by interleaving successful logins.
const LOGIN_RATE_LIMIT_PER_ACCOUNT = 10;
const LOGIN_RATE_LIMIT_PER_IP = 20;
const LOGIN_RATE_WINDOW_MS = 15 * 60 * 1000;

async function getClientIp(): Promise<string | null> {
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headersList.get("x-real-ip");
}

// Server actions don't have access to the incoming request's URL, so the
// redirect target for Supabase auth emails (password reset) is built from
// the Host header instead — works locally and once deployed without a
// separate "site URL" env var to keep in sync.
async function siteOrigin(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  return `${protocol}://${host}`;
}

const VALID_FUNDER_TYPES = new Set(Object.values(FunderType));

export async function signUpInstitution(formData: FormData) {
  const institutionName = String(formData.get("institutionName") ?? "").trim();
  const funderTypeRaw = String(formData.get("funderType") ?? "");
  const contactName = String(formData.get("contactName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!institutionName || !email || !password) {
    redirect(`/signup?error=${encodeURIComponent("All fields are required.")}`);
  }
  if (!VALID_FUNDER_TYPES.has(funderTypeRaw as FunderType)) {
    redirect(`/signup?error=${encodeURIComponent("Select a funder type.")}`);
  }
  const funderType = funderTypeRaw as FunderType;

  // Created via the admin API with email_confirm: true so no confirmation
  // email is sent — Supabase's free-tier email rate limit (a handful per
  // hour) otherwise blocks signup entirely under any real testing volume.
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    redirect(`/signup?error=${encodeURIComponent(error?.message ?? "Sign up failed.")}`);
  }

  const existing = await prisma.institution.findUnique({
    where: { adminUserId: data.user.id },
  });
  if (!existing) {
    await prisma.institution.create({
      data: {
        name: institutionName,
        funderType,
        contactName: contactName || null,
        contactEmail: email,
        adminUserId: data.user.id,
      },
    });
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    redirect(`/login?message=${encodeURIComponent("Account created — log in to continue.")}`);
  }

  redirect("/dashboard");
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const accountRate = await checkRateLimit(
    `login:${email.toLowerCase()}`,
    LOGIN_RATE_LIMIT_PER_ACCOUNT,
    LOGIN_RATE_WINDOW_MS,
  );
  if (!accountRate.ok) {
    redirect(
      `/login?error=${encodeURIComponent(
        `Too many login attempts for this account. Try again after ${accountRate.retryAfter.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}.`,
      )}`,
    );
  }

  const ip = await getClientIp();
  if (ip) {
    const ipRate = await checkRateLimit(`login-ip:${ip}`, LOGIN_RATE_LIMIT_PER_IP, LOGIN_RATE_WINDOW_MS);
    if (!ipRate.ok) {
      redirect(
        `/login?error=${encodeURIComponent(
          `Too many login attempts from this network. Try again after ${ipRate.retryAfter.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}.`,
        )}`,
      );
    }
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?error=${encodeURIComponent("Login failed.")}`);

  const institution = await prisma.institution.findUnique({
    where: { adminUserId: user.id },
  });
  if (institution) redirect("/dashboard");

  const founder = await prisma.founder.findUnique({ where: { userId: user.id } });
  if (founder) redirect("/founder");

  redirect(`/login?error=${encodeURIComponent("No account found for this login.")}`);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// Always redirects with the same success message regardless of whether the
// email is registered — avoids leaking which emails have accounts.
export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const successRedirect = `/forgot-password?message=${encodeURIComponent(
    "If an account exists for that email, a reset link is on its way.",
  )}`;

  if (!email) redirect(successRedirect);

  const origin = await siteOrigin();
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
  });

  redirect(successRedirect);
}

// Reached after /auth/callback exchanges the recovery link's code for a
// session — that session is what authorizes the password change here, not
// a separate token in this form.
export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) {
    redirect(`/reset-password?error=${encodeURIComponent("Password must be at least 8 characters.")}`);
  }
  if (password !== confirmPassword) {
    redirect(`/reset-password?error=${encodeURIComponent("Passwords do not match.")}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?error=${encodeURIComponent("That reset link has expired. Please request a new one.")}`);
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  const institution = await prisma.institution.findUnique({ where: { adminUserId: user.id } });
  if (institution) redirect("/dashboard");

  const founder = await prisma.founder.findUnique({ where: { userId: user.id } });
  if (founder) redirect("/founder");

  redirect(`/login?message=${encodeURIComponent("Password updated — log in to continue.")}`);
}
