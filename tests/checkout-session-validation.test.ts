import { describe, it, expect, beforeEach, vi } from "vitest";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { createCheckoutSession } from "@/lib/checkout/actions";
import { resetDb, seedMinimalCatalog } from "./helpers/db";

vi.mock("next/headers", () => ({ headers: vi.fn() }));

/**
 * These cover every rejection path that returns before this codebase
 * would need to call the real Stripe API — safe qty auditing (STAGE 7),
 * dead-idempotency-key handling, and empty/invalid baskets. The
 * successful path (reservation created, real Stripe Checkout Session
 * returned) needs a configured STRIPE_SECRET_KEY and is exercised
 * manually against Stripe test mode instead — see the final report,
 * STAGE 16, "blocked by Stripe configuration".
 */
const validAddress = {
  name: "Checkout Validation",
  email: "checkout-validation@example.com",
  line1: "1 Test Street",
  city: "London",
  postcode: "E1 6AN",
  country: "United Kingdom" as const,
};

describe("createCheckoutSession — validation and rejection paths", () => {
  beforeEach(async () => {
    await resetDb();
    vi.mocked(headers).mockResolvedValue(new Headers() as never);
  });

  it("rejects an empty basket without creating a checkout attempt", async () => {
    const result = await createCheckoutSession({
      idempotencyKey: crypto.randomUUID(),
      lines: [],
      shippingMethodId: "standard",
      address: validAddress,
    });
    expect(result.ok).toBe(false);
    expect(await prisma.checkoutAttempt.count()).toBe(0);
  });

  it("never silently pays for less than requested — over-quantity is rejected cleanly, not clamped-and-charged", async () => {
    const { activeProduct } = await seedMinimalCatalog();
    await prisma.variant.update({ where: { id: activeProduct.variants[0].id }, data: { stockQuantity: 2 } });

    const result = await createCheckoutSession({
      idempotencyKey: crypto.randomUUID(),
      lines: [{ slug: activeProduct.slug, qty: 5 }], // only 2 in stock
      shippingMethodId: "standard",
      address: validAddress,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.basketChanged).toBe(true);
    // Critically: no reservation was created for a quantity the customer never confirmed.
    expect(await prisma.inventoryReservation.count()).toBe(0);
    expect(await prisma.checkoutAttempt.count()).toBe(0);
  });

  it("rejects checkout for a sold-out variant without creating a reservation", async () => {
    const { activeProduct } = await seedMinimalCatalog();
    await prisma.variant.update({ where: { id: activeProduct.variants[0].id }, data: { stockQuantity: 0 } });

    const result = await createCheckoutSession({
      idempotencyKey: crypto.randomUUID(),
      lines: [{ slug: activeProduct.slug, qty: 1 }],
      shippingMethodId: "standard",
      address: validAddress,
    });

    expect(result.ok).toBe(false);
    expect(await prisma.inventoryReservation.count()).toBe(0);
  });

  it("rejects checkout for a DRAFT product without creating a reservation", async () => {
    const { draftProduct } = await seedMinimalCatalog();

    const result = await createCheckoutSession({
      idempotencyKey: crypto.randomUUID(),
      lines: [{ slug: draftProduct.slug, qty: 1 }],
      shippingMethodId: "standard",
      address: validAddress,
    });

    expect(result.ok).toBe(false);
    expect(await prisma.checkoutAttempt.count()).toBe(0);
  });

  it("reusing the idempotency key of a dead (expired/failed) attempt is rejected rather than silently starting a new one", async () => {
    const { activeProduct } = await seedMinimalCatalog();
    const key = crypto.randomUUID();

    await prisma.checkoutAttempt.create({
      data: {
        idempotencyKey: key,
        email: validAddress.email,
        shippingName: validAddress.name,
        shippingLine1: validAddress.line1,
        shippingCity: validAddress.city,
        shippingPostcode: validAddress.postcode,
        shippingCountry: validAddress.country,
        shippingMethodId: "standard",
        subtotalInPence: 2000,
        discountInPence: 0,
        shippingInPence: 0,
        totalInPence: 2000,
        status: "EXPIRED",
        expiresAt: new Date(Date.now() - 1000),
      },
    });

    const result = await createCheckoutSession({
      idempotencyKey: key,
      lines: [{ slug: activeProduct.slug, qty: 1 }],
      shippingMethodId: "standard",
      address: validAddress,
    });

    expect(result.ok).toBe(false);
    // Still exactly one attempt for this key — no second one was created either.
    expect(await prisma.checkoutAttempt.count({ where: { idempotencyKey: key } })).toBe(1);
  });
});
