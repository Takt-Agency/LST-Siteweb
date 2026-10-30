import Image from "next/image";
import Link from "next/link";
import { logos } from "@/data/site";
import { cn } from "@/lib/utils";

/** Official LST Express logo (supplied PNG, unmodified). "dark" = black lettering for light backgrounds. */
export function Logo({
  tone = "dark",
  className,
  onNavigate,
  preload = true,
}: {
  tone?: "dark" | "light";
  className?: string;
  onNavigate?: () => void;
  /** Preload the image (header logo); turn off for below-the-fold uses such as the footer. */
  preload?: boolean;
}) {
  const logo = logos[tone];
  return (
    <Link href="/" aria-label="LST Express — accueil" className={cn("block", className)} onNavigate={onNavigate}>
      <Image
        src={logo.src}
        alt="LST Express — Logistique · Service · Transport"
        width={logo.width}
        height={logo.height}
        preload={preload}
        sizes="220px"
        className="h-auto w-full"
      />
    </Link>
  );
}
