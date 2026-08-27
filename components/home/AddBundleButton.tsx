"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart/context";

export function AddBundleButton({ productSlugs }: { productSlugs: string[] }) {
  const { addItem } = useCart();

  return (
    <Button
      size="sm"
      onClick={() => {
        productSlugs.forEach((slug) => addItem(slug, 1));
      }}
    >
      Add Bundle
    </Button>
  );
}
