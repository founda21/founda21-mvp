"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { renderBrandedEmail } from "@/lib/email-template";

// Hardcoded per the same explicit-instruction precedent as
// actions/auth.ts's FOUNDA21_OPS_EMAIL — one recipient for now.
const FOUNDA21_OPS_EMAIL = "foundarsa@gmail.com";

const REQUEST_RATE_LIMIT = 5;
const REQUEST_RATE_WINDOW_MS = 60 * 60 * 1000;

async function getClientIp(): Promise<string | null> {
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headersList.get("x-real-ip");
}

// The pre-account marketing conversion action (§ positioning brief §4.5 —
// deliberately NOT a purchase flow and NOT an account signup: no password,
// no Institution row, no Supabase user). It only sends a notification email
// to the platform admin, who follows up manually — the actual account gets
// created later, through the existing signUpInstitution flow (§ actions/
// auth.ts), once terms are agreed. Nothing here touches Prisma or auth.
export async function requestAssessment(formData: FormData) {
  const institutionName = String(formData.get("institutionName") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const ventureCount = String(formData.get("ventureCount") ?? "").trim();
  const intakeTiming = String(formData.get("intakeTiming") ?? "").trim();
  const redirectTo = String(formData.get("redirectTo") ?? "/");

  if (!institutionName || !contactName || !email) {
    redirect(`${redirectTo}?error=${encodeURIComponent("Institution name, contact name, and email are required.")}#request-assessment`);
  }

  const ip = await getClientIp();
  if (ip) {
    const rateLimit = await checkRateLimit(`request-assessment:${ip}`, REQUEST_RATE_LIMIT, REQUEST_RATE_WINDOW_MS);
    if (!rateLimit.ok) {
      redirect(
        `${redirectTo}?error=${encodeURIComponent(
          `Too many requests from this network. Try again after ${rateLimit.retryAfter.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}.`,
        )}#request-assessment`,
      );
    }
  }

  const html = renderBrandedEmail(`
    <p>New assessment request:</p>
    <ul>
      <li><strong>Institution:</strong> ${institutionName}</li>
      <li><strong>Contact:</strong> ${contactName}${role ? ` (${role})` : ""}</li>
      <li><strong>Email:</strong> ${email}</li>
      <li><strong>Approximate number of ventures:</strong> ${ventureCount || "not given"}</li>
      <li><strong>Intake timing:</strong> ${intakeTiming || "not given"}</li>
    </ul>
  `);

  await sendEmail({
    to: FOUNDA21_OPS_EMAIL,
    subject: `Assessment request: ${institutionName}`,
    html,
  });

  redirect(
    `${redirectTo}?message=${encodeURIComponent("Request received — we'll be in touch within two business days.")}#request-assessment`,
  );
}
