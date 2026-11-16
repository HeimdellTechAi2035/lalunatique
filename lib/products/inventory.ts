import "server-only";
import type { Prisma, Variant as DbVariant, StockMovementReason } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

type SaleFields = Pick<DbVariant, "priceOverrideInPence" | "salePriceInPence" | "saleStartsAt" | "saleEndsAt">;

/**
 * A sale price only applies within its scheduled window, if one is
 * set. No window on either end means "always on" once a sale price is
 * set — scheduling is optional, not required.
 */
export function isSaleActive(variant: Pick<DbVariant, "saleStartsAt" | "saleEndsAt">, now: Date = new Date()): boolean {
  if (variant.saleStartsAt && now < variant.saleStartsAt) return false;
  if (variant.saleEndsAt && now > variant.saleEndsAt) return false;
  return true;
}

/**
 * Effective price resolution order: an *active* sale price wins if
 * set, otherwise the price override, otherwise the parent product's
 * base price. This is the single place that order is decided.
 */
export function resolveVariantPrice(productPriceInPence: number | null, variant: SaleFields): number | null {
  if (variant.salePriceInPence != null && isSaleActive(variant)) return variant.salePriceInPence;
  if (variant.priceOverrideInPence != null) return variant.priceOverrideInPence;
  return productPriceInPence;
}

export function resolveVariantCompareAt(
  productPriceInPence: number | null,
  productCompareAtInPence: number | null,
  variant: SaleFields,
): number | null {
  if (variant.salePriceInPence != null && isSaleActive(variant)) {
    // On sale: compare-at is whatever the price would otherwise have been.
    return variant.priceOverrideInPence ?? productPriceInPence;
  }
  return productCompareAtInPence;
}

/** Stock actually available to sell — never below zero, never counts reserved units twice. */
export function availableStock(variant: Pick<DbVariant, "stockQuantity" | "reservedStock">): number {
  return Math.max(0, variant.stockQuantity - variant.reservedStock);
}

export function isVariantLowStock(variant: Pick<DbVariant, "stockQuantity" | "reservedStock" | "lowStockThreshold">): boolean {
  const available = availableStock(variant);
  return available > 0 && available <= variant.lowStockThreshold;
}

export function isVariantSoldOut(variant: Pick<DbVariant, "stockQuantity" | "reservedStock">): boolean {
  return availableStock(variant) <= 0;
}

/**
 * The only sanctioned way to change stock. Always writes an audit-trail
 * StockMovement row in the same transaction as the mutation — never
 * update Variant.stockQuantity directly anywhere else.
 */
export async function adjustStock(
  variantId: string,
  delta: number,
  reason: StockMovementReason,
  note?: string,
): Promise<DbVariant> {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const variant = await tx.variant.update({
      where: { id: variantId },
      data: { stockQuantity: { increment: delta } },
    });

    if (variant.stockQuantity < 0) {
      throw new Error(`Stock adjustment would take variant ${variantId} negative`);
    }

    await tx.stockMovement.create({
      data: { variantId, delta, reason, note },
    });

    return variant;
  });
}

export class InsufficientStockError extends Error {
  constructor(public variantId: string) {
    super(`Insufficient stock for variant ${variantId}`);
  }
}

/**
 * Deducts stock for every line of a confirmed order, using whichever
 * transaction client is passed in. Callers that also need to create
 * the order row itself MUST pass their own transaction here (see
 * lib/checkout/actions.ts) so stock and the order are committed or
 * rolled back together — never call this in its own transaction and
 * then create the order afterwards as a separate step, or a failure in
 * between leaves stock deducted with no order to show for it.
 */
export async function deductStockForOrderLines(
  tx: Prisma.TransactionClient,
  lines: { variantId: string; qty: number }[],
  note: string,
): Promise<void> {
  for (const line of lines) {
    // Decrement first (a single atomic UPDATE at the SQL level), THEN
    // check the resulting value — not the other way round. Reading the
    // current stock, checking it, and only then issuing a separate
    // decrement is a classic time-of-check-to-time-of-use race: two
    // concurrent checkouts can both read the same "1 in stock", both
    // pass the check, and both decrement, taking stock negative. Doing
    // the decrement first and inspecting what it actually produced
    // closes that window — the database serialises the two UPDATEs,
    // so whichever one runs second sees the already-reduced value.
    const variant = await tx.variant.update({
      where: { id: line.variantId },
      data: { stockQuantity: { decrement: line.qty } },
    });

    if (variant.stockQuantity < 0) {
      throw new InsufficientStockError(line.variantId);
    }

    await tx.stockMovement.create({
      data: { variantId: line.variantId, delta: -line.qty, reason: "ORDER_COMMITTED", note },
    });
  }
}

/** Standalone version of deductStockForOrderLines for callers that have no order row to create alongside it. */
export async function commitOrderStock(lines: { variantId: string; qty: number }[], note: string): Promise<void> {
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await deductStockForOrderLines(tx, lines, note);
  });
}

/**
 * Creates one InventoryReservation row per line and atomically holds
 * that stock — increments Variant.reservedStock and verifies it doesn't
 * exceed real stockQuantity, all within the caller's transaction, so
 * either every line in a checkout attempt reserves or none do. Because
 * this is the same atomic-update-then-verify pattern used everywhere
 * else in this file, two concurrent checkouts racing for the last unit
 * serialise on the row lock exactly like a real stock deduction would —
 * whichever commits second sees the already-incremented reservedStock
 * and fails cleanly instead of both succeeding.
 */
export async function createReservations(
  tx: Prisma.TransactionClient,
  checkoutAttemptId: string,
  lines: { variantId: string; qty: number }[],
  expiresAt: Date,
): Promise<void> {
  for (const line of lines) {
    const variant = await tx.variant.update({
      where: { id: line.variantId },
      data: { reservedStock: { increment: line.qty } },
    });

    if (variant.reservedStock > variant.stockQuantity) {
      throw new InsufficientStockError(line.variantId);
    }

    await tx.inventoryReservation.create({
      data: { checkoutAttemptId, variantId: line.variantId, qty: line.qty, expiresAt, status: "ACTIVE" },
    });
  }
}

/**
 * Releases every currently-ACTIVE reservation belonging to a checkout
 * attempt back to available stock (payment failed/expired/was
 * cancelled). Idempotent by construction — only ACTIVE rows are
 * touched, so calling this again for an attempt that's already been
 * released (or whose reservations were already consumed by a
 * successful payment) does nothing on the second call.
 */
export async function releaseReservationsForAttempt(
  checkoutAttemptId: string,
  toStatus: "RELEASED" | "EXPIRED" = "RELEASED",
  transaction?: Prisma.TransactionClient,
): Promise<void> {
  const release = async (tx: Prisma.TransactionClient) => {
    const active = await tx.inventoryReservation.findMany({
      where: { checkoutAttemptId, status: "ACTIVE" },
    });
    for (const reservation of active) {
      const claim = await tx.inventoryReservation.updateMany({
        where: { id: reservation.id, status: "ACTIVE" },
        data: { status: toStatus },
      });
      if (claim.count === 0) continue;
      await tx.variant.update({
        where: { id: reservation.variantId },
        data: { reservedStock: { decrement: reservation.qty } },
      });
    }
  };

  if (transaction) return release(transaction);
  await prisma.$transaction(release);
}

/**
 * Converts every ACTIVE reservation for a checkout attempt into a
 * permanent stock deduction — releases the hold on reservedStock and
 * decrements real stockQuantity in the same transaction as order
 * finalisation (see lib/payments/webhook.ts), writing the usual
 * ORDER_COMMITTED audit trail. Only ACTIVE rows are selected, so this
 * is safe to call from a webhook handler that might receive the same
 * "payment succeeded" event more than once — the second call finds
 * nothing ACTIVE left to consume and does nothing.
 */
export async function consumeReservationsForAttempt(
  tx: Prisma.TransactionClient,
  checkoutAttemptId: string,
  note: string,
): Promise<void> {
  const active = await tx.inventoryReservation.findMany({
    where: { checkoutAttemptId, status: "ACTIVE" },
  });
  for (const reservation of active) {
    const variant = await tx.variant.update({
      where: { id: reservation.variantId },
      data: {
        reservedStock: { decrement: reservation.qty },
        stockQuantity: { decrement: reservation.qty },
      },
    });
    if (variant.stockQuantity < 0) {
      throw new InsufficientStockError(reservation.variantId);
    }
    await tx.stockMovement.create({
      data: { variantId: reservation.variantId, delta: -reservation.qty, reason: "ORDER_COMMITTED", note },
    });
    await tx.inventoryReservation.update({ where: { id: reservation.id }, data: { status: "CONSUMED" } });
  }
}
