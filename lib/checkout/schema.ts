import { z } from "zod";

/**
 * Deliberately price-free: the client can only ever tell the server
 * WHAT it wants and HOW MANY, never what it costs. Every price in the
 * response is resolved server-side from the trusted product data layer.
 */
export const CartLineInputSchema = z.object({
  slug: z.string().min(1),
  variantId: z.string().optional(),
  qty: z.number().int().min(1).max(20),
});

export const CalculateTotalsInputSchema = z.object({
  lines: z.array(CartLineInputSchema).min(1).max(50),
  shippingMethodId: z.enum(["standard", "express"]),
  promoCode: z.string().optional(),
});

export type CartLineInput = z.infer<typeof CartLineInputSchema>;
export type CalculateTotalsInput = z.infer<typeof CalculateTotalsInputSchema>;
