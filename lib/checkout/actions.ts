"use server";

import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import { calculateOrderTotals } from "./pricing";
import { CartLineInputSchema } from "./schema";
import { createReservations, InsufficientStockError } from "@/lib/products/inventory";
import { requireStripe } from "@/lib/payments/stripe";
import { abandonCheckoutAttempt } from "@/lib/payments/finalize-order";
import type { Prisma } from "@prisma/client";

const ShippingAddressSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "Town or city is required"),
  postcode: z.string().min(1, "Postcode is required"),
  country: z.literal("United Kingdom"),
});

const CreateCheckoutSessionInputSchema = z.object({
  // Generated once client-side when the customer reaches the payment
  // step and reused across retries of that same click — see
  // components/checkout/ReviewStep.tsx. This is what makes a
  // double-click or network retry return the existing attempt instead
  // of reserving stock / creating a Stripe session a second time.
  idempotencyKey: z.string().min(1),
  lines: z.array(CartLineInputSchema).min(1),
  shippingMethodId: z.enum(["standard", "express"]),
  promoCode: z.string().optional(),
  address: ShippingAddressSchema,
});

export type CreateCheckoutSessionResult =
  | { ok: true; clientSecret: string }
  | { ok: false; errors: string[]; basketChanged?: boolean };

// Stripe Checkout Sessions cannot expire in under 30 minutes — that
// floor is what sets the reservation hold time here too, rather than
// an arbitrarily chosen duration.
const RESERVATION_WINDOW_MS = 30 * 60 * 1000;

/**
 * Starts a real payment: recalculates the trusted total server-side,
 * refuses cleanly if the basket has changed since it was last reviewed
 * (never silently charges for less than the customer saw), reserves
 * stock, and creates a Stripe embedded Checkout Session. No Order is
 * created here and no stock is permanently deducted — both only happen
 * once Stripe's webhook confirms payment (lib/payments/webhook.ts).
 */
export async function createCheckoutSession(input: unknown): Promise<CreateCheckoutSessionResult> {
  const parsed = CreateCheckoutSessionInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map((i) => i.message) };
  }

  // Idempotent replay: the same key means the same button-press retried
  // (double-click, network retry) — reuse the live session instead of
  // reserving stock again.
  const existing = await prisma.checkoutAttempt.findUnique({
    where: { idempotencyKey: parsed.data.idempotencyKey },
  });
  if (existing) {
    if (existing.status === "PENDING" && existing.expiresAt > new Date() && existing.stripeCheckoutSessionId) {
      const stripe = requireStripe();
      const stripeSession = await stripe.checkout.sessions.retrieve(existing.stripeCheckoutSessionId);
      if (stripeSession.client_secret) {
        return { ok: true, clientSecret: stripeSession.client_secret };
      }
    }
    return {
      ok: false,
      errors: ["This checkout attempt is no longer active. Please review your basket and try again."],
    };
  }

  const totals = await calculateOrderTotals({
    lines: parsed.data.lines,
    shippingMethodId: parsed.data.shippingMethodId,
    promoCode: parsed.data.promoCode,
  });

  if (totals.lines.length === 0) {
    return { ok: false, errors: totals.errors.length > 0 ? totals.errors : ["Your basket is empty."], basketChanged: totals.errors.length > 0 };
  }
  if (totals.errors.length > 0) {
    return { ok: false, errors: totals.errors, basketChanged: true };
  }

  // Never silently pay for a different basket than the one reviewed: if
  // stock changed between review and payment such that any line's
  // resolved quantity doesn't exactly match what was requested, refuse
  // and require the customer to see the updated basket before paying.
  for (const requested of parsed.data.lines) {
    const resolved = totals.lines.find(
      (l) => l.slug === requested.slug && (requested.variantId ? l.variantId === requested.variantId : true),
    );
    if (!resolved || resolved.qty !== requested.qty) {
      return {
        ok: false,
        errors: ["Your basket has changed since you reviewed it — please check your basket before paying."],
        basketChanged: true,
      };
    }
  }

  const session = await getCurrentSession();
  const userId = session?.user.id ?? null;
  const email = parsed.data.address.email.toLowerCase();
  const expiresAt = new Date(Date.now() + RESERVATION_WINDOW_MS);

  let attemptId: string;
  try {
    attemptId = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const attempt = await tx.checkoutAttempt.create({
        data: {
          idempotencyKey: parsed.data.idempotencyKey,
          userId,
          email,
          shippingName: parsed.data.address.name,
          shippingLine1: parsed.data.address.line1,
          shippingLine2: parsed.data.address.line2,
          shippingCity: parsed.data.address.city,
          shippingPostcode: parsed.data.address.postcode,
          shippingCountry: parsed.data.address.country,
          shippingMethodId: parsed.data.shippingMethodId,
          promoCode: parsed.data.promoCode,
          subtotalInPence: totals.subtotalInPence,
          discountInPence: totals.discountInPence,
          shippingInPence: totals.shippingInPence,
          totalInPence: totals.totalInPence,
          status: "PENDING",
          expiresAt,
          lines: {
            create: totals.lines.map((l) => ({
              productSlug: l.slug,
              productName: l.productName,
              variantId: l.variantId as string,
              variantSku: l.variantSku,
              variantLabel: l.variantLabel,
              qty: l.qty,
              unitPriceInPence: l.unitPriceInPence,
              lineTotalInPence: l.lineTotalInPence,
            })),
          },
        },
      });

      await createReservations(
        tx,
        attempt.id,
        totals.lines.map((l) => ({ variantId: l.variantId as string, qty: l.qty })),
        expiresAt,
      );

      return attempt.id;
    });
  } catch (e) {
    if (e instanceof InsufficientStockError) {
      return {
        ok: false,
        errors: ["One or more items sold out while you were checking out. Please review your basket and try again."],
        basketChanged: true,
      };
    }
    throw e;
  }

  // The reservation already exists at this point (committed above) —
  // if anything from here fails, release it and mark the attempt FAILED
  // rather than leaving stock held against a session that was never
  // actually created. This is what makes "Stripe isn't configured" (or
  // any other Stripe-side error) fail cleanly instead of holding stock
  // for the full 30-minute reservation window for no reason.
  try {
    const stripe = requireStripe();

    const discounts =
      totals.discountInPence > 0
        ? [
            {
              coupon: (
                await stripe.coupons.create(
                  { amount_off: totals.discountInPence, currency: "gbp", duration: "once", name: totals.bundleSavingsLabels[0] ?? "Discount" },
                  { idempotencyKey: `${attemptId}-coupon` },
                )
              ).id,
            },
          ]
        : undefined;

    const stripeSession = await stripe.checkout.sessions.create(
      {
        ui_mode: "embedded_page",
        mode: "payment",
        customer_email: email,
        expires_at: Math.floor(expiresAt.getTime() / 1000),
        line_items: [
          ...totals.lines.map((l) => ({
            quantity: l.qty,
            price_data: {
              currency: "gbp",
              unit_amount: l.unitPriceInPence,
              product_data: { name: l.name },
            },
          })),
          ...(totals.shippingInPence > 0
            ? [
                {
                  quantity: 1,
                  price_data: {
                    currency: "gbp",
                    unit_amount: totals.shippingInPence,
                    product_data: { name: `Shipping — ${totals.shippingMethodLabel}` },
                  },
                },
              ]
            : []),
        ],
        discounts,
        metadata: { checkoutAttemptId: attemptId },
        payment_intent_data: { metadata: { checkoutAttemptId: attemptId } },
        return_url: `${process.env.BETTER_AUTH_URL}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      },
      { idempotencyKey: attemptId },
    );

    if (!stripeSession.client_secret) {
      throw new Error("Stripe did not return a client secret for the embedded checkout session.");
    }

    await prisma.checkoutAttempt.update({
      where: { id: attemptId },
      data: { stripeCheckoutSessionId: stripeSession.id },
    });

    return { ok: true, clientSecret: stripeSession.client_secret };
  } catch (e) {
    await abandonCheckoutAttempt(attemptId, "FAILED");
    if (process.env.NODE_ENV !== "production") throw e; // surface the real cause in dev
    return { ok: false, errors: ["We couldn't start payment right now. Please try again in a moment."] };
  }
}
