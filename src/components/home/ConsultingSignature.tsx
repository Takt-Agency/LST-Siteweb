import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { consultingSignature } from "@/data/home";
import { getService } from "@/data/services";
import { Reveal } from "@/components/motion/Reveal";

const steps = getService("consulting")?.steps ?? [];

/**
 * Homepage §05-04 — consulting signature: the page's single black band (spec §06:
 * black background, yellow accents), the three areas of expertise, the
 * four-step approach and the "Demander un diagnostic" call to action.
 */
export function ConsultingSignature() {
  const c = consultingSignature;
  return (
    <section aria-labelledby="consulting-title" className="bg-ink py-20 text-white lg:py-28">
      <div className="container-site grid gap-14 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-6">
          <Eyebrow className="text-white/70">{c.eyebrow}</Eyebrow>
          <h2 id="consulting-title" className="mt-6 text-[2rem] leading-[1.08] font-semibold tracking-[-0.03em] sm:text-[2.5rem] lg:text-5xl">
            {c.title} <span className="text-brand-yellow">{c.highlight}</span>
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/70">{c.text}</p>

          <ul className="mt-10 grid gap-x-8 gap-y-5 border-t border-white/10 pt-8 sm:grid-cols-3">
            {c.focus.map((f) => (
              <li key={f.title}>
                <h3 className="text-sm font-medium">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-white/65">{f.text}</p>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link
              href={c.cta.href}
              className="group inline-flex h-12 items-center gap-3 rounded-md bg-brand-yellow px-6 font-medium text-ink transition-colors hover:bg-white"
            >
              {c.cta.label}
              <FontAwesomeIcon icon={faArrowRight} aria-hidden className="text-xs transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href={c.link.href}
              className="font-medium text-white/80 underline decoration-white/25 decoration-2 underline-offset-[6px] transition-colors hover:text-white hover:decoration-brand-yellow"
            >
              {c.link.label}
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.15} className="lg:col-span-5 lg:col-start-8">
          <p className="text-xs font-medium tracking-[0.18em] text-white/65 uppercase">{c.stepsTitle}</p>
          <ol className="mt-6 border-t border-white/10">
            {steps.map((step, i) => (
              <li key={step.title} className="group flex gap-6 border-b border-white/10 py-6">
                <span className="w-6 shrink-0 pt-0.5 text-sm text-brand-yellow tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-lg font-medium">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/70">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
