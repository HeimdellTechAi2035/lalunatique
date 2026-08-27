import type { CartAction, CartLine, CartState } from "./types";

function sameLine(a: CartLine, slug: string, variantId?: string) {
  return a.slug === slug && a.variantId === variantId;
}

export const initialCartState: CartState = { lines: [] };

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.lines.find((l) => sameLine(l, action.slug, action.variantId));
      if (existing) {
        return {
          lines: state.lines.map((l) =>
            sameLine(l, action.slug, action.variantId) ? { ...l, qty: l.qty + action.qty } : l,
          ),
        };
      }
      return {
        lines: [...state.lines, { slug: action.slug, variantId: action.variantId, qty: action.qty }],
      };
    }
    case "REMOVE_ITEM":
      return { lines: state.lines.filter((l) => !sameLine(l, action.slug, action.variantId)) };
    case "SET_QTY": {
      if (action.qty <= 0) {
        return { lines: state.lines.filter((l) => !sameLine(l, action.slug, action.variantId)) };
      }
      return {
        lines: state.lines.map((l) =>
          sameLine(l, action.slug, action.variantId) ? { ...l, qty: action.qty } : l,
        ),
      };
    }
    case "CLEAR":
      return { lines: [] };
    case "HYDRATE":
      return action.state;
    default:
      return state;
  }
}
