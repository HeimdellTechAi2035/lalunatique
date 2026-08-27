import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCustomerForAdmin } from "@/lib/admin/customers/queries";
import { formatDate, formatPrice } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Customer", robots: { index: false, follow: false } };

const statusVariant = {
  PROCESSING: "warning",
  SHIPPED: "accent",
  DELIVERED: "success",
  CANCELLED: "outline",
} as const;

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomerForAdmin(id);
  if (!customer) notFound();

  const totalSpentInPence = customer.orders.reduce((sum, o) => sum + o.totalInPence, 0);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/customers" className="text-xs text-muted hover:underline">
          ← All customers
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-ink">{customer.name}</h1>
        <p className="text-sm text-muted">{customer.email}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border p-4">
          <p className="text-2xl font-semibold text-ink">{customer.orders.length}</p>
          <p className="mt-1 text-xs text-muted">Orders</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-2xl font-semibold text-ink">{formatPrice(totalSpentInPence)}</p>
          <p className="mt-1 text-xs text-muted">Total spent</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-medium text-ink">{customer.phone ?? "Not provided"}</p>
          <p className="mt-1 text-xs text-muted">Phone</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-medium text-ink">{customer.marketingOptIn ? "Opted in" : "Opted out"}</p>
          <p className="mt-1 text-xs text-muted">Marketing</p>
        </div>
      </div>

      {customer.addresses.length > 0 ? (
        <div>
          <h2 className="text-sm font-semibold text-ink">Addresses</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {customer.addresses.map((a) => (
              <address key={a.id} className="rounded-md border border-border p-3 text-sm not-italic text-muted">
                {a.name}
                <br />
                {a.line1}
                {a.line2 ? (
                  <>
                    <br />
                    {a.line2}
                  </>
                ) : null}
                <br />
                {a.city}, {a.postcode}
                <br />
                {a.country}
              </address>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <h2 className="text-sm font-semibold text-ink">Order history</h2>
        {customer.orders.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No orders yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {customer.orders.map((order) => (
              <div key={order.id} className="rounded-md border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-ink">{order.orderNumber}</p>
                    <p className="text-xs text-muted">{formatDate(order.placedAt.toISOString())}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant[order.status]}>{order.status.toLowerCase()}</Badge>
                    <span className="text-sm font-medium text-ink">{formatPrice(order.totalInPence)}</span>
                    <Link href={`/admin/orders/${order.id}`} className="text-xs font-medium text-accent hover:underline">
                      View payment →
                    </Link>
                  </div>
                </div>
                <ul className="mt-3 space-y-1 border-t border-border pt-3 text-sm text-muted">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      {item.qty}× {item.productName}
                      {item.variantLabel ? ` — ${item.variantLabel}` : ""} ({formatPrice(item.lineTotalInPence)})
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-muted">
                  Shipping to: {order.shippingName}, {order.shippingLine1}, {order.shippingCity} {order.shippingPostcode}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
