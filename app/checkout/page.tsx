import { Suspense } from "react";
import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutFlow />
    </Suspense>
  );
}
