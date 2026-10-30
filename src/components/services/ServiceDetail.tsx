import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCheck, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FinalCta } from "@/components/home/FinalCta";
import { CroppedImage } from "@/components/ui/CroppedImage";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { PageHeader, type Crumb } from "@/components/ui/PageHeader";
import { categoryLabels, serviceHref, services } from "@/data/services";
import { contact } from "@/data/site";
import { telHref } from "@/lib/utils";
import type { Service } from "@/types";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Service detail template (spec §06): promise, description, offerings, benefits,
 * optional steps and FAQ, a quote CTA and links to the other services.
 * Used by /services/[slug] and /consulting.
 */
export function ServiceDetail({ service, crumbs }: { service: Service; crumbs: Crumb[] }) {
  const others = services.filter((s) => s.slug !== service.slug);
  const quoteHref = `/devis?besoin=${service.slug}`;
  const isConsulting = service.slug === "consulting";

  return (
    <>
      <PageHeader crumbs={crumbs} eyebrow={categoryLabels[service.category]} title={service.title}>
        <p>{service.promise}</p>
      </PageHeader>

      <section aria-label="Présentation du service" className="bg-white py-14 lg:py-20">
        <div className="container-site grid gap-14 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-7">
            <p className="text-xl leading-relaxed text-ink/85 lg:text-2xl lg:leading-relaxed">{service.description}</p>

            <h2 className="mt-14 text-xs font-semibold tracking-[0.18em] text-muted uppercase">Prestations proposées</h2>
            <ul className="mt-5 border-t border-line">
              {service.offerings.map((item) => (
                <li key={item} className="flex gap-4 border-b border-line py-4 text-lg">
                  <span aria-hidden className="mt-2.5 size-1.5 shrink-0 bg-brand-yellow" />
                  {item}
                </li>
              ))}
            </ul>

            <h2 className="mt-14 text-xs font-semibold tracking-[0.18em] text-muted uppercase">Vos bénéfices</h2>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {service.benefits.map((item) => (
                <li key={item} className="flex gap-3 rounded-xl bg-paper p-5 leading-relaxed">
                  <FontAwesomeIcon icon={faCheck} aria-hidden className="mt-1 text-sm text-brand-yellow" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <aside className="lg:col-span-5">
            <div className="space-y-6 lg:sticky lg:top-28">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-paper">
                <CroppedImage image={service.image} sizes="(min-width: 1024px) 40vw, 100vw" decorative={false} preload />
              </div>
              <div className="rounded-xl bg-ink p-7 text-white">
                <span className="grid size-11 place-items-center rounded-full bg-brand-yellow text-ink">
                  <Icon name={service.icon} className="text-base" />
                </span>
                <p className="mt-5 text-xl font-semibold">{isConsulting ? "Un projet d’accompagnement ?" : "Un projet d’expédition ?"}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  Décrivez votre besoin, l’équipe vous répond avec une proposition adaptée.
                </p>
                <Link
                  href={quoteHref}
                  className="group mt-6 flex h-12 items-center justify-between gap-3 rounded-md bg-brand-yellow px-5 font-medium text-ink transition-colors hover:bg-white"
                >
                  {service.ctaLabel}
                  <FontAwesomeIcon icon={faArrowRight} aria-hidden className="text-xs transition-transform group-hover:translate-x-0.5" />
                </Link>
                {contact.phone && (
                  <p className="mt-4 text-sm text-white/70">
                    Ou appelez-nous au{" "}
                    <a href={telHref(contact.phone)} className="font-medium text-white hover:text-brand-yellow">
                      {contact.phone}
                    </a>
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {service.steps && service.steps.length > 0 && (
        <section aria-labelledby="steps-title" className="border-t border-line bg-paper py-16 lg:py-24">
          <div className="container-site">
            <Eyebrow className="text-muted">Déroulement</Eyebrow>
            <h2 id="steps-title" className="mt-5 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              {isConsulting ? "Les étapes de votre accompagnement" : "Les étapes de votre expédition"}
            </h2>
            <ol className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {service.steps.map((step, i) => (
                <Reveal as="li" delay={i * 0.1} key={step.title} className="relative border-t border-line pt-8">
                  <span aria-hidden className="absolute -top-[5px] left-0 size-2.5 bg-ink" />
                  <span className="text-4xl leading-none font-light text-ink/20 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{step.text}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>
      )}

      {service.faq && service.faq.length > 0 && (
        <section aria-labelledby="faq-title" className="border-t border-line bg-white py-16 lg:py-24">
          <div className="container-site grid gap-10 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-4">
              <Eyebrow className="text-muted">FAQ</Eyebrow>
              <h2 id="faq-title" className="mt-5 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                Questions fréquentes
              </h2>
            </Reveal>
            <div className="border-t border-line lg:col-span-8">
              {service.faq.map((item) => (
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
      )}

      <section aria-labelledby="others-title" className="border-t border-line bg-white py-16 lg:py-20">
        <div className="container-site">
          <h2 id="others-title" className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">
            Nos autres services
          </h2>
          <ul className="mt-6 flex flex-wrap gap-3">
            {others.map((s) => (
              <li key={s.slug}>
                <Link
                  href={serviceHref(s.slug)}
                  className="inline-flex h-11 items-center gap-3 rounded-full border border-line px-5 text-sm font-medium transition-colors hover:border-ink hover:bg-ink hover:text-white"
                >
                  <Icon name={s.icon} className="text-xs" />
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
