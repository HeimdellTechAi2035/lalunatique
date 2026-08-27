"use client";

import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PaymentStep({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-ink">Payment</h2>
        <div className="mt-3 flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-cream p-10 text-center">
          <Lock className="h-6 w-6 text-muted" aria-hidden />
          <p className="text-sm font-medium text-ink">Stripe Elements renders here in production</p>
          <p className="max-w-sm text-xs text-muted">
            This build stage does not collect real card details. No live payment provider is connected yet — see
            lib/payments/provider.ts.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" size="lg" onClick={onNext}>
          Review order
        </Button>
      </div>
    </div>
  );
}
