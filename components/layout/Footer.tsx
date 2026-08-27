import Link from "next/link";
import Image from "next/image";
import { CONTACT_EMAIL, SITE_NAME, SITE_TAGLINE } from "@/lib/utils/constants";
import { legalLinks, mainNavLinks, supportLinks } from "./nav-links";
import { NewsletterForm } from "@/components/forms/NewsletterForm";

export function Footer() {
  return (
    <footer className="border-t border-border bg-ink text-on-dark">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr]">
          <div>
            <span className="relative block h-10 w-40">
              <Image
                src="/brand/la-lunatique-logo.jpg"
                alt={SITE_NAME}
                fill
                sizes="160px"
                className="object-contain object-left"
              />
            </span>
            <p className="mt-4 max-w-xs text-sm text-on-dark/70">{SITE_TAGLINE} — delivered across the UK.</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-on-dark/80">Shop</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {mainNavLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-on-dark/70 hover:text-on-dark">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-on-dark/80">Support</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-on-dark/70 hover:text-on-dark">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-on-dark/70 hover:text-on-dark">
                  {CONTACT_EMAIL}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-on-dark/80">Stay in the glow</h3>
            <p className="mt-4 text-sm text-on-dark/70">Sign up for offers, launches and tanning tips.</p>
            <div className="mt-4">
              <NewsletterForm variant="dark" />
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-on-dark/10 pt-8">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-on-dark/50">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-on-dark/80">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-on-dark/40">
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved. Registered in England & Wales.
          </p>
        </div>
      </div>
    </footer>
  );
}
