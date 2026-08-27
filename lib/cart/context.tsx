"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { cartReducer, initialCartState } from "./reducer";
import type { CartLine, CartState } from "./types";

const STORAGE_KEY = "la-lunatique-cart";

type CartContextValue = {
  state: CartState;
  totalItems: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (slug: string, qty?: number, variantId?: string) => void;
  removeItem: (slug: string, variantId?: string) => void;
  setQty: (slug: string, qty: number, variantId?: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Read localStorage only after mount to avoid an SSR/client hydration mismatch.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { lines: CartLine[] };
        if (Array.isArray(parsed.lines)) {
          dispatch({ type: "HYDRATE", state: { lines: parsed.lines } });
        }
      }
    } catch {
      // Corrupt or inaccessible storage — start with an empty cart.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable (private browsing, quota) — cart still works for this session.
    }
  }, [state, hydrated]);

  const totalItems = useMemo(() => state.lines.reduce((sum, l) => sum + l.qty, 0), [state.lines]);

  const value: CartContextValue = {
    state,
    totalItems,
    isDrawerOpen,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
    addItem: (slug, qty = 1, variantId) => {
      dispatch({ type: "ADD_ITEM", slug, qty, variantId });
      setDrawerOpen(true);
    },
    removeItem: (slug, variantId) => dispatch({ type: "REMOVE_ITEM", slug, variantId }),
    setQty: (slug, qty, variantId) => dispatch({ type: "SET_QTY", slug, qty, variantId }),
    clear: () => dispatch({ type: "CLEAR" }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
