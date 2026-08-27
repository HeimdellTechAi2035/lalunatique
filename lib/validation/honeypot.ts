import { z } from "zod";

/**
 * A hidden field real users never see or fill in; most simple bots
 * fill in every field they find. If it's non-empty, silently treat the
 * submission as spam (return success without doing anything) rather
 * than telling the bot what tripped it.
 */
export const HONEYPOT_FIELD = "companyWebsite";

export const HoneypotSchema = z.object({
  [HONEYPOT_FIELD]: z.string().optional(),
});

export function isSpamSubmission(value: unknown): boolean {
  const parsed = HoneypotSchema.safeParse(value);
  return parsed.success && Boolean(parsed.data[HONEYPOT_FIELD]);
}
