import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CustomerServiceCta() {
  return (
    <section className="border-t border-border bg-paper py-12">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 text-center sm:px-6 lg:px-8">
        <MessageCircle className="h-8 w-8 text-accent" aria-hidden />
        <h2 className="text-lg font-semibold text-ink">Need a hand?</h2>
        <p className="max-w-md text-sm text-muted">
          Our team is here to help with orders, products, or anything tanning-related.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/faq">Browse FAQs</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
