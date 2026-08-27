"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart/context";
import { SITE_NAME } from "@/lib/utils/constants";
import { CheckoutSteps, type CheckoutStepId } from "./CheckoutSteps";
import { OrderSummarySidebar } from "./OrderSummarySidebar";
import { InformationStep } from "./InformationStep";
import { ShippingStep } from "./ShippingStep";
import { PaymentStep } from "./PaymentStep";
import { ReviewStep } from "./ReviewStep";
import type { ShippingMethodId } from "@/lib/shipping/methods";
import type { CheckoutAddressValues } from "@/lib/validation/checkout";
import { EmptyCart } from "@/components/cart/EmptyCart";

export function CheckoutFlow() {
  const { state } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = (searchParams.get("step") as CheckoutStepId | null) ?? "information";

  const [address, setAddress] = useState<CheckoutAddressValues | null>(null);
  const [shippingMethodId, setShippingMethodId] = useState<ShippingMethodId>("standard");
  const [promoCode, setPromoCode] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  function goTo(next: CheckoutStepId) {
    router.push(`/checkout?step=${next}`);
  }

  if (state.lines.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16">
        <EmptyCart />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/" className="relative block h-9 w-36">
          <Image src="/brand/la-lunatique-logo.jpg" alt={SITE_NAME} fill sizes="144px" className="object-contain object-left" />
        </Link>
        <CheckoutSteps current={step} />
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          {step === "information" ? (
            <InformationStep defaultValues={address ?? {}} onNext={(values) => { setAddress(values); goTo("shipping"); }} />
          ) : null}

          {step === "shipping" ? (
            <ShippingStep
              defaultShippingMethodId={shippingMethodId}
              defaultPromoCode={promoCode}
              onBack={() => goTo("information")}
              onNext={(values) => {
                setShippingMethodId(values.shippingMethodId);
                setPromoCode(values.promoCode);
                goTo("review");
              }}
            />
          ) : null}

          {step === "payment" && clientSecret ? (
            <PaymentStep clientSecret={clientSecret} onBack={() => goTo("review")} />
          ) : null}
          {step === "payment" && !clientSecret ? (
            <p className="text-sm text-muted">
              Please complete the{" "}
              <button type="button" className="underline" onClick={() => goTo("review")}>
                review step
              </button>{" "}
              first.
            </p>
          ) : null}

          {step === "review" && address ? (
            <ReviewStep
              address={address}
              shippingMethodId={shippingMethodId}
              promoCode={promoCode}
              onBack={() => goTo("shipping")}
              onReadyForPayment={(secret) => {
                setClientSecret(secret);
                goTo("payment");
              }}
            />
          ) : null}

          {step === "review" && !address ? (
            <p className="text-sm text-muted">
              Please complete the{" "}
              <button type="button" className="underline" onClick={() => goTo("information")}>
                information step
              </button>{" "}
              first.
            </p>
          ) : null}
        </div>

        <aside>
          <OrderSummarySidebar lines={state.lines} shippingMethodId={shippingMethodId} promoCode={promoCode} />
        </aside>
      </div>
    </div>
  );
}
