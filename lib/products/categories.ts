import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { Category } from "./schema";

/**
 * Categories are admin-managed database rows (see the Category model in
 * prisma/schema.prisma), not a hardcoded list — new categories can be
 * added from the admin without a code change.
 */
export async function getAllCategories(): Promise<Category[]> {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  return categories.map((c) => ({ id: c.id, slug: c.slug, name: c.name, description: c.description }));
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const category = await prisma.category.findUnique({ where: { slug } });
  return category ? { id: category.id, slug: category.slug, name: category.name, description: category.description } : undefined;
}
