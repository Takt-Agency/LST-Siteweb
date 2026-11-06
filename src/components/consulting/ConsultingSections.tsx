import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faCheck,
  faCoins,
  faEarthAfrica,
  faGears,
  faIndustry,
  faMagnifyingGlassChart,
  faPlus,
  faRoute,
  faShip,
  faUserTie,
  faUsersGear,
} from "@fortawesome/free-solid-svg-icons";
import { CroppedImage } from "@/components/ui/CroppedImage";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { consultingPage as c } from "@/data/consulting";
import { contact } from "@/data/site";
import type { Service } from "@/types";
import { Reveal } from "@/components/motion/Reveal";
import { PhoneLinks } from "@/components/ui/PhoneLinks";

const icons = {
  leaders: faUserTie,
  operations: faUsersGear,
  trade: faShip,
  industry: faIndustry,
  diagnostic: faMagnifyingGlassChart,
  costs: faCoins,
  modes: faRoute,
  process: faGears,
  international: faEarthAfrica,
};

function SectionTitle({ id, eyebrow, title, dark }: { id: string; eyebrow: string; title: string; dark?: boolean }) {
  return (
    <>
      <Eyebrow className={dark ? "text-white/70" : "text-muted"}>{eyebrow}</Eyebrow>
      <h2 id={id} className="mt-5 text-[2rem] leading-[1.08] font-semibold tracking-[-0.03em] sm:text-[2.5rem] lg:text-5xl">
        {title}
      </h2>
    </>
  );
}

/** Black opening band (spec §06: distinctive treatment, yellow/orange accents). */
export function ConsultingHero({ service }: { service: Service }) {
  const h = c.hero;
  return (
    <section aria-labelledby="consulting-hero-title" className="bg-ink pt-10 pb-16 text-white lg:pt-14 lg:pb-24">
      <div className="container-site">
        <nav aria-label="Fil d'Ariane">
          <ol className="flex items-center gap-2 text-sm text-white/60">
            <li>
              <Link href="/" className="transition-colors hover:text-white">
                Accueil
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-white">
              Consulting
            </li>
          </ol>
        </nav>

        <div className="mt-10 grid gap-12 lg:mt-14 lg:grid-cols-12 lg:items-end lg:gap-16">
          <Reveal className="lg:col-span-7">
            <Eyebrow className="text-white/70">{h.eyebrow}</Eyebrow>
            <h1 id="consulting-hero-title" className="mt-6 text-[2.4rem] leading-[1.04] font-semibold tracking-[-0.035em] sm:text-5xl lg:text-[3.6rem]">
              {h.title} <span className="text-brand-yellow">{h.highlight}</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/70">{h.text}</p>
            <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
              <Link
                href={h.cta.href}
                className="group inline-flex h-12 items-center gap-3 rounded-md bg-brand-yellow px-6 font-medium text-ink transition-colors hover:bg-white"
              >
                {h.cta.label}
                <FontAwesomeIcon icon={faArrowRight} aria-hidden className="text-xs transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href={h.secondary.href}
                className="font-medium text-white/85 underline decoration-white/25 decoration-2 underline-offset-[6px] transition-colors hover:text-white hover:decoration-brand-yellow"
              >
                {h.secondary.label}
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.15} className="lg:col-span-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-ink-soft lg:aspect-[4/5]">
              <CroppedImage image={service.image} sizes="(min-width: 1024px) 40vw, 100vw" preload />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** Target audiences (spec §1.2) in a hairline grid. */
export function ConsultingAudiences() {
  return (
    <section aria-labelledby="audiences-title" className="bg-white py-20 lg:py-28">
      <div className="container-site">
        <Reveal className="max-w-2xl">
          <SectionTitle id="audiences-title" eyebrow={c.audiences.eyebrow} title={c.audiences.title} />
        </Reveal>
        <ul className="mt-12 grid border-t border-l border-line sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {c.audiences.items.map((a, i) => (
            <Reveal as="li" delay={i * 0.08} key={a.title} className="border-r border-b border-line p-7 lg:p-8">
              <FontAwesomeIcon icon={icons[a.icon as keyof typeof icons]} aria-hidden className="text-xl text-ink" />
              <h3 className="mt-8 text-lg font-semibold">{a.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{a.text}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** The five areas of expertise (spec §06 offerings) as an editorial list. */
export function ConsultingAreas() {
  return (
    <section aria-labelledby="areas-title" className="border-t border-line bg-paper py-20 lg:py-28">
      <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <SectionTitle id="areas-title" eyebrow={c.areas.eyebrow} title={c.areas.title} />
          </div>
        </div>
        <ol className="border-t border-line lg:col-span-8">
          {c.areas.items.map((area, i) => (
            <Reveal as="li" key={area.title} className="group flex gap-5 border-b border-line py-8 sm:gap-8">
              <span className="w-8 shrink-0 pt-1 text-sm text-muted tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <div className="flex-1">
                <h3 className="text-xl leading-snug font-semibold sm:text-2xl">{area.title}</h3>
                <p className="mt-2 max-w-xl leading-relaxed text-muted">{area.text}</p>
              </div>
              <span className="hidden size-12 shrink-0 place-items-center rounded-full border border-line bg-white transition-colors group-hover:border-brand-yellow group-hover:bg-brand-yellow sm:grid">
                <FontAwesomeIcon icon={icons[area.icon as keyof typeof icons]} aria-hidden className="text-base" />
              </span>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Four-step approach (diagnostic → recommandations → mise en œuvre → suivi). */
export function ConsultingApproach({ steps }: { steps: NonNullable<Service["steps"]> }) {
  return (
    <section id="demarche" aria-labelledby="approach-title" className="scroll-mt-24 bg-white py-20 lg:py-28">
      <div className="container-site">
        <Reveal className="max-w-2xl">
          <SectionTitle id="approach-title" eyebrow={c.approach.eyebrow} title={c.approach.title} />
        </Reveal>
        <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {steps.map((step, i) => (
            <Reveal as="li" delay={i * 0.1}
              key={step.title}
              className={`relative flex flex-col rounded-xl p-7 lg:min-h-72 lg:p-8 ${i === 0 ? "bg-ink text-white" : "border border-line"}`}
            >
              <span className={`text-5xl leading-none font-light tabular-nums ${i === 0 ? "text-brand-yellow" : "text-ink/15"}`}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-12 text-xl font-semibold">{step.title}</h3>
              <p className={`mt-2 leading-relaxed ${i === 0 ? "text-white/70" : "text-muted"}`}>{step.text}</p>
              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className="absolute top-1/2 -right-3 z-10 hidden size-6 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-[0.6rem] text-ink lg:grid"
                >
                  <FontAwesomeIcon icon={faArrowRight} />
                </span>
              )}
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Client benefits (spec §06) on a black band. */
export function ConsultingBenefits({ benefits }: { benefits: string[] }) {
  return (
    <section aria-labelledby="benefits-title" className="bg-ink py-20 text-white lg:py-28">
      <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-5">
          <SectionTitle id="benefits-title" eyebrow={c.benefits.eyebrow} title={c.benefits.title} dark />
        </Reveal>
        <ul className="grid gap-px overflow-hidden rounded-xl bg-white/10 sm:grid-cols-2 lg:col-span-7">
          {benefits.map((b, i) => (
            <Reveal as="li" delay={i * 0.08} key={b} className="flex gap-4 bg-ink p-7">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-yellow text-ink">
                <FontAwesomeIcon icon={faCheck} aria-hidden className="text-xs" />
              </span>
              <p className="pt-1 leading-relaxed text-white/85">{b}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ConsultingFaq() {
  return (
    <section aria-labelledby="consulting-faq-title" className="bg-white py-20 lg:py-28">
      <div className="container-site grid gap-10 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-4">
          <SectionTitle id="consulting-faq-title" eyebrow={c.faq.eyebrow} title={c.faq.title} />
        </Reveal>
        <div className="border-t border-line lg:col-span-8">
          {c.faq.items.map((item) => (
            <details key={item.question} className="group border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-medium [&::-webkit-details-marker]:hidden">
                {item.question}
                <FontAwesomeIcon icon={faPlus} aria-hidden className="shrink-0 text-sm transition-transform group-open:rotate-45" />
              </summary>
              <p className="max-w-2xl pb-6 leading-relaxed text-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Closing yellow band — "Demander un diagnostic". */
export function ConsultingCta() {
  const cta = c.cta;
  return (
    <section aria-labelledby="consulting-cta-title" className="bg-brand-yellow py-20 text-ink lg:py-28">
      <div className="container-site grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
        <Reveal className="lg:col-span-7">
          <Eyebrow className="text-ink/70" markClassName="bg-ink">
            {cta.eyebrow}
          </Eyebrow>
          <h2 id="consulting-cta-title" className="mt-6 text-[2.2rem] leading-[1.05] font-semibold tracking-[-0.035em] sm:text-5xl lg:text-6xl">
            {cta.title}
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-5 lg:pb-2">
          <p className="max-w-md text-lg leading-relaxed text-ink/80">{cta.text}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link
              href={cta.primary.href}
              className="group inline-flex h-12 items-center gap-3 rounded-md bg-ink px-6 font-medium text-white transition-colors hover:bg-ink-soft"
            >
              {cta.primary.label}
              <FontAwesomeIcon icon={faArrowRight} aria-hidden className="text-xs text-brand-yellow transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href={cta.secondary.href}
              className="font-medium underline decoration-ink/30 decoration-2 underline-offset-[6px] transition-colors hover:decoration-ink"
            >
              {cta.secondary.label}
            </Link>
          </div>
          {contact.phones.length > 0 && (
            <p className="mt-6 text-sm text-ink/75">
              Ou appelez-nous au <PhoneLinks linkClassName="font-medium text-ink underline-offset-4 hover:underline" />
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
