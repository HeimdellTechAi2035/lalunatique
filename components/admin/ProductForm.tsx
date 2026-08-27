"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { createProduct, updateProduct } from "@/lib/admin/products/actions";
import { linesToArray, linesToFaqs } from "@/lib/admin/products/validation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tag } from "lucide-react";

type Category = { id: string; name: string };

type ProductFormData = {
  id?: string;
  name: string;
  slug: string;
  categoryId: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED" | "COMING_SOON";
  featured: boolean;
  priceInPence: number | null;
  compareAtPriceInPence: number | null;
  shortDescription: string;
  description: string;
  benefits: string[];
  preparation: string[];
  directions: string[];
  warnings: string[];
  ingredients: string[];
  faqs: { question: string; answer: string }[];
  seoTitle: string | null;
  seoDescription: string | null;
  contentVerified: boolean;
  adminNotes: string;
};

type FormValues = {
  name: string;
  slug: string;
  categoryId: string;
  status: ProductFormData["status"];
  featured: boolean;
  priceInPence: string;
  compareAtPriceInPence: string;
  shortDescription: string;
  description: string;
  benefits: string;
  preparation: string;
  directions: string;
  warnings: string;
  ingredients: string;
  faqs: string;
  seoTitle: string;
  seoDescription: string;
  contentVerified: boolean;
  adminNotes: string;
};

function toPence(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const pounds = Number(trimmed);
  if (Number.isNaN(pounds)) return null;
  return Math.round(pounds * 100);
}

function toPoundsString(pence: number | null): string {
  return pence == null ? "" : (pence / 100).toFixed(2);
}

export function ProductForm({ categories, product }: { categories: Category[]; product?: ProductFormData }) {
  const router = useRouter();
  const [errors, setErrors] = useState<string[]>([]);
  const isEdit = Boolean(product?.id);

  const {
    register,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      categoryId: product?.categoryId ?? categories[0]?.id ?? "",
      status: product?.status ?? "DRAFT",
      featured: product?.featured ?? false,
      priceInPence: toPoundsString(product?.priceInPence ?? null),
      compareAtPriceInPence: toPoundsString(product?.compareAtPriceInPence ?? null),
      shortDescription: product?.shortDescription ?? "",
      description: product?.description ?? "",
      benefits: (product?.benefits ?? []).join("\n"),
      preparation: (product?.preparation ?? []).join("\n"),
      directions: (product?.directions ?? []).join("\n"),
      warnings: (product?.warnings ?? []).join("\n"),
      ingredients: (product?.ingredients ?? []).join("\n"),
      faqs: (product?.faqs ?? []).map((f) => `${f.question} :: ${f.answer}`).join("\n"),
      seoTitle: product?.seoTitle ?? "",
      seoDescription: product?.seoDescription ?? "",
      contentVerified: product?.contentVerified ?? false,
      adminNotes: product?.adminNotes ?? "",
    },
  });

  async function onSubmit(values: FormValues) {
    setErrors([]);
    const payload = {
      name: values.name,
      slug: values.slug,
      categoryId: values.categoryId,
      status: values.status,
      featured: values.featured,
      priceInPence: toPence(values.priceInPence),
      compareAtPriceInPence: toPence(values.compareAtPriceInPence),
      shortDescription: values.shortDescription,
      description: values.description,
      benefits: linesToArray(values.benefits),
      preparation: linesToArray(values.preparation),
      directions: linesToArray(values.directions),
      warnings: linesToArray(values.warnings),
      ingredients: linesToArray(values.ingredients),
      faqs: linesToFaqs(values.faqs),
      seoTitle: values.seoTitle || null,
      seoDescription: values.seoDescription || null,
      contentVerified: values.contentVerified,
      adminNotes: values.adminNotes,
    };

    const result = isEdit ? await updateProduct(product!.id!, payload) : await createProduct(payload);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    if (isEdit) router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="pricing">Pricing & Offers</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="internal">Internal Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name", { required: true })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input id="slug" {...register("slug", { required: true })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="categoryId">Category</Label>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="categoryId">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="status">Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft (not purchasable)</SelectItem>
                      <SelectItem value="ACTIVE">Active (published)</SelectItem>
                      <SelectItem value="COMING_SOON">Coming soon</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" {...register("featured")} />
              Featured on homepage
            </label>
          </div>
        </TabsContent>

        <TabsContent value="pricing">
          <div className="rounded-md border border-accent/30 bg-accent/5 p-4">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent">
              <Tag className="h-3.5 w-3.5" /> Base pricing & sale
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="priceInPence">Base price (£, blank = TBC)</Label>
                <Input id="priceInPence" inputMode="decimal" placeholder="16.00" {...register("priceInPence")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="compareAtPriceInPence">Compare-at / &quot;was&quot; price (£, optional)</Label>
                <Input id="compareAtPriceInPence" inputMode="decimal" {...register("compareAtPriceInPence")} />
              </div>
            </div>
            <p className="mt-3 text-xs text-muted">
              This is the product&apos;s default price. To run a scheduled sale/offer on a specific variant (with its
              own start/end dates), use the <strong>Sale / Offer</strong> section on that variant below, in Variants
              &amp; stock — the customer-facing &quot;was&quot; price is then worked out automatically while the sale
              is active.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="content">
          <div className="grid gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="shortDescription">Short description</Label>
              <Textarea id="shortDescription" rows={2} {...register("shortDescription")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Full description</Label>
              <Textarea id="description" rows={4} {...register("description")} />
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="benefits">Benefits (one per line)</Label>
              <Textarea id="benefits" rows={4} {...register("benefits")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="preparation">Preparation (one step per line)</Label>
              <Textarea id="preparation" rows={4} {...register("preparation")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="directions">Directions / how to use (one step per line)</Label>
              <Textarea id="directions" rows={4} {...register("directions")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="warnings">Warnings (one per line)</Label>
              <Textarea id="warnings" rows={4} {...register("warnings")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ingredients">Default ingredients (one per line — variants can override)</Label>
              <Textarea id="ingredients" rows={4} {...register("ingredients")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="faqs">FAQs — one per line, format: Question :: Answer</Label>
              <Textarea id="faqs" rows={4} {...register("faqs")} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="seo">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="seoTitle">SEO title</Label>
              <Input id="seoTitle" {...register("seoTitle")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="seoDescription">SEO description</Label>
              <Input id="seoDescription" {...register("seoDescription")} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="internal">
          <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-warning">Internal only — never shown to customers</p>
            <label className="mt-3 flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" {...register("contentVerified")} />
              Content verified against official product specification
            </label>
            <div className="mt-3 flex flex-col gap-1.5">
              <Label htmlFor="adminNotes">Admin notes</Label>
              <Textarea id="adminNotes" rows={3} {...register("adminNotes")} />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {errors.length > 0 ? (
        <ul className="space-y-1 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      ) : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Create product"}
      </Button>
    </form>
  );
}
