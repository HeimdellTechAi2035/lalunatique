import type { Metadata } from "next";
import Link from "next/link";
import { getAllOrdersForAdmin } from "@/lib/admin/orders/queries";
import { formatDate, formatPrice } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Orders", robots: { index: false, follow: false } };

const paymentVariant = {
  PENDING: "warning",
  PAID: "success",
  FAILED: "outline",
  REFUNDED: "accent",
} as const;

export default async function AdminOrdersPage() {
  const orders = await getAllOrdersForAdmin();

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">Orders</h1>
      <p className="mt-1 text-sm text-muted">
        Every order here has a confirmed Stripe payment — nothing pending, failed, or abandoned appears in this
        list, and none of it counts toward revenue until it does.
      </p>

      {orders.length === 0 ? (
        <p className="mt-8 text-sm text-muted">No orders yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-cream text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Placed</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-ink">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-muted">{order.user?.name ?? `${order.email} (guest)`}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(order.placedAt.toISOString())}</td>
                  <td className="px-4 py-3">
                    <Badge variant={paymentVariant[order.paymentStatus]}>{order.paymentStatus.toLowerCase()}</Badge>
                  </td>
                  <td className="px-4 py-3 text-ink">{formatPrice(order.totalInPence)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/orders/${order.id}`} className="text-sm font-medium text-accent hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
