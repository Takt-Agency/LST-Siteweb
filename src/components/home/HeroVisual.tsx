"use client";

import Image from "next/image";
import { motion } from "motion/react";
import type { MediaRef } from "@/types";

const ease = [0.2, 0.7, 0.2, 1] as const;

/**
 * Hero photo with animated brand shapes (Motion): slow zoom-out on the photo,
 * two floating yellow squares and a yellow block behind the frame. All
 * decorative shapes are hidden from assistive technologies.
 */
export function HeroVisual({ image }: { image: MediaRef }) {
  return (
    <div className="relative mt-12 lg:mt-16">
      {/* Yellow block peeking out behind the frame */}
      <motion.div
        aria-hidden
        className="absolute -top-2 -right-2 h-2/3 w-1/3 rounded-xl bg-brand-yellow sm:-top-3 sm:-right-3"
        initial={{ opacity: 0, x: -24, y: 24 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.9, delay: 0.6, ease }}
      />

      {/* The frame and photo are visible from the first paint (LCP); only the zoom is animated. */}
      <div className="relative aspect-[4/3] animate-rise overflow-hidden rounded-xl bg-paper [animation-delay:200ms] sm:aspect-[16/8] lg:aspect-[21/8]">
        {/* Slow zoom-out on the photo */}
        <motion.div className="absolute inset-0" initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 2.4, ease: "easeOut" }}>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            preload
            sizes="(min-width: 1344px) 1280px, 100vw"
            className="object-cover object-[52%_center] sm:object-center"
          />
        </motion.div>

        {/* Rotating yellow square (bottom-right) */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute right-[8%] bottom-[14%] size-6 bg-brand-yellow sm:size-8"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1, rotate: [0, 90, 180] }}
          transition={{
            opacity: { duration: 0.6, delay: 1.5 },
            scale: { duration: 0.6, delay: 1.5, ease },
            rotate: { duration: 12, repeat: Infinity, ease: "linear", delay: 2 },
          }}
        />

        {/* Small outline square floating (top-right) */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute top-[18%] right-[30%] hidden size-5 border-2 border-brand-yellow sm:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 12, 0], rotate: [0, 45, 0] }}
          transition={{
            opacity: { duration: 0.6, delay: 1.8 },
            y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.8 },
            rotate: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.8 },
          }}
        />
      </div>
    </div>
  );
}
