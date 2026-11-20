import Image from "next/image";
import Link from "next/link";
import { contact } from "@/data/landing";
import { legalNav, site } from "@/data/site";
import { FooterMap } from "./FooterMap";

const serviceLinks = [
  { label: "Transport terrestre", href: "/services/transport-terrestre" },
  { label: "Fret maritime", href: "/services/fret-maritime" },
  { label: "Fret aérien", href: "/services/fret-aerien" },
  { label: "Transit & douane", href: "/services/transit-douane" },
  { label: "Solutions logistiques", href: "/services/solutions-logistiques" },
  { label: "Consulting", href: "/consulting" },
];

const companyLinks = [
  { label: "À propos", href: "/a-propos" },
  { label: "Notre méthode", href: "/#methode" },
  { label: "Questions fréquentes", href: "/#faq" },
  { label: "Actualités", href: "/actualites" },
  { label: "Contact", href: "/contact" },
  { label: "Demander un devis", href: "/devis" },
];

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <FooterMap />
        <div className="cols">
          <div>
            <Link className="brand" href="/">
              <Image
                className="logo-full"
                src="/brand/lst-express-logo-signature.png"
                width={859}
                height={174}
                alt="LST Express, Logistique, Service, Transport"
              />
            </Link>
            <p className="tag">
              LST Express accompagne les entreprises avec des solutions de transport, de logistique et de
              consulting, en Afrique et à l’international.
            </p>
          </div>
          <div>
            <h4>Services</h4>
            <ul>
              {serviceLinks.map((l) => (
                <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Entreprise</h4>
            <ul>
              {companyLinks.map((l) => (
                <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li><a href={contact.phoneHref}>{contact.phone}</a></li>
              <li><a href={`mailto:${contact.email}`}>{contact.email}</a></li>
              <li>{contact.hours}</li>
              <li>{contact.address}</li>
            </ul>
          </div>
        </div>
        <div className="legal">
          <span>© 2026 LST Express. Tous droits réservés.</span>
          <span>
            {legalNav.map((l, i) => (
              <span key={l.href}>
                {i > 0 && " · "}
                <Link href={l.href}>{l.label}</Link>
              </span>
            ))}
            {" · "}
            {site.agency.label}{" "}
            <a href={site.agency.url} target="_blank" rel="noopener noreferrer">
              {site.agency.name}
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
