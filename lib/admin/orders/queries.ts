import "server-only";
import { prisma } from "@/lib/db/prisma";

export async function getAllOrdersForAdmin() {
  return prisma.order.findMany({
    include: { items: true, user: { select: { name: true } } },
    orderBy: { placedAt: "desc" },
  });
}

export async function getOrderForAdmin(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true, trackingEvents: true, user: { select: { name: true, email: true } } },
  });
}

/**
 * Revenue rule: every Order row only ever exists once Stripe has
 * confirmed payment (see lib/payments/finalize-order.ts) — there is no
 * PENDING/FAILED/EXPIRED/CANCELLED Order state to accidentally count,
 * so summing every row's paid amount is already correct by
 * construction. Refunds are netted out explicitly rather than assumed
 * away — a fully or partially refunded order contributes only what's
 * actually still kept.
 */
export function calculateTotalRevenueInPence(
  orders: { amountPaidInPence: number | null; amountRefundedInPence: number; totalInPence: number }[],
): number {
  return orders.reduce((sum, o) => sum + (o.amountPaidInPence ?? o.totalInPence) - o.amountRefundedInPence, 0);
}
