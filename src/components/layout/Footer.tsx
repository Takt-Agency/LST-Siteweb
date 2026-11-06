import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { Logo } from "@/components/ui/Logo";
import { SoonBadge } from "@/components/ui/SoonBadge";
import { contact, footerNav, legalNav, site, socialLinks } from "@/data/site";
import { telHref } from "@/lib/utils";

/**
 * Site footer (spec §4.3): logo and short presentation, links to the main pages
 * and services, contact details, social links
 * if any, legal pages, a secondary quote CTA and the "Développé par Takt Agency" credit.
 */
export function Footer() {
  return (
    <footer data-page-root className="bg-ink text-white">
      <div className="container-site pt-16 pb-10 lg:pt-20">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-12 lg:gap-10">
          <div className="col-span-2 lg:col-span-4">
            <Logo tone="light" preload={false} className="w-36" />
            <p className="mt-6 max-w-sm leading-relaxed text-white/65">{site.description}</p>
            <Link
              href="/devis"
              className="group mt-8 inline-flex items-center gap-2.5 font-medium text-brand-yellow transition-colors hover:text-white"
            >
              Demander un devis
              <FontAwesomeIcon icon={faArrowRight} aria-hidden className="text-xs transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {footerNav.map((group) => (
            <nav key={group.title} aria-label={group.title} className="lg:col-span-2 lg:first-of-type:col-start-6">
              <h2 className="text-xs font-semibold tracking-[0.18em] text-white/50 uppercase">{group.title}</h2>
              <ul className="mt-5 space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="inline-flex items-center gap-2 text-white/80 transition-colors hover:text-white">
                      {link.label}
                      {link.soon && <SoonBadge />}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="col-span-2 lg:col-span-3 lg:col-start-10">
            <h2 className="text-xs font-semibold tracking-[0.18em] text-white/50 uppercase">Contact</h2>
            <ul className="mt-5 space-y-3 text-white/80">
              <li>
                {contact.phone ? (
                  <a href={telHref(contact.phone)} className="transition-colors hover:text-white">
                    {contact.phone}
                  </a>
                ) : (
                  <Placeholder>Téléphone à confirmer</Placeholder>
                )}
              </li>
              <li>
                {contact.email ? (
                  <a href={`mailto:${contact.email}`} className="break-all transition-colors hover:text-white">
                    {contact.email}
                  </a>
                ) : (
                  <Placeholder>E-mail à confirmer</Placeholder>
                )}
              </li>
              <li>{contact.openingHours ?? <Placeholder>Horaires à confirmer</Placeholder>}</li>
              <li>
                {contact.address ?? <Placeholder>Adresse à confirmer</Placeholder>}
              </li>
            </ul>
            {socialLinks.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                {socialLinks.map((s) => (
                  <li key={s.href}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-white/55 lg:flex-row lg:items-center lg:justify-between">
          <p>© {site.name}. Tous droits réservés.</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legalNav.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p>
            {site.agency.label}{" "}
            <a href={site.agency.url} target="_blank" rel="noopener noreferrer" className="font-medium text-white/80 underline-offset-4 hover:text-brand-yellow hover:underline">
              {site.agency.name}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function Placeholder({ children }: { children: string }) {
  return <span className="text-white/45 italic">{children}</span>;
}
