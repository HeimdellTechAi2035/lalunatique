import type { Metadata } from "next";
import { getAllProducts } from "@/lib/products/queries";
import { ProductCatalogProvider } from "@/components/providers/ProductCatalogProvider";
import { CartProvider } from "@/lib/cart/context";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/utils/constants";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: `${SITE_NAME} — ${SITE_TAGLINE}`, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const products = await getAllProducts();

  return (
    <html lang="en-GB">
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <ProductCatalogProvider products={products}>
          <CartProvider>{children}</CartProvider>
        </ProductCatalogProvider>
      </body>
    </html>
  );
}
