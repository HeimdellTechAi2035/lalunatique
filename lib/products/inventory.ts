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

/** Reserve stock for an in-progress checkout (does not touch stockQuantity, only the reserved counter). */
export async function reserveStock(variantId: string, qty: number): Promise<DbVariant> {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Same atomic-increment-then-verify pattern as deductStockForOrderLines,
    // and for the same reason — reading availableStock first and only
    // then incrementing reservedStock is racy under concurrent reservations.
    const variant = await tx.variant.update({
      where: { id: variantId },
      data: { reservedStock: { increment: qty } },
    });

    if (variant.reservedStock > variant.stockQuantity) {
      throw new InsufficientStockError(variantId);
    }

    return variant;
  });
}

/** Release a reservation without committing it (e.g. checkout abandoned/expired). */
export async function releaseReservedStock(variantId: string, qty: number): Promise<DbVariant> {
  return prisma.variant.update({ where: { id: variantId }, data: { reservedStock: { decrement: qty } } });
}

/** Commit a reservation into a permanent deduction (e.g. payment confirmed). */
export async function commitReservedStock(variantId: string, qty: number): Promise<DbVariant> {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const reserved = await tx.variant.update({ where: { id: variantId }, data: { reservedStock: { decrement: qty } } });
    if (reserved.reservedStock < 0) {
      throw new InsufficientStockError(variantId);
    }

    const variant = await tx.variant.update({ where: { id: variantId }, data: { stockQuantity: { decrement: qty } } });
    if (variant.stockQuantity < 0) {
      throw new InsufficientStockError(variantId);
    }

    await tx.stockMovement.create({
      data: { variantId, delta: -qty, reason: "ORDER_COMMITTED" },
    });
    return variant;
  });
}
