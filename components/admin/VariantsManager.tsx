"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createVariant, updateVariant, deleteVariant, adjustVariantStock } from "@/lib/admin/products/actions";
import { linesToArray } from "@/lib/admin/products/validation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Tag } from "lucide-react";

export type AdminVariant = {
  id: string;
  sku: string;
  size: string | null;
  fragrance: string | null;
  tanStrength: string | null;
  priceOverrideInPence: number | null;
  salePriceInPence: number | null;
  saleStartsAt: Date | null;
  saleEndsAt: Date | null;
  stockQuantity: number;
  reservedStock: number;
  lowStockThreshold: number;
  weightGrams: number;
  barcode: string | null;
  imageUrl: string | null;
  ingredients: string | null;
  active: boolean;
};

type VariantFields = {
  sku: string;
  size: string;
  fragrance: string;
  tanStrength: string;
  priceOverrideInPence: string;
  salePriceInPence: string;
  saleStartsAt: string;
  saleEndsAt: string;
  lowStockThreshold: number;
  weightGrams: number;
  barcode: string;
  imageUrl: string;
  ingredients: string;
  active: boolean;
};

function toPence(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const pounds = Number(trimmed);
  return Number.isNaN(pounds) ? null : Math.round(pounds * 100);
}

function toDateTimeLocal(date: Date | null): string {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDateTimeLocal(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isSaleCurrentlyActive(v: Pick<AdminVariant, "salePriceInPence" | "saleStartsAt" | "saleEndsAt">): boolean {
  if (v.salePriceInPence == null) return false;
  const now = new Date();
  if (v.saleStartsAt && now < v.saleStartsAt) return false;
  if (v.saleEndsAt && now > v.saleEndsAt) return false;
  return true;
}

function toPayload(v: VariantFields) {
  return {
    sku: v.sku,
    size: v.size || null,
    fragrance: v.fragrance || null,
    tanStrength: v.tanStrength || null,
    priceOverrideInPence: toPence(v.priceOverrideInPence),
    salePriceInPence: toPence(v.salePriceInPence),
    saleStartsAt: fromDateTimeLocal(v.saleStartsAt),
    saleEndsAt: fromDateTimeLocal(v.saleEndsAt),
    lowStockThreshold: Number(v.lowStockThreshold),
    weightGrams: Number(v.weightGrams),
    barcode: v.barcode || null,
    imageUrl: v.imageUrl || null,
    ingredients: v.ingredients.trim() ? linesToArray(v.ingredients) : null,
    active: v.active,
  };
}

function VariantRow({ productId, variant }: { productId: string; variant: AdminVariant }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState<"RESTOCK" | "MANUAL_ADJUSTMENT" | "RETURN" | "CORRECTION">("RESTOCK");

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<VariantFields>({
    defaultValues: {
      sku: variant.sku,
      size: variant.size ?? "",
      fragrance: variant.fragrance ?? "",
      tanStrength: variant.tanStrength ?? "",
      priceOverrideInPence: variant.priceOverrideInPence != null ? (variant.priceOverrideInPence / 100).toFixed(2) : "",
      salePriceInPence: variant.salePriceInPence != null ? (variant.salePriceInPence / 100).toFixed(2) : "",
      saleStartsAt: toDateTimeLocal(variant.saleStartsAt),
      saleEndsAt: toDateTimeLocal(variant.saleEndsAt),
      lowStockThreshold: variant.lowStockThreshold,
      weightGrams: variant.weightGrams,
      barcode: variant.barcode ?? "",
      imageUrl: variant.imageUrl ?? "",
      ingredients: variant.ingredients ? JSON.parse(variant.ingredients).join("\n") : "",
      active: variant.active,
    },
  });

  async function onSubmit(values: VariantFields) {
    setError(null);
    const result = await updateVariant(variant.id, productId, toPayload(values));
    if (!result.ok) {
      setError(result.errors[0]);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  async function handleAdjust() {
    const delta = Number(adjustAmount);
    if (!delta) return;
    const result = await adjustVariantStock(productId, { variantId: variant.id, delta, reason: adjustReason });
    if (result.ok) {
      setAdjustOpen(false);
      setAdjustAmount("");
      router.refresh();
    } else {
      setError(result.errors[0]);
    }
  }

  const available = Math.max(0, variant.stockQuantity - variant.reservedStock);
  const onSale = isSaleCurrentlyActive(variant);
  const saleScheduled = variant.salePriceInPence != null && !onSale;

  if (!editing) {
    return (
      <div className="rounded-md border border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-ink">
              {variant.sku} {[variant.fragrance, variant.size, variant.tanStrength].filter(Boolean).join(" · ") || <span className="text-muted">(no options)</span>}
            </p>
            <p className="mt-1 text-xs text-muted">
              Stock: {variant.stockQuantity} · Reserved: {variant.reservedStock} · Available: {available}
              {available <= variant.lowStockThreshold && available > 0 ? " · " : ""}
              {available <= variant.lowStockThreshold && available > 0 ? <span className="text-warning">Low stock</span> : null}
              {available === 0 ? (
                <>
                  {" · "}
                  <span className="text-danger">Sold out</span>
                </>
              ) : null}
              {!variant.active ? (
                <>
                  {" · "}
                  <Badge variant="outline">Inactive</Badge>
                </>
              ) : null}
            </p>
            {onSale || saleScheduled ? (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs">
                <Tag className="h-3.5 w-3.5 text-accent" />
                {onSale ? (
                  <Badge variant="accent">On sale — £{(variant.salePriceInPence! / 100).toFixed(2)}</Badge>
                ) : (
                  <Badge variant="outline">Sale scheduled — £{(variant.salePriceInPence! / 100).toFixed(2)}</Badge>
                )}
                {variant.saleStartsAt || variant.saleEndsAt ? (
                  <span className="text-muted">
                    {variant.saleStartsAt ? `from ${variant.saleStartsAt.toLocaleString("en-GB")}` : ""}
                    {variant.saleStartsAt && variant.saleEndsAt ? " " : ""}
                    {variant.saleEndsAt ? `until ${variant.saleEndsAt.toLocaleString("en-GB")}` : ""}
                  </span>
                ) : null}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setAdjustOpen((o) => !o)}>
              Adjust stock
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              Edit
            </Button>
            <button
              type="button"
              onClick={async () => {
                if (!confirm(`Delete variant ${variant.sku}?`)) return;
                await deleteVariant(variant.id, productId);
                router.refresh();
              }}
              className="text-muted hover:text-danger"
              aria-label={`Delete variant ${variant.sku}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {adjustOpen ? (
          <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-border pt-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor={`adjust-${variant.id}`}>Amount (+/-)</Label>
              <Input
                id={`adjust-${variant.id}`}
                className="w-28"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                placeholder="e.g. 20 or -5"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor={`reason-${variant.id}`}>Reason</Label>
              <select
                id={`reason-${variant.id}`}
                className="h-11 rounded-md border border-border bg-paper px-2 text-sm"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value as typeof adjustReason)}
              >
                <option value="RESTOCK">Restock</option>
                <option value="MANUAL_ADJUSTMENT">Manual adjustment</option>
                <option value="RETURN">Return</option>
                <option value="CORRECTION">Correction</option>
              </select>
            </div>
            <Button size="sm" onClick={handleAdjust}>
              Apply
            </Button>
          </div>
        ) : null}
        {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-md border border-accent/40 p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <Label>SKU</Label>
          <Input {...register("sku", { required: true })} />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Fragrance</Label>
          <Input {...register("fragrance")} />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Size</Label>
          <Input {...register("size")} />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Tan strength</Label>
          <Input {...register("tanStrength")} />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Price override (£)</Label>
          <Input {...register("priceOverrideInPence")} placeholder="blank = use base price" />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Low stock threshold</Label>
          <Input type="number" {...register("lowStockThreshold")} />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Weight (g)</Label>
          <Input type="number" {...register("weightGrams")} />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Barcode</Label>
          <Input {...register("barcode")} />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Image URL</Label>
          <Input {...register("imageUrl")} />
        </div>
        <div className="flex flex-col gap-1 sm:col-span-3">
          <Label>Ingredient override (one per line — leave blank to inherit product default)</Label>
          <textarea
            className="min-h-20 rounded-md border border-border bg-paper px-3 py-2 text-sm"
            {...register("ingredients")}
          />
        </div>
      </div>

      <div className="rounded-md border border-accent/30 bg-accent/5 p-3">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent">
          <Tag className="h-3.5 w-3.5" /> Sale / Offer
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <Label>Sale price (£)</Label>
            <Input {...register("salePriceInPence")} placeholder="blank = no sale" />
          </div>
          <div className="flex flex-col gap-1">
            <Label>Starts (optional)</Label>
            <Input type="datetime-local" {...register("saleStartsAt")} />
          </div>
          <div className="flex flex-col gap-1">
            <Label>Ends (optional)</Label>
            <Input type="datetime-local" {...register("saleEndsAt")} />
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">
          Leave start/end blank for a sale that&apos;s on as soon as a price is set. The customer-facing &quot;was&quot;
          price is worked out automatically.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" {...register("active")} />
        Active / purchasable
      </label>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          Save
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function VariantsManager({ productId, variants }: { productId: string; variants: AdminVariant[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<VariantFields>({
    defaultValues: {
      sku: "",
      size: "",
      fragrance: "",
      tanStrength: "",
      priceOverrideInPence: "",
      salePriceInPence: "",
      saleStartsAt: "",
      saleEndsAt: "",
      lowStockThreshold: 10,
      weightGrams: 0,
      barcode: "",
      imageUrl: "",
      ingredients: "",
      active: true,
    },
  });

  async function onSubmit(values: VariantFields) {
    setError(null);
    const result = await createVariant(productId, toPayload(values));
    if (!result.ok) {
      setError(result.errors[0]);
      return;
    }
    reset();
    setAdding(false);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {variants.map((v) => (
        <VariantRow key={v.id} productId={productId} variant={v} />
      ))}

      {adding ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-md border border-accent/40 p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <Label>SKU</Label>
              <Input {...register("sku", { required: true })} />
            </div>
            <div className="flex flex-col gap-1">
              <Label>Fragrance</Label>
              <Input {...register("fragrance")} />
            </div>
            <div className="flex flex-col gap-1">
              <Label>Size</Label>
              <Input {...register("size")} />
            </div>
          </div>
          {error ? <p className="text-xs text-danger">{error}</p> : null}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isSubmitting}>
              Add variant
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button type="button" size="sm" variant="outline" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" /> Add variant
        </Button>
      )}
    </div>
  );
}
