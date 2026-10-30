import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { finalCta } from "@/data/home";
import { Reveal } from "@/components/motion/Reveal";

/** Homepage §05-10 — closing call to action on a full-width brand-yellow band: quote form and contact page. */
export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="bg-brand-yellow py-20 text-ink lg:py-28">
      <div className="container-site grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
        <Reveal className="lg:col-span-7">
          <Eyebrow className="text-ink/70" markClassName="bg-ink">{finalCta.eyebrow}</Eyebrow>
          <h2 id="cta-title" className="mt-6 text-[2.2rem] leading-[1.05] font-semibold tracking-[-0.035em] sm:text-5xl lg:text-6xl">
            {finalCta.title}
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-5 lg:pb-2">
          <p className="max-w-md text-lg leading-relaxed text-ink/80">{finalCta.text}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link
              href={finalCta.primary.href}
              className="group inline-flex h-12 items-center gap-3 rounded-md bg-ink px-6 font-medium text-white transition-colors hover:bg-ink-soft"
            >
              {finalCta.primary.label}
              <FontAwesomeIcon icon={faArrowRight} aria-hidden className="text-xs text-brand-yellow transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href={finalCta.secondary.href}
              className="font-medium underline decoration-ink/30 decoration-2 underline-offset-[6px] transition-colors hover:decoration-ink"
            >
              {finalCta.secondary.label}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
