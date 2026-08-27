import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { SITE_NAME } from "@/lib/utils/constants";
import { ChatWidget } from "@/components/chatbot/ChatWidget";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <div className="border-b border-border bg-paper">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="relative block h-8 w-32">
            <Image src="/brand/la-lunatique-logo.jpg" alt={SITE_NAME} fill sizes="128px" className="object-contain object-left" />
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/shop" className="text-ink hover:text-accent">
              Shop
            </Link>
            <Link href="/cart" className="text-ink hover:text-accent" aria-label="Basket">
              <ShoppingBag className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
      <main id="main-content">{children}</main>
      <ChatWidget />
    </div>
  );
}
