import type { Metadata } from "next";
import { getCurrentSession } from "@/lib/auth/session";
import { getOrdersForUser } from "@/lib/orders/queries";
import { OrderHistoryTable } from "@/components/account/OrderHistoryTable";
import { SectionHeading } from "@/components/shared/SectionHeading";

export const metadata: Metadata = { title: "My Orders" };

export default async function AccountOrdersPage() {
  const session = await getCurrentSession();
  const orders = session ? await getOrdersForUser(session.user.id) : [];

  return (
    <div>
      <SectionHeading title="Orders" align="left" />
      <div className="mt-6">
        <OrderHistoryTable orders={orders} />
      </div>
    </div>
  );
}
