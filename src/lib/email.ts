import { Resend } from "resend";

// Notifications are a nice-to-have layer on top of the core flows (scoring,
// stage gating) — never let a missing key or a delivery failure break a
// founder's submission or a funder's dashboard.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL ?? "Founda21 <notifications@founda21.com>";

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<void> {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set — skipping "${subject}" to ${to}`);
    return;
  }
  try {
    const { error } = await resend.emails.send({ from: FROM_ADDRESS, to, subject, html });
    if (error) console.error(`[email] Resend rejected "${subject}" to ${to}:`, error);
  } catch (error) {
    console.error(`[email] Failed to send "${subject}" to ${to}:`, error);
  }
}
