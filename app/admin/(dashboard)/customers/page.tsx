import type { Metadata } from "next";
import Link from "next/link";
import { getAllCustomersForAdmin } from "@/lib/admin/customers/queries";
import { formatDate, formatPrice } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Customers", robots: { index: false, follow: false } };

export default async function AdminCustomersPage() {
  const customers = await getAllCustomersForAdmin();

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">Customers</h1>
      <p className="mt-1 text-sm text-muted">
        Every customer who has completed checkout. Card details are never stored here — payment will be handled
        entirely by Stripe.
      </p>

      {customers.length === 0 ? (
        <p className="mt-8 text-sm text-muted">No customers yet — this fills in as real orders are placed.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-cream text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Total spent</th>
                <th className="px-4 py-3 font-medium">Marketing</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-ink">{c.name}</td>
                  <td className="px-4 py-3 text-muted">{c.email}</td>
                  <td className="px-4 py-3 text-muted">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-ink">{c.orderCount}</td>
                  <td className="px-4 py-3 text-ink">{formatPrice(c.totalSpentInPence)}</td>
                  <td className="px-4 py-3">
                    {c.marketingOptIn ? <Badge variant="success">Opted in</Badge> : <Badge variant="outline">Opted out</Badge>}
                  </td>
                  <td className="px-4 py-3 text-muted">{formatDate(c.createdAt.toISOString())}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/customers/${c.id}`} className="text-sm font-medium text-accent hover:underline">
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
