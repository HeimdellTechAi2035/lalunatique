import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export function PriceDisplay({
  priceInPence,
  compareAtPriceInPence,
  size = "md",
  className,
}: {
  priceInPence: number;
  compareAtPriceInPence?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClass = { sm: "text-sm", md: "text-base", lg: "text-2xl" }[size];
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span className={cn("font-semibold text-ink", sizeClass)}>{formatPrice(priceInPence)}</span>
      {compareAtPriceInPence ? (
        <span className="text-sm text-muted line-through">{formatPrice(compareAtPriceInPence)}</span>
      ) : null}
    </span>
  );
}
