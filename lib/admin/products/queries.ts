import "server-only";
import { prisma } from "@/lib/db/prisma";
import { isVariantLowStock, isVariantSoldOut } from "@/lib/products/inventory";

/**
 * Internal (admin) product reads — unlike lib/products/queries.ts these
 * intentionally include adminNotes/contentVerified and every status,
 * not just ACTIVE. Never import this from customer-facing pages.
 */
export async function getAllProductsForAdmin() {
  return prisma.product.findMany({
    include: { category: true, variants: true, images: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getProductForAdmin(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { category: true, variants: { orderBy: { createdAt: "asc" } }, images: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function getAdminDashboardStats() {
  const products = await prisma.product.findMany({ include: { variants: true } });

  const activeProducts = products.filter((p) => p.status === "ACTIVE");
  const draftProducts = products.filter((p) => p.status === "DRAFT");
  const unverifiedContent = products.filter((p) => p.status === "ACTIVE" && !p.contentVerified);

  const allVariants = products.flatMap((p) => p.variants.filter((v) => v.active));
  const lowStockVariants = allVariants.filter(isVariantLowStock);
  const soldOutVariants = allVariants.filter(isVariantSoldOut);

  return {
    totalProducts: products.length,
    activeCount: activeProducts.length,
    draftCount: draftProducts.length,
    unverifiedContentCount: unverifiedContent.length,
    lowStockCount: lowStockVariants.length,
    soldOutCount: soldOutVariants.length,
  };
}
