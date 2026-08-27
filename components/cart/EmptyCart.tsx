import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <ShoppingBag className="h-10 w-10 text-muted" aria-hidden />
      <p className="text-ink">Your basket is empty.</p>
      <Button asChild>
        <Link href="/shop">Continue shopping</Link>
      </Button>
    </div>
  );
}
