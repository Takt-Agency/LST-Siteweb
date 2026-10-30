import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faBolt, faEarthAfrica, faHeadset, faSliders } from "@fortawesome/free-solid-svg-icons";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { whyLst } from "@/data/home";
import { reasons } from "@/data/services";
import { Reveal } from "@/components/motion/Reveal";

/** One icon per reason, in the order of `reasons` (src/data/services.ts). */
const reasonIcons = [faHeadset, faSliders, faBolt, faEarthAfrica];

/** Homepage §05-07 — trust arguments (qualitative, no testimonials) in a hairline grid. */
export function WhyLst() {
  return (
    <section aria-labelledby="why-title" className="border-t border-line bg-paper py-20 lg:py-28">
      <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <Eyebrow className="text-muted">{whyLst.eyebrow}</Eyebrow>
            <h2 id="why-title" className="mt-5 text-[2rem] leading-[1.08] font-semibold tracking-[-0.03em] sm:text-[2.5rem]">
              {whyLst.title}
            </h2>
            <p className="mt-5 max-w-sm text-lg leading-relaxed text-muted">{whyLst.text}</p>
            <Link
              href={whyLst.cta.href}
              className="group mt-8 inline-flex h-12 items-center gap-3 rounded-md bg-ink px-6 font-medium text-white transition-colors hover:bg-ink-soft"
            >
              {whyLst.cta.label}
              <FontAwesomeIcon icon={faArrowRight} aria-hidden className="text-xs text-brand-yellow transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>

        <ul className="grid border-t border-l border-line bg-white sm:grid-cols-2 lg:col-span-8">
          {reasons.map((reason, i) => (
            <Reveal as="li" delay={i * 0.08} key={reason.title} className="group border-r border-b border-line p-8 lg:p-10">
              <FontAwesomeIcon
                icon={reasonIcons[i % reasonIcons.length]}
                aria-hidden
                className="text-xl text-ink transition-colors duration-300 group-hover:text-brand-yellow"
              />
              <h3 className="mt-10 text-xl font-semibold">{reason.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{reason.text}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
