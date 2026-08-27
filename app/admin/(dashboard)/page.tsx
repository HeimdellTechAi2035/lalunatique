import type { Metadata } from "next";
import Link from "next/link";
import { getAdminDashboardStats } from "@/lib/admin/products/queries";
import { prisma } from "@/lib/db/prisma";
import { formatPrice } from "@/lib/utils/format";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Admin Dashboard", robots: { index: false, follow: false } };

export default async function AdminDashboardPage() {
  const [stats, orderCount, customerCount, orders] = await Promise.all([
    getAdminDashboardStats(),
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.findMany({ select: { totalInPence: true } }),
  ]);
  const totalRevenueInPence = orders.reduce((sum, o) => sum + o.totalInPence, 0);

  const tiles = [
    { label: "Orders", value: orderCount },
    { label: "Revenue", value: formatPrice(totalRevenueInPence) },
    { label: "Customers", value: customerCount },
    { label: "Total products", value: stats.totalProducts },
    { label: "Active (published)", value: stats.activeCount },
    { label: "Draft", value: stats.draftCount },
    { label: "Active but content unverified", value: stats.unverifiedContentCount, warn: stats.unverifiedContentCount > 0 },
    { label: "Low stock", value: stats.lowStockCount, warn: stats.lowStockCount > 0 },
    { label: "Sold out", value: stats.soldOutCount, warn: stats.soldOutCount > 0 },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">
        Real figures from actual orders and products — nothing here is sample data.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {tiles.map((tile) => (
          <Card key={tile.label} className="p-4">
            <p className="text-2xl font-semibold text-ink">{tile.value}</p>
            <p className={`mt-1 text-xs ${tile.warn ? "text-warning" : "text-muted"}`}>{tile.label}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex gap-4">
        <Link href="/admin/products" className="text-sm font-medium text-accent hover:underline">
          Manage products →
        </Link>
        <Link href="/admin/customers" className="text-sm font-medium text-accent hover:underline">
          View customers →
        </Link>
      </div>
    </div>
  );
}
