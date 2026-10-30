import type { Metadata } from "next";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { ContactForm } from "@/components/contact/ContactForm";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageHeader } from "@/components/ui/PageHeader";
import { contactPage } from "@/data/contact";
import { contact } from "@/data/site";
import { telHref } from "@/lib/utils";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez LST Express : coordonnées, formulaire de contact et localisation.",
};

export default function ContactPage() {
  const details = [
    { label: "Téléphone", value: contact.phone, href: contact.phone ? telHref(contact.phone) : undefined },
    { label: "E-mail", value: contact.email, href: contact.email ? `mailto:${contact.email}` : undefined },
    { label: "Horaires", value: contact.openingHours },
    { label: "Adresse", value: contact.address },
  ];

  return (
    <>
      <PageHeader crumbs={[{ label: "Accueil", href: "/" }, { label: "Contact" }]} eyebrow={contactPage.eyebrow} title={contactPage.title}>
        <p>{contactPage.intro}</p>
      </PageHeader>

      {/* Form + contact details */}
      <section aria-labelledby="form-title" className="bg-white py-16 lg:py-24">
        <div className="container-site grid gap-16 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-7">
            <h2 id="form-title" className="mb-8 text-2xl font-semibold tracking-[-0.02em]">
              {contactPage.formTitle}
            </h2>
            <ContactForm />
          </Reveal>

          <aside className="lg:col-span-4 lg:col-start-9">
            <h2 className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">{contactPage.detailsTitle}</h2>
            <dl className="mt-5 border-t border-line">
              {details.map((row) => (
                <div key={row.label} className="border-b border-line py-4">
                  <dt className="text-sm text-muted">{row.label}</dt>
                  <dd className="mt-1 text-lg font-medium">
                    {row.value ? (
                      row.href ? (
                        <a href={row.href} className="break-all decoration-brand-yellow decoration-2 underline-offset-4 hover:underline">
                          {row.value}
                        </a>
                      ) : (
                        row.value
                      )
                    ) : (
                      <span className="text-base font-normal text-muted italic">À confirmer</span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 rounded-xl bg-ink p-7 text-white">
              <h2 className="text-xl font-semibold">{contactPage.quote.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{contactPage.quote.text}</p>
              <Link
                href={contactPage.quote.cta.href}
                className="group mt-6 inline-flex h-11 items-center gap-3 rounded-md bg-brand-yellow px-5 text-sm font-medium text-ink transition-colors hover:bg-white"
              >
                {contactPage.quote.cta.label}
                <FontAwesomeIcon icon={faArrowRight} aria-hidden className="text-xs transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Location (spec §7.3) — the Google Maps embed is added once the address is confirmed */}
      <section aria-labelledby="location-title" className="border-t border-line bg-paper py-16 lg:py-24">
        <div className="container-site grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
          <Reveal className="lg:col-span-4">
            <Eyebrow className="text-muted">{contactPage.location.eyebrow}</Eyebrow>
            <h2 id="location-title" className="mt-5 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              {contactPage.location.title}
            </h2>
            <p className="mt-6 text-lg">{contact.address ?? <span className="text-muted italic">Adresse à confirmer</span>}</p>
            {contactPage.location.practical.length > 0 && (
              <ul className="mt-4 space-y-1 text-muted">
                {contactPage.location.practical.map((info) => (
                  <li key={info}>{info}</li>
                ))}
              </ul>
            )}
            {contact.mapsUrl ? (
              <a
                href={contact.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-8 inline-flex h-12 items-center gap-3 rounded-md bg-ink px-6 font-medium text-white transition-colors hover:bg-ink-soft"
              >
                Itinéraire
                <FontAwesomeIcon icon={faArrowRight} aria-hidden className="text-xs text-brand-yellow" />
              </a>
            ) : (
              <p className="mt-8 text-sm text-muted">Le bouton « Itinéraire » sera disponible dès que l&apos;adresse sera confirmée.</p>
            )}
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-8">
            <div className="bg-dots relative grid aspect-[16/10] place-items-center overflow-hidden rounded-xl border border-line bg-white sm:aspect-[16/8]">
              <div className="relative text-center">
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-ink text-brand-yellow">
                  <FontAwesomeIcon icon={faLocationDot} aria-hidden className="text-xl" />
                </span>
                <p className="mt-5 font-medium">Carte Google Maps</p>
                <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
                  Intégrée après confirmation de l&apos;adresse, et chargée avec votre accord aux cookies.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
