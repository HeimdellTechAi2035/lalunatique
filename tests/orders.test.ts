import { describe, it, expect, beforeEach, vi } from "vitest";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { submitCheckout } from "@/lib/checkout/actions";
import { getOrderById } from "@/lib/orders/queries";
import { resetDb, seedMinimalCatalog } from "./helpers/db";
import { createUserWithSession } from "./helpers/auth";

vi.mock("next/headers", () => ({ headers: vi.fn() }));

function mockSignedOut() {
  vi.mocked(headers).mockResolvedValue(new Headers() as never);
}
function mockSignedInAs(cookie: string) {
  vi.mocked(headers).mockResolvedValue(new Headers({ cookie }) as never);
}

describe("orders", () => {
  beforeEach(async () => {
    await resetDb();
    mockSignedOut();
  });

  it("writes a server-computed total to the database that matches the trusted price × qty — nothing client-supplied", async () => {
    const { activeProduct } = await seedMinimalCatalog();

    const result = await submitCheckout({
      lines: [{ slug: activeProduct.slug, qty: 2 }],
      shippingMethodId: "standard",
      address: {
        name: "Order Test",
        email: "order-test@example.com",
        line1: "1 Test Street",
        city: "London",
        postcode: "E1 6AN",
        country: "United Kingdom",
      },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const order = await prisma.order.findUniqueOrThrow({ where: { orderNumber: result.orderNumber }, include: { items: true } });
    expect(order.items[0].unitPriceInPence).toBe(2000);
    expect(order.subtotalInPence).toBe(4000);
    expect(order.totalInPence).toBe(order.subtotalInPence - order.discountInPence + order.shippingInPence);
  });

  it("preserves the product name/price snapshot on the order even after the product is later renamed and repriced", async () => {
    const { activeProduct } = await seedMinimalCatalog();

    const result = await submitCheckout({
      lines: [{ slug: activeProduct.slug, qty: 1 }],
      shippingMethodId: "standard",
      address: {
        name: "Snapshot Test",
        email: "snapshot-test@example.com",
        line1: "1 Test Street",
        city: "London",
        postcode: "E1 6AN",
        country: "United Kingdom",
      },
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    await prisma.product.update({
      where: { id: activeProduct.id },
      data: { name: "Renamed Product", priceInPence: 9999 },
    });

    const order = await prisma.order.findUniqueOrThrow({ where: { orderNumber: result.orderNumber }, include: { items: true } });
    expect(order.items[0].productName).toBe("Test Active Product");
    expect(order.items[0].unitPriceInPence).toBe(2000);
  });

  it("a guest checkout is never linked to any account (userId stays null)", async () => {
    const { activeProduct } = await seedMinimalCatalog();

    const result = await submitCheckout({
      lines: [{ slug: activeProduct.slug, qty: 1 }],
      shippingMethodId: "standard",
      address: {
        name: "Guest Test",
        email: "guest-order-test@example.com",
        line1: "1 Test Street",
        city: "London",
        postcode: "E1 6AN",
        country: "United Kingdom",
      },
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const order = await prisma.order.findUniqueOrThrow({ where: { orderNumber: result.orderNumber } });
    expect(order.userId).toBeNull();
  });

  it("a checkout made while signed in is linked by session userId, not by the email typed into the form", async () => {
    const { activeProduct } = await seedMinimalCatalog();
    const account = await createUserWithSession();
    mockSignedInAs(account.cookie);

    const result = await submitCheckout({
      lines: [{ slug: activeProduct.slug, qty: 1 }],
      shippingMethodId: "standard",
      address: {
        // Deliberately a different email than the account's own — proves
        // linkage comes from the session, not from matching this field.
        name: "Session Linked",
        email: "someone-else-entirely@example.com",
        line1: "1 Test Street",
        city: "London",
        postcode: "E1 6AN",
        country: "United Kingdom",
      },
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const order = await prisma.order.findUniqueOrThrow({ where: { orderNumber: result.orderNumber } });
    expect(order.userId).toBe(account.userId);
  });

  it("an order cannot be fetched by id without the matching account — no ID-guessing exposure", async () => {
    const { activeProduct } = await seedMinimalCatalog();
    const owner = await createUserWithSession();
    const stranger = await createUserWithSession();
    mockSignedInAs(owner.cookie);

    const result = await submitCheckout({
      lines: [{ slug: activeProduct.slug, qty: 1 }],
      shippingMethodId: "standard",
      address: {
        name: "Owner",
        email: "owner-order-test@example.com",
        line1: "1 Test Street",
        city: "London",
        postcode: "E1 6AN",
        country: "United Kingdom",
      },
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const order = await prisma.order.findUniqueOrThrow({ where: { orderNumber: result.orderNumber } });

    expect(await getOrderById(order.id, owner.userId)).toBeDefined();
    expect(await getOrderById(order.id, stranger.userId)).toBeUndefined();
  });
});
