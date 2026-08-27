import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { getOrderById } from "@/lib/orders/queries";
import { OrderDetail } from "@/components/account/OrderDetail";

export const metadata: Metadata = { title: "Order Details" };

export default async function AccountOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getCurrentSession();
  const order = session ? await getOrderById(id, session.user.id) : undefined;
  if (!order) notFound();

  return <OrderDetail order={order} />;
}
