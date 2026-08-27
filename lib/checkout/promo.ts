import "server-only";

/** SAMPLE promo codes for demonstration — not a real discount engine. */
const PROMO_CODES: Record<string, { kind: "percent" | "fixed"; value: number; label: string }> = {
  GLOW10: { kind: "percent", value: 10, label: "10% off" },
  WELCOME5: { kind: "fixed", value: 500, label: "£5 off" },
};

export function resolvePromoDiscountInPence(code: string | undefined, subtotalInPence: number): number {
  if (!code) return 0;
  const promo = PROMO_CODES[code.trim().toUpperCase()];
  if (!promo) return 0;

  const discount = promo.kind === "percent" ? Math.round((subtotalInPence * promo.value) / 100) : promo.value;
  return Math.min(discount, subtotalInPence);
}

export function isValidPromoCode(code: string): boolean {
  return Boolean(PROMO_CODES[code.trim().toUpperCase()]);
}
