"use client";

import { useState } from "react";
import { SHIPPING_METHODS, type ShippingMethodId } from "@/lib/shipping/methods";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils/format";

export function ShippingStep({
  defaultShippingMethodId,
  defaultPromoCode,
  onBack,
  onNext,
}: {
  defaultShippingMethodId: ShippingMethodId;
  defaultPromoCode: string;
  onBack: () => void;
  onNext: (values: { shippingMethodId: ShippingMethodId; promoCode: string }) => void;
}) {
  const [shippingMethodId, setShippingMethodId] = useState<ShippingMethodId>(defaultShippingMethodId);
  const [promoCode, setPromoCode] = useState(defaultPromoCode);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-ink">Shipping method</h2>
        <RadioGroup
          value={shippingMethodId}
          onValueChange={(v) => setShippingMethodId(v as ShippingMethodId)}
          className="mt-3"
        >
          {SHIPPING_METHODS.map((method) => (
            <label
              key={method.id}
              htmlFor={`shipping-${method.id}`}
              className="flex cursor-pointer items-center justify-between rounded-md border border-border p-4 has-[:checked]:border-accent"
            >
              <span className="flex items-center gap-3">
                <RadioGroupItem id={`shipping-${method.id}`} value={method.id} />
                <span>
                  <span className="block text-sm font-medium text-ink">{method.label}</span>
                  <span className="block text-xs text-muted">{method.etaLabel}</span>
                </span>
              </span>
              <span className="text-sm text-ink">{formatPrice(method.basePriceInPence)}</span>
            </label>
          ))}
        </RadioGroup>
        <p className="mt-2 text-xs text-muted">Standard delivery is free over the free-delivery threshold — see basket total.</p>
      </div>

      <div>
        <Label htmlFor="promo-code">Discount code (optional)</Label>
        <Input
          id="promo-code"
          className="mt-1.5 max-w-xs"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          placeholder="e.g. GLOW10"
        />
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" size="lg" onClick={() => onNext({ shippingMethodId, promoCode })}>
          Continue to payment
        </Button>
      </div>
    </div>
  );
}
