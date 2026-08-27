"use server";

import { z } from "zod";
import { getOrderByNumber } from "./queries";
import type { Order } from "./types";

const TrackOrderInputSchema = z.object({
  orderNumber: z.string().min(1, "Please enter your order number"),
  postcode: z.string().min(1, "Please enter your postcode"),
});

export type TrackOrderResult = { ok: true; order: Order } | { ok: false; error: string };

export async function trackOrder(input: unknown): Promise<TrackOrderResult> {
  const parsed = TrackOrderInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  const order = await getOrderByNumber(parsed.data.orderNumber);
  const postcodeMatches =
    order && order.shippingAddress.postcode.replace(/\s/g, "").toLowerCase() ===
      parsed.data.postcode.replace(/\s/g, "").toLowerCase();

  if (!order || !postcodeMatches) {
    return { ok: false, error: "We couldn't find an order matching those details." };
  }

  return { ok: true, order };
}
