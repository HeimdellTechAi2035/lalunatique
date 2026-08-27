import type { Order } from "@/lib/orders/types";
import { formatDate, formatPrice } from "@/lib/utils/format";
import { PlaceholderImage } from "@/components/shared/PlaceholderImage";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

const statusVariant = {
  processing: "warning",
  shipped: "accent",
  delivered: "success",
  cancelled: "outline",
} as const;

export function OrderDetail({ order }: { order: Order }) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink">Order {order.orderNumber}</h1>
          <p className="text-sm text-muted">Placed {formatDate(order.placedAtIso)}</p>
        </div>
        <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-ink">Tracking</h2>
        <p className="mt-1 text-sm text-muted">
          Tracking number: <span className="font-medium text-ink">{order.trackingNumber}</span>{" "}
          <span className="text-xs">(sample tracking, for demonstration only)</span>
        </p>
        <ol className="mt-4 space-y-3">
          {order.trackingEvents.map((event) => (
            <li key={event.label} className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />
              <span className="text-ink">{event.label}</span>
              <span className="text-muted">— {formatDate(event.dateIso)}</span>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-ink">Items</h2>
        <ul className="mt-3 divide-y divide-border">
          {order.lines.map((line) => (
            <li key={line.slug} className="flex items-center gap-4 py-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-cream">
                <PlaceholderImage image={line.image} sizes="64px" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">{line.name}</p>
                <p className="text-xs text-muted">Qty {line.qty}</p>
              </div>
              <p className="text-sm text-ink">{formatPrice(line.lineTotalInPence)}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold text-ink">Delivery address</h2>
          <address className="mt-2 text-sm not-italic text-muted">
            {order.shippingAddress.name}
            <br />
            {order.shippingAddress.line1}
            <br />
            {order.shippingAddress.line2 ? (
              <>
                {order.shippingAddress.line2}
                <br />
              </>
            ) : null}
            {order.shippingAddress.city}, {order.shippingAddress.postcode}
            <br />
            {order.shippingAddress.country}
          </address>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-ink">Order summary</h2>
          <dl className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>{formatPrice(order.subtotalInPence)}</dd>
            </div>
            {order.discountInPence > 0 ? (
              <div className="flex justify-between text-success">
                <dt>Discount</dt>
                <dd>-{formatPrice(order.discountInPence)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-muted">Delivery</dt>
              <dd>{order.shippingInPence === 0 ? "Free" : formatPrice(order.shippingInPence)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-1 font-semibold text-ink">
              <dt>Total</dt>
              <dd>{formatPrice(order.totalInPence)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
