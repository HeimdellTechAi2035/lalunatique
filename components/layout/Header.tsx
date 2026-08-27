"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/lib/cart/context";
import { Button } from "@/components/ui/button";
import { mainNavLinks } from "./nav-links";
import { SITE_NAME } from "@/lib/utils/constants";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { MobileNav } from "./MobileNav";
import { useState } from "react";

export function Header() {
  const { totalItems, openDrawer } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-2 hover:bg-cream lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        <Link href="/" className="flex items-center gap-2" aria-label={`${SITE_NAME} home`}>
          <span className="relative h-10 w-40">
            <Image
              src="/brand/la-lunatique-logo.jpg"
              alt={SITE_NAME}
              fill
              sizes="160px"
              className="object-contain object-left"
              priority
            />
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
          {mainNavLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-ink hover:text-accent">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/account" aria-label="My account">
              <User className="h-5 w-5" />
            </Link>
          </Button>
          <button
            type="button"
            onClick={openDrawer}
            className="relative rounded-md p-2 hover:bg-cream"
            aria-label={`Open basket, ${totalItems} item${totalItems === 1 ? "" : "s"}`}
          >
            <ShoppingBag className="h-6 w-6" />
            {totalItems > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold text-on-dark">
                {totalItems}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} />
      <CartDrawer />
    </header>
  );
}
