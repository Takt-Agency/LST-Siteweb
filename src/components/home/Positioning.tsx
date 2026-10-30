import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBoxesStacked,
  faChartLine,
  faTruckFast,
} from "@fortawesome/free-solid-svg-icons";
import { positioning } from "@/data/home";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/Reveal";

const pillarIcons = {
  truck: faTruckFast,
  logistics: faBoxesStacked,
  consulting: faChartLine,
} satisfies Record<(typeof positioning.pillars)[number]["icon"], unknown>;

/**
 * Homepage §05-02 — the three pillars: swipeable cards on phones, one hairline
 * panel of clickable cells from tablet up.
 * Each cell turns black on hover, with a yellow icon and a growing yellow rule.
 */
export function Positioning() {
  return (
    <section
      aria-labelledby="positioning-title"
      className="bg-white pt-16 pb-20 lg:pt-20 lg:pb-28"
    >
      <h2 id="positioning-title" className="sr-only">
        {positioning.title}
      </h2>
      <div className="container-site">
        {/* Phone: swipeable row of cards; tablet and up: one hairline panel */}
        <Reveal>
          <ul
            tabIndex={0}
            aria-label="Nos trois piliers"
            className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] focus-visible:outline-offset-0 md:mx-0 md:grid md:snap-none md:grid-cols-3 md:gap-0 md:overflow-hidden md:rounded-2xl md:border md:border-line md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden"
          >
            {positioning.pillars.map((pillar, i) => {
              // The inverted pillar is black at rest and turns white on hover (the reverse of the others).
              const inv = "inverted" in pillar && pillar.inverted;
              return (
                <li
                  key={pillar.title}
                  className={cn(
                    "w-[82%] shrink-0 snap-start overflow-hidden rounded-2xl border md:w-auto md:rounded-none md:border-0 md:border-l md:border-line md:first:border-l-0",
                    inv ? "border-ink" : "border-line",
                  )}
                >
                  <Link
                    href={pillar.href}
                    className={cn(
                      "group relative flex h-full flex-col p-8 transition-colors duration-300 md:min-h-80 lg:p-10",
                      inv
                        ? "bg-ink text-white hover:bg-white hover:text-ink"
                        : "hover:bg-ink hover:text-white",
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className={cn(
                          "text-sm tabular-nums transition-colors",
                          inv
                            ? "text-white/60 group-hover:text-muted"
                            : "text-muted group-hover:text-white/60",
                        )}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={cn(
                          "grid size-12 place-items-center rounded-full border transition-colors duration-300 group-hover:border-brand-yellow group-hover:bg-brand-yellow group-hover:text-ink",
                          inv ? "border-white/20" : "border-line",
                        )}
                      >
                        <FontAwesomeIcon
                          icon={pillarIcons[pillar.icon]}
                          aria-hidden
                          className="text-base"
                        />
                      </span>
                    </div>

                    <h3 className="mt-10 text-3xl font-semibold tracking-[-0.02em] md:mt-16">
                      {pillar.title}
                    </h3>
                    <p
                      className={cn(
                        "mt-3 max-w-xs leading-relaxed transition-colors",
                        inv
                          ? "text-white/70 group-hover:text-muted"
                          : "text-muted group-hover:text-white/70",
                      )}
                    >
                      {pillar.text}
                    </p>
                    <span className="mt-auto flex items-center gap-4 pt-8 text-sm font-medium">
                      En savoir plus
                      <span
                        aria-hidden
                        className={cn(
                          "h-px w-8 transition-all duration-500 group-hover:w-16",
                          inv
                            ? "bg-brand-yellow group-hover:bg-ink"
                            : "bg-current group-hover:bg-brand-yellow",
                        )}
                      />
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        aria-hidden
                        className={cn(
                          "-ml-3 text-xs transition-colors",
                          inv
                            ? "text-brand-yellow group-hover:text-ink"
                            : "group-hover:text-brand-yellow",
                        )}
                      />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
