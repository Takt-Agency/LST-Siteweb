import { cn } from "@/lib/utils";

/** Small "Bientôt" pill for sections not published yet. */
export function SoonBadge({ className }: { className?: string }) {
  return (
    <span className={cn("rounded-full bg-brand-yellow px-1.5 py-0.5 text-[0.6rem] leading-none font-semibold tracking-wide text-ink uppercase", className)}>
      Bientôt
    </span>
  );
}
