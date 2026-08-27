import "server-only";
import { FREE_DELIVERY_THRESHOLD_PENCE } from "@/lib/utils/constants";
import { SHIPPING_METHODS, type ShippingMethodId } from "./methods";

export { SHIPPING_METHODS };
export type { ShippingMethodId };

/**
 * Standard delivery becomes free once the subtotal clears the threshold.
 * Express delivery remains a paid upgrade regardless of order size.
 */
export function calculateShippingInPence(subtotalInPence: number, methodId: ShippingMethodId): number {
  const method = SHIPPING_METHODS.find((m) => m.id === methodId);
  if (!method) throw new Error(`Unknown shipping method: ${methodId}`);

  if (method.id === "standard" && subtotalInPence >= FREE_DELIVERY_THRESHOLD_PENCE) {
    return 0;
  }

  return method.basePriceInPence;
}
