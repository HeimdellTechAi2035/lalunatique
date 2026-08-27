import { describe, it, expect, beforeEach, vi } from "vitest";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { getOrderByStripeSessionId } from "@/lib/orders/queries";
import { issueRefundAction } from "@/lib/admin/orders/actions";
import { resetDb, seedMinimalCatalog } from "./helpers/db";
import { createUserWithSession } from "./helpers/auth";

vi.mock("next/headers", () => ({ headers: vi.fn() }));

function mockSignedInAs(cookie: string) {
  vi.mocked(headers).mockResolvedValue(new Headers({ cookie }) as never);
}
function mockSignedOut() {
  vi.mocked(headers).mockResolvedValue(new Headers() as never);
}

async function makePaidOrder(stripeCheckoutSessionId: string, overrides: Partial<{ email: string }> = {}) {
  return prisma.order.create({
    data: {
      orderNumber: `LL-${Math.floor(100000 + Math.random() * 899999)}`,
      email: overrides.email ?? "guest-payment-auth@example.com",
      shippingName: "Guest Buyer",
      shippingLine1: "1 Test Street",
      shippingCity: "London",
      shippingPostcode: "E1 6AN",
      shippingCountry: "United Kingdom",
      status: "PROCESSING",
      paymentStatus: "PAID",
      subtotalInPence: 2000,
      shippingInPence: 0,
      totalInPence: 2000,
      stripeCheckoutSessionId,
      stripePaymentIntentId: `pi_${stripeCheckoutSessionId}`,
      amountPaidInPence: 2000,
      paidAt: new Date(),
    },
  });
}

describe("payment/order authorisation", () => {
  beforeEach(async () => {
    await resetDb();
    mockSignedOut();
  });

  it("a guest confirmation lookup by Stripe session id returns only the order for that exact session", async () => {
    await makePaidOrder("cs_test_session_A", { email: "victim@example.com" });
    await makePaidOrder("cs_test_session_B", { email: "attacker@example.com" });

    const order = await getOrderByStripeSessionId("cs_test_session_B");
    expect(order).toBeDefined();
    expect(order!.email).toBe("attacker@example.com");
    // Guessing/mutating the token to a different (even valid) session id
    // must never surface someone else's order.
    expect(order!.email).not.toBe("victim@example.com");
  });

  it("a made-up or unmatched session id exposes nothing", async () => {
    await makePaidOrder("cs_test_real_session");
    const order = await getOrderByStripeSessionId("cs_test_completely_made_up");
    expect(order).toBeUndefined();
  });

  it("a customer session cannot issue a refund — admin action rejects it independently of any page", async () => {
    const customer = await createUserWithSession({ role: "CUSTOMER" });
    mockSignedInAs(customer.cookie);

    const order = await makePaidOrder("cs_test_refund_target");
    await expect(issueRefundAction({ orderId: order.id })).rejects.toThrow(/not authorized/i);
  });

  it("an unauthenticated caller cannot issue a refund", async () => {
    const order = await makePaidOrder("cs_test_refund_target_2");
    await expect(issueRefundAction({ orderId: order.id })).rejects.toThrow(/not authorized/i);
  });
});
