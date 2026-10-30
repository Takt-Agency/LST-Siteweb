import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Small uppercase label above section titles, led by a brand-yellow square. */
export function Eyebrow({
  children,
  className,
  markClassName = "bg-brand-yellow",
}: {
  children: ReactNode;
  className?: string;
  /** Colour of the leading square (e.g. "bg-ink" on a yellow background). */
  markClassName?: string;
}) {
  return (
    <p className={cn("flex items-center gap-3 text-xs font-semibold tracking-[0.18em] uppercase", className)}>
      <span aria-hidden className={cn("size-1.5 shrink-0", markClassName)} />
      {children}
    </p>
  );
}
