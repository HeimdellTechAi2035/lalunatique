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
    <div className="overflow-x-auto">
      <table className="w-full min-w-[500px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-muted">
            <th className="py-3 font-medium">Order</th>
            <th className="py-3 font-medium">Date</th>
            <th className="py-3 font-medium">Status</th>
            <th className="py-3 font-medium">Total</th>
            <th className="py-3" />
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-border">
              <td className="py-4 font-medium text-ink">{order.orderNumber}</td>
              <td className="py-4 text-muted">{formatDate(order.placedAtIso)}</td>
              <td className="py-4">
                <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
              </td>
              <td className="py-4 text-ink">{formatPrice(order.totalInPence)}</td>
              <td className="py-4 text-right">
                <Link href={`/account/orders/${order.id}`} className="text-sm font-medium text-accent hover:underline">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
