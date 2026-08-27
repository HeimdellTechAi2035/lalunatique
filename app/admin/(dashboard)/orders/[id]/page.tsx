import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderForAdmin } from "@/lib/admin/orders/queries";
import { formatDate, formatPrice } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { RefundPanel } from "@/components/admin/RefundPanel";

export const metadata: Metadata = { title: "Order", robots: { index: false, follow: false } };

const statusVariant = {
  PROCESSING: "warning",
  SHIPPED: "accent",
  DELIVERED: "success",
  CANCELLED: "outline",
} as const;

const paymentVariant = {
  PENDING: "warning",
  PAID: "success",
  FAILED: "outline",
  REFUNDED: "accent",
} as const;

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderForAdmin(id);
  if (!order) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/orders" className="text-xs text-muted hover:underline">
          ← All orders
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold text-ink">{order.orderNumber}</h1>
          <Badge variant={statusVariant[order.status]}>{order.status.toLowerCase()}</Badge>
          <Badge variant={paymentVariant[order.paymentStatus]}>{order.paymentStatus.toLowerCase()}</Badge>
        </div>
        <p className="text-sm text-muted">{order.user ? `${order.user.name} (${order.user.email})` : `${order.email} (guest)`}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-4">
          <p className="text-lg font-semibold text-ink">{formatPrice(order.amountPaidInPence ?? order.totalInPence)}</p>
          <p className="mt-1 text-xs text-muted">Amount paid</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-lg font-semibold text-ink">{formatPrice(order.amountRefundedInPence)}</p>
          <p className="mt-1 text-xs text-muted">Amount refunded</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-medium text-ink">{order.paidAt ? formatDate(order.paidAt.toISOString()) : "—"}</p>
          <p className="mt-1 text-xs text-muted">Paid at</p>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-ink">Stripe reference</h2>
        <dl className="mt-2 space-y-1 text-sm">
          <div className="flex gap-2">
            <dt className="text-muted">Checkout session:</dt>
            <dd className="font-mono text-xs text-ink">{order.stripeCheckoutSessionId ?? "—"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted">Payment intent:</dt>
            <dd className="font-mono text-xs text-ink">{order.stripePaymentIntentId ?? "—"}</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs text-muted">No card details are ever stored — Stripe handles and retains those.</p>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-ink">Refund</h2>
        <div className="mt-2">
          <RefundPanel
            orderId={order.id}
            totalInPence={order.totalInPence}
            amountRefundedInPence={order.amountRefundedInPence}
            hasStripePayment={Boolean(order.stripePaymentIntentId)}
          />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-ink">Items</h2>
        <ul className="mt-3 divide-y divide-border">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="text-ink">
                  {item.qty}× {item.productName}
                  {item.variantLabel ? ` — ${item.variantLabel}` : ""}
                </p>
                <p className="text-xs text-muted">{item.variantSku ?? "—"}</p>
              </div>
              <p className="text-ink">{formatPrice(item.lineTotalInPence)}</p>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-ink">Delivery address</h2>
        <address className="mt-2 text-sm not-italic text-muted">
          {order.shippingName}
          <br />
          {order.shippingLine1}
          {order.shippingLine2 ? (
            <>
              <br />
              {order.shippingLine2}
            </>
          ) : null}
          <br />
          {order.shippingCity}, {order.shippingPostcode}
          <br />
          {order.shippingCountry}
        </address>
      </div>
    </div>
  );
}
