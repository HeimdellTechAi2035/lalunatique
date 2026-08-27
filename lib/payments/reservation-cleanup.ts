import "server-only";
import { prisma } from "@/lib/db/prisma";
import { releaseReservationsForAttempt } from "@/lib/products/inventory";

/**
 * Safety net for reservations whose owning checkout attempt never got a
 * terminal webhook — Stripe's checkout.session.expired event normally
 * releases these (see lib/payments/webhook.ts), but webhook delivery
 * isn't guaranteed to happen at all (endpoint misconfigured, Stripe
 * outage, event lost). Finds every PENDING attempt past its own
 * expiresAt and releases its reservations; safe to run as often as you
 * like since releaseReservationsForAttempt only touches ACTIVE rows.
 *
 * Nothing in this codebase calls this on a schedule — there is no cron
 * runtime here to wire one into. In production, run it periodically
 * (e.g. a Vercel Cron hitting a protected route that calls this, or a
 * system cron running `npx tsx --conditions=react-server
 * scripts/release-expired-reservations.ts`) every few minutes. Until
 * that's wired up, the checkout.session.expired webhook is the only
 * thing releasing expired holds.
 */
export async function releaseExpiredReservations(): Promise<{ releasedAttempts: number }> {
  const expired = await prisma.checkoutAttempt.findMany({
    where: { status: "PENDING", expiresAt: { lt: new Date() } },
    select: { id: true },
  });

  for (const attempt of expired) {
    await releaseReservationsForAttempt(attempt.id, "EXPIRED");
    await prisma.checkoutAttempt.update({ where: { id: attempt.id }, data: { status: "EXPIRED" } });
  }

  return { releasedAttempts: expired.length };
}
