import { PackageCheck, Truck, RotateCcw, Lock } from "lucide-react";
import { FREE_DELIVERY_THRESHOLD_PENCE } from "@/lib/utils/constants";
import { formatPrice } from "@/lib/utils/format";

/**
 * Only factual, currently-true operational claims belong here — no
 * cosmetic/dietary/ethical claims (vegan, cruelty-free, organic, etc.)
 * unless and until the client supplies and confirms them.
 */
const badges = [
  { icon: Lock, label: "Secure checkout" },
  { icon: Truck, label: `Free delivery over ${formatPrice(FREE_DELIVERY_THRESHOLD_PENCE)}` },
  { icon: RotateCcw, label: "30-day returns" },
  { icon: PackageCheck, label: "Tracked delivery" },
];

export function TrustBadges({ className }: { className?: string }) {
  return (
    <ul className={`grid grid-cols-2 gap-4 sm:grid-cols-4 ${className ?? ""}`}>
      {badges.map(({ icon: Icon, label }) => (
        <li key={label} className="flex flex-col items-center gap-2 text-center text-xs text-muted sm:flex-row sm:text-left">
          <Icon className="h-5 w-5 shrink-0 text-accent" aria-hidden />
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
}
