import { FREE_DELIVERY_THRESHOLD_PENCE } from "@/lib/utils/constants";
import { formatPrice } from "@/lib/utils/format";

export function AnnouncementBar() {
  return (
    <div className="bg-ink py-2 text-center text-xs font-medium tracking-wide text-on-dark">
      Free UK delivery on orders over {formatPrice(FREE_DELIVERY_THRESHOLD_PENCE)} · The tan revolution has begun
    </div>
  );
}
