"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { addProductImage, removeProductImage, setFeaturedImage } from "@/lib/admin/products/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";

export type AdminImage = { id: string; url: string; alt: string; isFeatured: boolean };

export function ImagesManager({ productId, images }: { productId: string; images: AdminImage[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<{ url: string; alt: string }>({
    defaultValues: { url: "", alt: "" },
  });

  async function onSubmit(values: { url: string; alt: string }) {
    setError(null);
    const result = await addProductImage({ productId, ...values });
    if (!result.ok) {
      setError(result.errors[0]);
      return;
    }
    reset();
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">
        Add an image by URL (e.g. a path already in /public, or a hosted image link). Direct file upload to cloud
        storage is a later build stage.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((img) => (
          <div key={img.id} className="relative overflow-hidden rounded-md border border-border">
            <div className="relative aspect-square bg-cream">
              <Image src={img.url} alt={img.alt} fill sizes="150px" className="object-cover" />
            </div>
            <div className="flex items-center justify-between gap-1 p-2">
              {img.isFeatured ? (
                <Badge variant="accent">Featured</Badge>
              ) : (
                <button type="button" onClick={async () => { await setFeaturedImage(img.id, productId); router.refresh(); }} className="text-xs text-accent hover:underline">
                  Set featured
                </button>
              )}
              <button
                type="button"
                onClick={async () => {
                  await removeProductImage(img.id, productId);
                  router.refresh();
                }}
                className="text-muted hover:text-danger"
                aria-label={`Remove image`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="img-url">Image URL</Label>
          <Input id="img-url" className="w-64" {...register("url", { required: true })} placeholder="/products/example.jpg" />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="img-alt">Alt text</Label>
          <Input id="img-alt" className="w-64" {...register("alt", { required: true })} />
        </div>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          Add image
        </Button>
      </form>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
