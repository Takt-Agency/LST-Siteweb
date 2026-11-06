import type { Metadata } from "next";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { ContactForm } from "@/components/contact/ContactForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { contactPage } from "@/data/contact";
import { contact } from "@/data/site";
import { Reveal } from "@/components/motion/Reveal";
import { PhoneLinks } from "@/components/ui/PhoneLinks";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez LST Express : coordonnées, formulaire de contact et localisation.",
};

export default function ContactPage() {
  const details = [
    {
      label: contact.phones.length > 1 ? "Téléphones" : "Téléphone",
      value: contact.phones.length > 0 ? <PhoneLinks stacked linkClassName="decoration-brand-yellow decoration-2 underline-offset-4 hover:underline" /> : null,
      href: undefined,
    },
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

    </>
  );
}
