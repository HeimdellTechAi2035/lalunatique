import { NextResponse } from "next/server";
import { getKnowledgeCatalogue } from "@/lib/knowledge/catalogue";

/**
 * Public, unauthenticated — this is a summary of publicly-published
 * store information (products, categories, policies, FAQs), the same
 * data any visitor or crawler can already read across the site, just
 * assembled into one machine-readable document for agents that would
 * rather fetch one resource than crawl many pages.
 */
export async function GET() {
  const catalogue = await getKnowledgeCatalogue();
  return NextResponse.json(catalogue, {
    headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" },
  });
}
