"use server";

import { z } from "zod";
import { calculateOrderTotals } from "./pricing";
import { CartLineInputSchema } from "./schema";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import { deductStockForOrderLines, InsufficientStockError } from "@/lib/products/inventory";

const ShippingAddressSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "Town or city is required"),
  postcode: z.string().min(1, "Postcode is required"),
  country: z.literal("United Kingdom"),
});

const SubmitCheckoutInputSchema = z.object({
  lines: z.array(CartLineInputSchema).min(1),
  shippingMethodId: z.enum(["standard", "express"]),
  promoCode: z.string().optional(),
  address: ShippingAddressSchema,
});

export type SubmitCheckoutResult =
  | { ok: true; orderNumber: string }
  | { ok: false; errors: string[] };

function generateOrderNumber(): string {
  const n = Math.floor(100000 + Math.random() * 899999);
  return `LL-${n}`;
}

function generateTrackingNumber(): string {
  const n = Math.floor(10000000 + Math.random() * 89999999);
  return `TRK-GB-${n}`;
}

/**
 * Re-runs calculateOrderTotals server-side one final time immediately
 * before creating the order, so even a client that skipped every
 * earlier pricing call still cannot smuggle a stale/tampered total
 * through checkout. Every real order — items, exact prices paid,
 * customer contact and shipping details — is written to the database
 * here. Card details are never collected or stored anywhere in this
 * flow; payment will be handled entirely by Stripe in a later stage.
 */
export async function submitCheckout(input: unknown): Promise<SubmitCheckoutResult> {
  const parsed = SubmitCheckoutInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map((i) => i.message) };
  }

  const totals = await calculateOrderTotals({
    lines: parsed.data.lines,
    shippingMethodId: parsed.data.shippingMethodId,
    promoCode: parsed.data.promoCode,
  });

  if (totals.lines.length === 0) {
    return { ok: false, errors: ["Your basket is empty."] };
  }
  if (totals.errors.length > 0) {
    return { ok: false, errors: totals.errors };
  }
  if (totals.lines.some((l) => !l.variantId)) {
    return { ok: false, errors: ["One or more basket items could not be matched to a purchasable option."] };
  }

  const orderNumber = generateOrderNumber();
  const email = parsed.data.address.email.toLowerCase();
  const nowIso = new Date();

  // A logged-in customer's order is linked to their account directly by
  // session — never by matching the email they typed at checkout, which
  // could be any address. A guest checkout (no session) stays unlinked
  // (userId: null); linking a guest's past orders into an account later
  // requires that account's email to be independently verified first
  // (see lib/account/link-orders.ts) — never trust an unverified email
  // claim for that.
  const session = await getCurrentSession();
  const userId = session?.user.id ?? null;

  // Stock deduction and the order itself are committed in one
  // transaction — if any part fails (e.g. a race takes the last unit of
  // stock), nothing is left half-applied: no phantom stock loss with no
  // order to show for it, no order with unaccounted stock.
  try {
    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await deductStockForOrderLines(
        tx,
        totals.lines.map((l) => ({ variantId: l.variantId as string, qty: l.qty })),
        `Order ${orderNumber}`,
      );

      return tx.order.create({
        data: {
          orderNumber,
          userId,
          email,
          shippingName: parsed.data.address.name,
          shippingLine1: parsed.data.address.line1,
          shippingLine2: parsed.data.address.line2,
          shippingCity: parsed.data.address.city,
          shippingPostcode: parsed.data.address.postcode,
          shippingCountry: parsed.data.address.country,
          status: "PROCESSING",
          paymentStatus: "PENDING",
          subtotalInPence: totals.subtotalInPence,
          discountInPence: totals.discountInPence,
          shippingInPence: totals.shippingInPence,
          totalInPence: totals.totalInPence,
          trackingNumber: generateTrackingNumber(),
          placedAt: nowIso,
          items: {
            create: totals.lines.map((l) => ({
              productSlug: l.slug,
              productName: l.productName,
              variantSku: l.variantSku,
              variantLabel: l.variantLabel,
              qty: l.qty,
              unitPriceInPence: l.unitPriceInPence,
              lineTotalInPence: l.lineTotalInPence,
            })),
          },
          trackingEvents: {
            create: [{ status: "PROCESSING", label: "Order confirmed", at: nowIso }],
          },
        },
      });
    });

    return { ok: true, orderNumber: order.orderNumber };
  } catch (e) {
    if (e instanceof InsufficientStockError) {
      return { ok: false, errors: ["One or more items sold out while you were checking out. Please review your basket and try again."] };
    }
    throw e;
  }
}
