"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/context";
import { useOrderTotals } from "@/lib/hooks/useOrderTotals";
import { Dialog, DialogSheetContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CartLineItem } from "./CartLineItem";
import { CartSummary } from "./CartSummary";
import { EmptyCart } from "./EmptyCart";

export function CartDrawer() {
  const { state, isDrawerOpen, closeDrawer } = useCart();
  const { totals, loading } = useOrderTotals(state.lines, "standard");

  return (
    <Dialog open={isDrawerOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <DialogSheetContent>
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <DialogTitle>Your Basket</DialogTitle>
        </div>

        {state.lines.length === 0 ? (
          <EmptyCart />
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-6">
              {state.lines.map((line) => (
                <CartLineItem key={`${line.slug}-${line.variantId ?? "base"}`} line={line} />
              ))}
            </ul>
            <div className="border-t border-border px-6 py-5">
              <CartSummary totals={totals} loading={loading} />
              <div className="mt-4 flex flex-col gap-2">
                <Button asChild size="lg">
                  <Link href="/checkout" onClick={closeDrawer}>
                    Checkout
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/cart" onClick={closeDrawer}>
                    View basket
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogSheetContent>
    </Dialog>
  );
}
