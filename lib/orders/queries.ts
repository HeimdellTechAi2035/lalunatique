import "server-only";
import type { Order as DbOrder, OrderItem, OrderTrackingEvent } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getProductBySlug } from "@/lib/products/queries";
import type { Order, OrderLine, TrackingEvent } from "./types";

type DbOrderWithRelations = DbOrder & { items: OrderItem[]; trackingEvents: OrderTrackingEvent[] };

async function toOrderLine(item: OrderItem): Promise<OrderLine> {
  const product = await getProductBySlug(item.productSlug);
  return {
    slug: item.productSlug,
    name: item.variantLabel ? `${item.productName} — ${item.variantLabel}` : item.productName,
    qty: item.qty,
    unitPriceInPence: item.unitPriceInPence,
    lineTotalInPence: item.lineTotalInPence,
    image: product?.primaryImage ?? { src: "", alt: item.productName, isPlaceholder: true },
  };
}

function toTrackingEvent(event: OrderTrackingEvent): TrackingEvent {
  return {
    status: event.status.toLowerCase() as TrackingEvent["status"],
    label: event.label,
    dateIso: event.at.toISOString(),
  };
}

async function toOrder(dbOrder: DbOrderWithRelations): Promise<Order> {
  const lines = await Promise.all(dbOrder.items.map(toOrderLine));
  return {
    id: dbOrder.id,
    orderNumber: dbOrder.orderNumber,
    email: dbOrder.email,
    placedAtIso: dbOrder.placedAt.toISOString(),
    status: dbOrder.status.toLowerCase() as Order["status"],
    lines,
    subtotalInPence: dbOrder.subtotalInPence,
    discountInPence: dbOrder.discountInPence,
    shippingInPence: dbOrder.shippingInPence,
    totalInPence: dbOrder.totalInPence,
    shippingAddress: {
      name: dbOrder.shippingName,
      line1: dbOrder.shippingLine1,
      line2: dbOrder.shippingLine2 ?? undefined,
      city: dbOrder.shippingCity,
      postcode: dbOrder.shippingPostcode,
      country: dbOrder.shippingCountry,
    },
    trackingNumber: dbOrder.trackingNumber,
    trackingEvents: dbOrder.trackingEvents
      .sort((a, b) => a.at.getTime() - b.at.getTime())
      .map(toTrackingEvent),
  };
}

const include = { items: true, trackingEvents: true };

// Ownership is by userId, not by matching email — an order only appears
// in an account once it's actually linked to that account (at checkout
// while signed in, or via the verified-email linking flow in
// lib/account/link-orders.ts), never merely because the emails match.
export async function getOrdersForUser(userId: string): Promise<Order[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    include,
    orderBy: { placedAt: "desc" },
  });
  return Promise.all(orders.map(toOrder));
}

export async function getOrderById(id: string, userId: string): Promise<Order | undefined> {
  const order = await prisma.order.findFirst({ where: { id, userId }, include });
  return order ? toOrder(order) : undefined;
}

// Used only by the post-payment confirmation page, keyed on Stripe's
// own Checkout Session id — a long, unguessable, Stripe-generated
// token, not the short human-readable orderNumber. Never add a
// fallback lookup path here by orderNumber/order id alone; that would
// reopen exactly the "guess another customer's order" hole this
// replaced (see app/order-confirmation/page.tsx).
export async function getOrderByStripeSessionId(stripeCheckoutSessionId: string): Promise<Order | undefined> {
  const order = await prisma.order.findUnique({ where: { stripeCheckoutSessionId }, include });
  return order ? toOrder(order) : undefined;
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
  // Order numbers are always generated upper-case (see lib/checkout/actions.ts);
  // normalising here avoids relying on a case-insensitive query mode that
  // isn't available on every database connector.
  const order = await prisma.order.findFirst({
    where: { orderNumber: orderNumber.trim().toUpperCase() },
    include,
  });
  return order ? toOrder(order) : undefined;
}
