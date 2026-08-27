/**
 * Cart line items store ONLY a product/variant reference and quantity —
 * never a price. There is nothing price-shaped here for a client to
 * tamper with; the authoritative total is always recomputed server-side
 * from lib/checkout/pricing.ts against the trusted product data layer.
 */
export type CartLine = {
  slug: string;
  variantId?: string;
  qty: number;
};

export type CartState = {
  lines: CartLine[];
};

export type CartAction =
  | { type: "ADD_ITEM"; slug: string; variantId?: string; qty: number }
  | { type: "REMOVE_ITEM"; slug: string; variantId?: string }
  | { type: "SET_QTY"; slug: string; variantId?: string; qty: number }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; state: CartState };
