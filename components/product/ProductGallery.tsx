"use client";

import { useState } from "react";
import { PlaceholderImage } from "@/components/shared/PlaceholderImage";
import { cn } from "@/lib/utils/cn";
import type { ImageRef } from "@/lib/products/schema";

export function ProductGallery({ images, productName }: { images: ImageRef[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0];

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-cream">
        <PlaceholderImage image={active} sizes="(min-width: 1024px) 40vw, 100vw" priority />
      </div>
      {images.length > 1 ? (
        <div className="mt-3 flex gap-3" role="tablist" aria-label={`${productName} images`}>
          {images.map((image, i) => (
            <button
              key={`${image.alt}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 bg-cream",
                i === activeIndex ? "border-accent" : "border-transparent",
              )}
            >
              <PlaceholderImage image={image} sizes="64px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
