import { describe, it, expect, beforeEach, vi } from "vitest";
import type Stripe from "stripe";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/webhooks/stripe/route";
import { prisma } from "@/lib/db/prisma";
import { createReservations } from "@/lib/products/inventory";
import { finalizeOrderForCheckoutSession, abandonCheckoutAttempt } from "@/lib/payments/finalize-order";
import { resetDb, seedMinimalCatalog } from "./helpers/db";
import { createUserWithSession } from "./helpers/auth";

const stripeMocks = vi.hoisted(() => ({ constructEvent: vi.fn() }));
vi.mock("@/lib/payments/stripe", () => ({
  requireStripe: () => ({ webhooks: stripeMocks }),
  requireWebhookSecret: () => "synthetic-test-secret",
}));

/**
 * These tests exercise the exact function the Stripe webhook route
 * calls (lib/payments/webhook is a thin wrapper: verify signature,
 * dedupe by event id, then call this). No real Stripe API call is
 * involved — a Checkout Session object is constructed directly, the
 * same shape Stripe would hand the webhook handler, so the DB-level
 * finalisation logic (the part this codebase actually owns) is fully
 * covered without needing live Stripe credentials.
 */
function fakeSession(checkoutAttemptId: string, overrides: Partial<Stripe.Checkout.Session> = {}): Stripe.Checkout.Session {
  return {
    id: `cs_test_${checkoutAttemptId}`,
    payment_intent: `pi_test_${checkoutAttemptId}`,
    amount_total: 2000,
    metadata: { checkoutAttemptId },
    payment_status: "paid",
    status: "complete",
    ...overrides,
  } as Stripe.Checkout.Session;
}

async function makeAttemptWithLine(variantId: string, overrides: Partial<{ userId: string | null; totalInPence: number }> = {}) {
  const attempt = await prisma.checkoutAttempt.create({
    data: {
      idempotencyKey: `key-${Math.random().toString(36).slice(2)}`,
      userId: overrides.userId ?? null,
      email: "finalize-test@example.com",
      shippingName: "Finalize Test",
      shippingLine1: "1 Test Street",
      shippingCity: "London",
      shippingPostcode: "E1 6AN",
      shippingCountry: "United Kingdom",
      shippingMethodId: "standard",
      subtotalInPence: 2000,
      discountInPence: 0,
      shippingInPence: 0,
      totalInPence: overrides.totalInPence ?? 2000,
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
  return attempt;
}

describe("order finalisation (webhook-driven)", () => {
  let variantId: string;

  beforeEach(async () => {
    await resetDb();
    const { activeProduct } = await seedMinimalCatalog();
    variantId = activeProduct.variants[0].id;
  });

  it("creates a real Order from the checkout attempt's snapshot once payment is confirmed", async () => {
    const attempt = await makeAttemptWithLine(variantId);
    await finalizeOrderForCheckoutSession(fakeSession(attempt.id));

    const order = await prisma.order.findUnique({ where: { checkoutAttemptId: attempt.id }, include: { items: true } });
    expect(order).toBeTruthy();
    expect(order!.paymentStatus).toBe("PAID");
    expect(order!.amountPaidInPence).toBe(2000);
    expect(order!.stripePaymentIntentId).toBe(`pi_test_${attempt.id}`);
    expect(order!.items[0].productName).toBe("Test Active Product");
  });

  it("consumes the reservation as part of finalisation — real stock is permanently deducted exactly once", async () => {
    const before = await prisma.variant.findUniqueOrThrow({ where: { id: variantId } });
    const attempt = await makeAttemptWithLine(variantId);
    await finalizeOrderForCheckoutSession(fakeSession(attempt.id));

    const after = await prisma.variant.findUniqueOrThrow({ where: { id: variantId } });
    expect(after.stockQuantity).toBe(before.stockQuantity - 1);
    expect(after.reservedStock).toBe(0);
  });

  it("a duplicate webhook delivery for the same session does not create a second order or deduct stock twice", async () => {
    const attempt = await makeAttemptWithLine(variantId);
    const session = fakeSession(attempt.id);

    await finalizeOrderForCheckoutSession(session);
    await finalizeOrderForCheckoutSession(session); // duplicate delivery
    await finalizeOrderForCheckoutSession(session); // and a third, for good measure

    const orders = await prisma.order.findMany({ where: { checkoutAttemptId: attempt.id } });
    expect(orders).toHaveLength(1);

    const variant = await prisma.variant.findUniqueOrThrow({ where: { id: variantId } });
    expect(variant.stockQuantity).toBe(4); // deducted exactly once, not three times
  });

  it("retries a webhook when fulfillment failed before the event could commit", async () => {
    const attempt = await makeAttemptWithLine(variantId);
    const eventId = "evt_test_retry";
    stripeMocks.constructEvent.mockReturnValue({
      id: eventId,
      type: "checkout.session.completed",
      data: { object: fakeSession(attempt.id) },
    });
    const deliver = () => POST(new NextRequest("http://localhost/api/webhooks/stripe", {
      method: "POST",
      headers: { "stripe-signature": "synthetic-test-signature" },
      body: "{}",
    }));

    await prisma.variant.update({ where: { id: variantId }, data: { stockQuantity: 0 } });
    await expect(deliver()).rejects.toThrow();
    expect(await prisma.processedWebhookEvent.findUnique({ where: { id: eventId } })).toBeNull();
    expect((await prisma.checkoutAttempt.findUniqueOrThrow({ where: { id: attempt.id } })).status).toBe("PENDING");

    await prisma.variant.update({ where: { id: variantId }, data: { stockQuantity: 5 } });
    const responses = await Promise.all([deliver(), deliver()]);
    const bodies = await Promise.all(responses.map((response) => response.json()));
    expect(bodies.filter((body) => body.duplicate)).toHaveLength(1);
    expect(await prisma.order.count({ where: { checkoutAttemptId: attempt.id } })).toBe(1);
    expect((await prisma.variant.findUniqueOrThrow({ where: { id: variantId } })).stockQuantity).toBe(4);
  });

  it("preserves userId linkage from the checkout attempt (not the order's contact email)", async () => {
    const account = await createUserWithSession();
    const attempt = await makeAttemptWithLine(variantId, { userId: account.userId });
    await finalizeOrderForCheckoutSession(fakeSession(attempt.id));
    const order = await prisma.order.findUnique({ where: { checkoutAttemptId: attempt.id } });
    expect(order!.userId).toBe(account.userId);
  });

  it("a session with no matching checkout attempt is ignored, not an error", async () => {
    await expect(finalizeOrderForCheckoutSession(fakeSession("does-not-exist"))).resolves.toBeUndefined();
    expect(await prisma.order.count()).toBe(0);
  });

  it("abandoning a checkout attempt releases its reservation and marks it terminal, exactly once", async () => {
    const attempt = await makeAttemptWithLine(variantId);
    const beforeVariant = await prisma.variant.findUniqueOrThrow({ where: { id: variantId } });
    expect(beforeVariant.reservedStock).toBe(1);

    await abandonCheckoutAttempt(attempt.id, "EXPIRED");
    const afterVariant = await prisma.variant.findUniqueOrThrow({ where: { id: variantId } });
    expect(afterVariant.reservedStock).toBe(0);

    const refreshed = await prisma.checkoutAttempt.findUniqueOrThrow({ where: { id: attempt.id } });
    expect(refreshed.status).toBe("EXPIRED");

    // A late webhook for an already-abandoned attempt must not error or double-release.
    await abandonCheckoutAttempt(attempt.id, "EXPIRED");
    expect((await prisma.variant.findUniqueOrThrow({ where: { id: variantId } })).reservedStock).toBe(0);
  });

  it("a payment that fails/expires never becomes a paid order", async () => {
    const attempt = await makeAttemptWithLine(variantId);
    await abandonCheckoutAttempt(attempt.id, "FAILED");
    const order = await prisma.order.findUnique({ where: { checkoutAttemptId: attempt.id } });
    expect(order).toBeNull();
  });
});
