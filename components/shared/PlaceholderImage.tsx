import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import type { ImageRef } from "@/lib/products/schema";

/**
 * Renders a real photo via next/image when one exists, or a styled
 * branded placeholder block when it doesn't. Never presents placeholder
 * art as a real product photo — the "Sample image" label is always
 * visible so it's obvious real photography is still needed.
 */
export function PlaceholderImage({
  image,
  className,
  sizes,
  priority,
}: {
  image: ImageRef;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!image.isPlaceholder && image.src) {
    return (
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes ?? "(min-width: 1024px) 33vw, 100vw"}
        priority={priority}
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-surface-dark to-surface-dark-raised text-center",
        className,
      )}
      role="img"
      aria-label={image.alt}
    >
      <span className="text-[10px] uppercase tracking-[0.2em] text-accent-light/70">Sample image</span>
      <span className="max-w-[80%] text-sm font-medium text-on-dark/90">{image.alt}</span>
    </div>
  );
}
