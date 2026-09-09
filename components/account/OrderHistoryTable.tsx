import Link from "next/link";
import type { Order } from "@/lib/orders/types";
import { formatDate, formatPrice } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  processing: "warning",
  shipped: "accent",
  delivered: "success",
  cancelled: "outline",
} as const;

export function OrderHistoryTable({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return <p className="text-sm text-muted">You haven&apos;t placed any orders yet.</p>;
  }

  return (
    <div className="divide-y divide-border">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/account/orders/${order.id}`}
          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-4 hover:bg-cream"
        >
          <div>
            <p className="font-medium text-ink">{order.orderNumber}</p>
            <p className="text-sm text-muted">{formatDate(order.placedAtIso)}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
            <span className="text-sm font-medium text-ink">{formatPrice(order.totalInPence)}</span>
            <span className="text-sm font-medium text-accent">View</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
