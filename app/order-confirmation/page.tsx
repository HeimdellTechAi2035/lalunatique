import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { getOrderByNumber } from "@/lib/orders/queries";
import { OrderDetail } from "@/components/account/OrderDetail";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/utils/constants";

export const metadata: Metadata = { title: "Order Confirmed" };

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;
  const order = orderNumber ? await getOrderByNumber(orderNumber) : undefined;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/" className="relative mx-auto block h-9 w-36">
        <Image src="/brand/la-lunatique-logo.jpg" alt={SITE_NAME} fill sizes="144px" className="object-contain" />
      </Link>

      <div className="mt-10 flex flex-col items-center gap-3 text-center">
        <CheckCircle2 className="h-10 w-10 text-success" aria-hidden />
        <h1 className="text-2xl font-semibold text-ink">Thank you — your order is confirmed</h1>
        {order ? (
          <p className="text-sm text-muted">
            Order <strong>{order.orderNumber}</strong> has been placed. A confirmation would normally be emailed to
            you here — email sending isn&apos;t connected in this build yet.
          </p>
        ) : (
          <p className="text-sm text-muted">We couldn&apos;t find that order, but if you just checked out, it went through.</p>
        )}
      </div>

      {order ? (
        <div className="mt-10">
          <OrderDetail order={order} />
        </div>
      ) : null}

      <div className="mt-10 flex justify-center gap-3">
        <Button asChild>
          <Link href="/shop">Continue shopping</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/account/orders">View my orders</Link>
        </Button>
      </div>
    </div>
  );
}
