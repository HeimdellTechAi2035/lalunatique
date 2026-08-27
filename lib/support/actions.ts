"use server";

import { ContactFormSchema } from "@/lib/validation/contact";
import { isSpamSubmission } from "@/lib/validation/honeypot";

/**
 * In-memory only — a placeholder for a real support inbox/helpdesk
 * integration. Genuinely validates and records the submission; does
 * not send a real email since no provider is connected yet (see
 * lib/notifications/email.ts).
 */
type StoredMessage = { id: string; receivedAtIso: string } & Record<string, unknown>;
const messages: StoredMessage[] = [];

export type ContactResult = { ok: true } | { ok: false; error: string };

export async function submitContactMessage(input: unknown): Promise<ContactResult> {
  if (isSpamSubmission(input)) return { ok: true };

  const parsed = ContactFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }
  messages.push({ id: `msg_${Date.now()}`, receivedAtIso: new Date().toISOString(), ...parsed.data });
  return { ok: true };
}
