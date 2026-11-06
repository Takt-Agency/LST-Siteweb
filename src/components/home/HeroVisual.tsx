"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlane, faShip, faTruckFast } from "@fortawesome/free-solid-svg-icons";
import type { MediaRef } from "@/types";

const ease = [0.2, 0.7, 0.2, 1] as const;

const modes = [
  { icon: faTruckFast, label: "Route" },
  { icon: faShip, label: "Mer" },
  { icon: faPlane, label: "Air" },
];

/**
 * Hero photo (Motion): slow zoom-out on the photo, a yellow block behind the
 * frame and a glass "Route · Mer · Air" tag. Decorative shapes are hidden from
 * assistive technologies.
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

        {/* Soft top shade so the glass tag stays readable on bright skies */}
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/25 to-transparent" />

        {/* "Route · Mer · Air" glass tag */}
        <motion.ul
          aria-label="Modes de transport"
          className="absolute top-4 left-4 flex items-center gap-1 rounded-full bg-white/85 p-1 pr-3 text-xs font-medium text-ink shadow-sm backdrop-blur sm:top-6 sm:left-6 sm:text-sm"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1, ease }}
        >
          {modes.map((m, i) => (
            <li key={m.label} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden className="mx-1 size-1 rounded-full bg-ink/25" />}
              <span className={`grid size-7 place-items-center rounded-full ${i === 0 ? "bg-brand-yellow" : "bg-paper"}`}>
                <FontAwesomeIcon icon={m.icon} aria-hidden className="text-[0.7rem]" />
              </span>
              {m.label}
            </li>
          ))}
        </motion.ul>
      </div>
    </div>
  );
}
