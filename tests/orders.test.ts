import { describe, it, expect, beforeEach } from "vitest";
import type Stripe from "stripe";
import { prisma } from "@/lib/db/prisma";
import { createReservations } from "@/lib/products/inventory";
import { finalizeOrderForCheckoutSession } from "@/lib/payments/finalize-order";
import { getOrderById } from "@/lib/orders/queries";
import { resetDb, seedMinimalCatalog } from "./helpers/db";
import { createUserWithSession } from "./helpers/auth";

/**
 * Orders only ever come into existence via the real webhook-driven
 * finalisation path now (see lib/payments/finalize-order.ts) — these
 * tests set up a checkout attempt + reservation exactly as
 * lib/checkout/actions.ts would (minus the actual Stripe API call,
 * which needs live credentials) and finalise it the same way the
 * webhook does, then check the resulting Order.
 */
async function payForAttempt(variantId: string, userId: string | null, email: string) {
  const attempt = await prisma.checkoutAttempt.create({
    data: {
      idempotencyKey: `key-${Math.random().toString(36).slice(2)}`,
      userId,
      email,
      shippingName: "Order Snapshot Test",
      shippingLine1: "1 Test Street",
      shippingCity: "London",
      shippingPostcode: "E1 6AN",
      shippingCountry: "United Kingdom",
      shippingMethodId: "standard",
      subtotalInPence: 2000,
      discountInPence: 0,
      shippingInPence: 0,
      totalInPence: 2000,
      status: "PENDING",
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      lines: {
        create: [
          {
            productSlug: "test-active-product",
            productName: "Test Active Product",
            variantId,
            variantSku: "TEST-ACTIVE-1",
            qty: 1,
            unitPriceInPence: 2000,
            lineTotalInPence: 2000,
          },
        ],
      },
    },
  });
  await prisma.$transaction((tx) => createReservations(tx, attempt.id, [{ variantId, qty: 1 }], attempt.expiresAt));

  const session = {
    id: `cs_test_${attempt.id}`,
    payment_intent: `pi_test_${attempt.id}`,
    amount_total: 2000,
    metadata: { checkoutAttemptId: attempt.id },
    payment_status: "paid",
    status: "complete",
  } as unknown as Stripe.Checkout.Session;

  await finalizeOrderForCheckoutSession(session);
  return prisma.order.findUniqueOrThrow({ where: { checkoutAttemptId: attempt.id } });
}

describe("orders", () => {
  let variantId: string;

  beforeEach(async () => {
    await resetDb();
    const { activeProduct } = await seedMinimalCatalog();
    variantId = activeProduct.variants[0].id;
  });

  it("preserves the product name/price snapshot on the order even after the product is later renamed and repriced", async () => {
    const order = await payForAttempt(variantId, null, "snapshot-test@example.com");

    await prisma.product.update({ where: { slug: "test-active-product" }, data: { name: "Renamed Product", priceInPence: 9999 } });

    const items = await prisma.orderItem.findMany({ where: { orderId: order.id } });
    expect(items[0].productName).toBe("Test Active Product");
    expect(items[0].unitPriceInPence).toBe(2000);
  });

  it("a guest checkout order stays unlinked (userId null)", async () => {
    const order = await payForAttempt(variantId, null, "guest-order-test@example.com");
    expect(order.userId).toBeNull();
  });

  it("a checkout made while signed in is linked by session userId, not by the email typed into the form", async () => {
    const account = await createUserWithSession();
    const order = await payForAttempt(variantId, account.userId, "someone-else-entirely@example.com");
    expect(order.userId).toBe(account.userId);
  });

  it("an order cannot be fetched by id without the matching account — no ID-guessing exposure", async () => {
    const owner = await createUserWithSession();
    const stranger = await createUserWithSession();
    const order = await payForAttempt(variantId, owner.userId, "owner-order-test@example.com");

    expect(await getOrderById(order.id, owner.userId)).toBeDefined();
    expect(await getOrderById(order.id, stranger.userId)).toBeUndefined();
  });
});
