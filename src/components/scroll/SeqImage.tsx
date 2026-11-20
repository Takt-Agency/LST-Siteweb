import type { CSSProperties } from "react";
import { frameUrl } from "./frames";
import type { Sequence } from "@/data/sequences";

/**
 * Une frame d'une séquence en image statique : AVIF (avec alpha) si supporté, sinon WebP ;
 * version mobile sous 768 px. Décorative (alt vide).
 */
export function SeqImage({
  seq,
  frame = 0,
  className,
  style,
  eager = false,
}: {
  seq: Sequence;
  frame?: number;
  className?: string;
  style?: CSSProperties;
  eager?: boolean;
}) {
  const mFrame = Math.min(seq.mobileFrames.count - 1, Math.round((frame / Math.max(1, seq.frames.count - 1)) * (seq.mobileFrames.count - 1)));
  return (
    <picture className={className} style={style}>
      <source media="(max-width: 767px)" type="image/avif" srcSet={frameUrl(seq.mobileFrames, mFrame, "avif")} />
      <source media="(max-width: 767px)" type="image/webp" srcSet={frameUrl(seq.mobileFrames, mFrame, "webp")} />
      <source type="image/avif" srcSet={frameUrl(seq.frames, frame, "avif")} />
      <img src={frameUrl(seq.frames, frame, "webp")} alt="" decoding="async" loading={eager ? "eager" : "lazy"} />
    </picture>
  );
}
