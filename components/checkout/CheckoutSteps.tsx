import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type CheckoutStepId = "information" | "shipping" | "payment" | "review";

const steps: { id: CheckoutStepId; label: string }[] = [
  { id: "information", label: "Information" },
  { id: "shipping", label: "Shipping" },
  { id: "payment", label: "Payment" },
  { id: "review", label: "Review" },
];

export function CheckoutSteps({ current }: { current: CheckoutStepId }) {
  const currentIndex = steps.findIndex((s) => s.id === current);

  return (
    <ol className="flex items-center gap-2 text-xs sm:text-sm">
      {steps.map((step, i) => (
        <li key={step.id} className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold",
              i < currentIndex ? "bg-success text-on-dark" : i === currentIndex ? "bg-ink text-on-dark" : "bg-border text-muted",
            )}
          >
            {i < currentIndex ? <Check className="h-3.5 w-3.5" /> : i + 1}
          </span>
          <span className={cn(i === currentIndex ? "font-medium text-ink" : "text-muted")}>{step.label}</span>
          {i < steps.length - 1 ? <span className="mx-1 h-px w-6 bg-border" aria-hidden /> : null}
        </li>
      ))}
    </ol>
  );
}
