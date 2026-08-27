import { EXPRESS_DELIVERY_PENCE, STANDARD_DELIVERY_PENCE } from "@/lib/utils/constants";

/** Client-safe: shipping method display data has no sensitive pricing logic. */
export type ShippingMethodId = "standard" | "express";

export type ShippingMethod = {
  id: ShippingMethodId;
  label: string;
  etaLabel: string;
  basePriceInPence: number;
};

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "standard",
    label: "Standard Delivery",
    etaLabel: "2–3 working days",
    basePriceInPence: STANDARD_DELIVERY_PENCE,
  },
  {
    id: "express",
    label: "Express Delivery",
    etaLabel: "Next working day",
    basePriceInPence: EXPRESS_DELIVERY_PENCE,
  },
];
