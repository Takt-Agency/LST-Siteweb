import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faBoxesStacked, faChartLine, faTruckFast } from "@fortawesome/free-solid-svg-icons";
import { HeroVisual } from "@/components/home/HeroVisual";
import { hero, heroFeatures } from "@/data/hero";

const featureIcons = {
  truck: faTruckFast,
  package: faBoxesStacked,
  chart: faChartLine,
} satisfies Record<(typeof heroFeatures)[number]["icon"], unknown>;

/**
 * Homepage hero — minimal corporate layout: oversized headline and short pitch
 * on white (highlighted keywords), a wide cinematic photo, then the three key
 * points on a white panel overlapping the photo.
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="isolate bg-white pt-12 pb-10 sm:pt-16 lg:pt-20 lg:pb-14">
      <div className="container-site">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="animate-rise lg:col-span-7">
            <p className="inline-flex items-center gap-2.5 rounded-full border border-line py-1.5 pr-4 pl-2 text-xs font-semibold tracking-[0.14em] text-muted uppercase">
              <span className="relative grid size-5 place-items-center">
                <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-brand-yellow/50 [animation-duration:2.4s]" />
                <span aria-hidden className="relative size-2 rounded-full bg-brand-yellow" />
              </span>
              {hero.eyebrow}
            </p>
            <h1 id="hero-title" className="mt-6 text-[2.6rem] leading-[1.02] font-semibold tracking-[-0.035em] sm:text-6xl lg:text-[4.4rem]">
              {hero.title}{" "}
              <span className="relative inline-block whitespace-nowrap">
                <span aria-hidden className="absolute inset-x-[-0.06em] bottom-[0.08em] -z-10 h-[0.32em] origin-left rounded-sm bg-brand-yellow/80 [animation:highlight_0.9s_cubic-bezier(0.2,0.7,0.2,1)_0.6s_both]" />
                {hero.highlight}
              </span>
              <span className="text-brand-yellow">.</span>
            </h1>
          </div>
          <div className="animate-rise [animation-delay:150ms] lg:col-span-5 lg:pb-2">
            <p className="max-w-md text-lg leading-relaxed text-muted">
              {hero.text.before}
              <span className="text-ink">{hero.text.strong}</span>
              {hero.text.after}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
              <Link
                href={hero.primaryCta.href}
                className="group inline-flex h-12 items-center gap-3 rounded-md bg-ink px-6 font-medium text-white transition-colors hover:bg-ink-soft"
              >
                {hero.primaryCta.label}
                <FontAwesomeIcon icon={faArrowRight} aria-hidden className="text-xs text-brand-yellow transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href={hero.secondaryCta.href}
                className="font-medium underline decoration-line decoration-2 underline-offset-[6px] transition-colors hover:decoration-brand-yellow"
              >
                {hero.secondaryCta.label}
              </Link>
            </div>
          </div>
        </div>

        <HeroVisual image={hero.image} />

        {/* Key points — soft cards on phones; from tablet up a white panel overlapping the photo */}
        <ul className="relative z-10 mt-4 grid gap-3 sm:mx-6 sm:-mt-10 sm:grid-cols-3 sm:gap-0 sm:rounded-xl sm:border sm:border-line sm:bg-white sm:px-6 sm:shadow-[0_24px_50px_-30px_rgb(22_22_22/0.35)] lg:mx-10 lg:-mt-12 lg:px-8">
          {heroFeatures.map((f, i) => (
            <li
              key={f.title}
              style={{ animationDelay: `${350 + i * 120}ms` }}
              className={`flex animate-rise items-center gap-4 rounded-xl bg-paper p-4 sm:rounded-none sm:bg-transparent sm:px-0 sm:py-6 ${
                i > 0 ? "sm:border-l sm:border-line sm:pl-6 lg:pl-8" : ""
              }`}
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-ink sm:bg-paper">
                <FontAwesomeIcon icon={featureIcons[f.icon]} aria-hidden className="text-base" />
              </span>
              <span className="min-w-0">
                <span className="block font-medium leading-snug">{f.title}</span>
                <span className="mt-0.5 block text-sm text-muted">{f.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
