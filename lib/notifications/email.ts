import "server-only";

/**
 * Transactional email seam. No provider is wired up in this build
 * stage — order confirmation is shown in-app only (/order-confirmation
 * and /track-order). Do not add copy anywhere that claims an email was
 * sent until this is implemented.
 *
 * To go live: install a provider SDK (e.g. Resend, Postmark), set
 * EMAIL_PROVIDER_API_KEY (see .env.local.example), and call
 * `sendOrderConfirmationEmail` from lib/checkout/actions.ts after an
 * order is created.
 */
export async function sendOrderConfirmationEmail(_orderNumber: string, _toEmail: string): Promise<void> {
  throw new Error("Email sending is not implemented yet — this is a future build stage.");
}

/**
 * Auth emails (verification, password reset) are on the real code path —
 * better-auth generates a genuine token and calls these on every
 * sign-up/reset request — but with no email provider wired up yet,
 * delivery itself is stubbed to a console log so the flow stays fully
 * testable end-to-end in dev. Do not let this silently no-op in
 * production: it must be replaced with a real provider call before go-live.
 */
export async function sendVerificationEmail(toEmail: string, url: string): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Email sending is not implemented yet — cannot send verification email in production.");
  }
  console.log(`[dev-only email stub] Verification link for ${toEmail}:\n${url}`);
}

export async function sendPasswordResetEmail(toEmail: string, url: string): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Email sending is not implemented yet — cannot send password reset email in production.");
  }
  console.log(`[dev-only email stub] Password reset link for ${toEmail}:\n${url}`);
}
