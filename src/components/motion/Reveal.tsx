"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

const tags = {
  div: motion.div,
  li: motion.li,
  ul: motion.ul,
  ol: motion.ol,
  section: motion.section,
  p: motion.p,
} as const;

/**
 * Fades and slides its content in when it scrolls into view (once).
 * Usable from server components: pass `as` to keep the right element (e.g. "li").
 * Do not use on items of a horizontal scroller (off-screen items never intersect):
 * wrap the whole row instead. Below-the-fold only: the server HTML starts hidden until hydration (a <noscript>
 * rule in the root layout shows it when JavaScript is off).
 */
export function Reveal({
  as = "div",
  delay = 0,
  y = 28,
  className,
  children,
}: {
  as?: keyof typeof tags;
  delay?: number;
  y?: number;
  className?: string;
  children: ReactNode;
}) {
  const Tag = tags[as];
  return (
    <Tag
      data-reveal
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </Tag>
  );
}
