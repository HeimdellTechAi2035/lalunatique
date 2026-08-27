import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentSession } from "@/lib/auth/session";
import { getOrdersForUser } from "@/lib/orders/queries";
import { OrderHistoryTable } from "@/components/account/OrderHistoryTable";
import { SectionHeading } from "@/components/shared/SectionHeading";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountDashboardPage() {
  const session = await getCurrentSession();
  const orders = session ? await getOrdersForUser(session.user.id) : [];

  return (
    <div>
      <SectionHeading eyebrow="My Account" title={`Welcome back, ${session?.user.name ?? "there"}`} align="left" />

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Recent orders</h2>
          <Link href="/account/orders" className="text-sm text-accent hover:underline">
            View all
          </Link>
        </div>
        <OrderHistoryTable orders={orders.slice(0, 3)} />
      </div>
    </div>
  );
}
