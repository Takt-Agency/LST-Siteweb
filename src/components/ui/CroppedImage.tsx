import Image from "next/image";
import type { MediaRef } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Fills its (relative, sized) parent with an art-directed crop of a photo:
 * `position` sets the focal point and `zoom` scales around it (see `photos`
 * in src/data/site.ts). Decorative by default (empty alt).
 */
export function CroppedImage({
  image,
  sizes,
  decorative = true,
  preload,
  className,
}: {
  image: MediaRef;
  sizes: string;
  decorative?: boolean;
  preload?: boolean;
  className?: string;
}) {
  return (
    <div className="absolute inset-0" style={{ scale: image.zoom, transformOrigin: image.position }}>
      <Image
        src={image.src}
        alt={decorative ? "" : image.alt}
        fill
        sizes={sizes}
        preload={preload}
        className={cn("object-cover", className)}
        style={{ objectPosition: image.position }}
      />
    </div>
  );
}
