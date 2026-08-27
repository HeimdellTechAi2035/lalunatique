"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PublicProduct } from "@/lib/products/schema";

export function ProductTabs({ product, ingredients }: { product: PublicProduct; ingredients: string[] }) {
  const hasPreparation = product.preparation.length > 0;
  const hasDirections = product.directions.length > 0;
  const hasIngredients = ingredients.length > 0;
  const hasWarnings = product.warnings.length > 0;
  const hasFaqs = product.faqs.length > 0;

  return (
    <Tabs defaultValue="description" className="mt-12">
      <TabsList>
        <TabsTrigger value="description">Description</TabsTrigger>
        {hasPreparation ? <TabsTrigger value="preparation">Preparation</TabsTrigger> : null}
        {hasDirections ? <TabsTrigger value="directions">How to Use</TabsTrigger> : null}
        {hasIngredients ? <TabsTrigger value="ingredients">Ingredients</TabsTrigger> : null}
        {hasWarnings ? <TabsTrigger value="warnings">Warnings</TabsTrigger> : null}
        {hasFaqs ? <TabsTrigger value="faqs">FAQs</TabsTrigger> : null}
      </TabsList>

      <TabsContent value="description">
        <p className="max-w-2xl text-sm leading-relaxed text-muted">{product.description}</p>
        {product.benefits.length > 0 ? (
          <ul className="mt-4 grid max-w-2xl grid-cols-1 gap-2 text-sm text-ink sm:grid-cols-2">
            {product.benefits.map((b) => (
              <li key={b} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {b}
              </li>
            ))}
          </ul>
        ) : null}
      </TabsContent>

      {hasPreparation ? (
        <TabsContent value="preparation">
          <ul className="max-w-2xl list-disc space-y-2 pl-5 text-sm text-muted">
            {product.preparation.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </TabsContent>
      ) : null}

      {hasDirections ? (
        <TabsContent value="directions">
          <ol className="max-w-2xl list-decimal space-y-2 pl-5 text-sm text-muted">
            {product.directions.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </TabsContent>
      ) : null}

      {hasIngredients ? (
        <TabsContent value="ingredients">
          <p className="max-w-2xl text-sm text-muted">{ingredients.join(", ")}</p>
        </TabsContent>
      ) : null}

      {hasWarnings ? (
        <TabsContent value="warnings">
          <ul className="max-w-2xl list-disc space-y-2 pl-5 text-sm text-muted">
            {product.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </TabsContent>
      ) : null}

      {hasFaqs ? (
        <TabsContent value="faqs">
          <dl className="max-w-2xl space-y-4">
            {product.faqs.map((faq) => (
              <div key={faq.question}>
                <dt className="text-sm font-medium text-ink">{faq.question}</dt>
                <dd className="mt-1 text-sm text-muted">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </TabsContent>
      ) : null}
    </Tabs>
  );
}
