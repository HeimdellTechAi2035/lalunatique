"use server";

import { NewsletterFormSchema } from "@/lib/validation/newsletter";
import { isSpamSubmission } from "@/lib/validation/honeypot";

/**
 * In-memory only — a placeholder for a real email marketing platform
 * (Klaviyo, Mailchimp, etc.). Genuinely validates and records the
 * submission; does not send any real marketing email since no
 * provider is connected yet.
 */
const subscribers = new Set<string>();

export type NewsletterResult = { ok: true } | { ok: false; error: string };

export async function subscribeToNewsletter(input: unknown): Promise<NewsletterResult> {
  if (isSpamSubmission(input)) return { ok: true };

  const parsed = NewsletterFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }
  subscribers.add(parsed.data.email.toLowerCase());
  return { ok: true };
}
