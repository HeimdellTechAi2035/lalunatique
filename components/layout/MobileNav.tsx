"use client";

import Link from "next/link";
import { Dialog, DialogSheetContent, DialogTitle } from "@/components/ui/dialog";
import { mainNavLinks, supportLinks } from "./nav-links";

export function MobileNav({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogSheetContent side="left" className="max-w-xs">
        <div className="flex flex-col gap-1 p-6 pt-16">
          <DialogTitle className="sr-only">Menu</DialogTitle>
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {mainNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => onOpenChange(false)}
                className="rounded-md px-2 py-3 text-base font-medium text-ink hover:bg-cream"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <hr className="my-4 border-border" />
          <nav aria-label="Support navigation" className="flex flex-col gap-1">
            {supportLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => onOpenChange(false)}
                className="rounded-md px-2 py-2 text-sm text-muted hover:bg-cream hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </DialogSheetContent>
    </Dialog>
  );
}
