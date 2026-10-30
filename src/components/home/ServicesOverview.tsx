import { Suspense } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { servicesOverview } from "@/data/home";
import { serviceHref, services } from "@/data/services";
import { ServicesSlider, ServicesSliderFallback, type ServiceSlide } from "./ServicesSlider";
import { Reveal } from "@/components/motion/Reveal";

const slides: ServiceSlide[] = services.map((service) => ({
  key: service.slug,
  href: serviceHref(service.slug),
  icon: service.icon,
  title: service.title,
  summary: service.summary,
  image: service.image,
  featured: service.slug === "consulting",
}));

/**
 * Homepage §05-03 — overview of the six services (photo, icon, title, summary,
 * link to the detail page) in a single-row slider. Consulting is highlighted, as the spec asks.
 */
export function ServicesOverview() {
  return (
    <section aria-labelledby="services-title" className="overflow-hidden border-t border-line bg-paper py-20 lg:py-28">
      <div className="container-site">
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <Eyebrow className="text-muted">{servicesOverview.eyebrow}</Eyebrow>
            <h2 id="services-title" className="mt-5 text-[2rem] leading-[1.08] font-semibold tracking-[-0.03em] sm:text-[2.5rem] lg:text-5xl">
              {servicesOverview.title}
            </h2>
          </div>
          <Link
            href={servicesOverview.link.href}
            className="group inline-flex w-fit shrink-0 items-center gap-2.5 text-sm font-medium underline decoration-line decoration-2 underline-offset-[6px] transition-colors hover:decoration-brand-yellow"
          >
            {servicesOverview.link.label}
            <FontAwesomeIcon icon={faArrowRight} aria-hidden className="text-xs transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <Reveal delay={0.1} className="mt-12 lg:mt-16">
          <Suspense fallback={<ServicesSliderFallback items={slides} />}>
            <ServicesSlider items={slides} />
          </Suspense>
        </Reveal>
      </div>
    </section>
  );
}
