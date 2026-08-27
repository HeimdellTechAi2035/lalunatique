import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { resetDb } from "./helpers/db";

/**
 * Stripe guarantees at-least-once webhook delivery — the same event id
 * can legitimately arrive more than once. app/api/webhooks/stripe
 * relies on ProcessedWebhookEvent.id (the Stripe event id) being the
 * primary key to reject a second delivery before any order/inventory
 * mutation runs; this tests that constraint directly rather than
 * standing up the whole HTTP route (which would need a real Stripe
 * signature to reach this code at all).
 */
describe("webhook event deduplication", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("a second insert of the same Stripe event id is rejected by the database", async () => {
    await prisma.processedWebhookEvent.create({ data: { id: "evt_test_123", type: "checkout.session.completed" } });

    await expect(
      prisma.processedWebhookEvent.create({ data: { id: "evt_test_123", type: "checkout.session.completed" } }),
    ).rejects.toMatchObject({ code: "P2002" });

    expect(await prisma.processedWebhookEvent.count()).toBe(1);
  });

  it("different event ids are both accepted", async () => {
    await prisma.processedWebhookEvent.create({ data: { id: "evt_a", type: "checkout.session.completed" } });
    await prisma.processedWebhookEvent.create({ data: { id: "evt_b", type: "checkout.session.expired" } });
    expect(await prisma.processedWebhookEvent.count()).toBe(2);
  });
});
