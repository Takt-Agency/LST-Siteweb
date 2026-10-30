import Link from "next/link";
import { SoonBadge } from "@/components/ui/SoonBadge";
import { contact, socialLinks } from "@/data/site";
import { telHref } from "@/lib/utils";

/**
 * Slim utility bar above the navbar (tablet and up). Contact details come from
 * `src/data/site.ts`; a missing value shows an explicit "à confirmer" placeholder.
 */
export function Topbar() {
  return (
    <div className="hidden bg-ink text-xs text-white/60 md:block">
      <div className="container-site flex h-9 items-center justify-between gap-6">
        <ul className="flex items-center gap-6">
          <li>
            {contact.phone ? (
              <a href={telHref(contact.phone)} className="text-white/85 transition-colors hover:text-brand-yellow">
                {contact.phone}
              </a>
            ) : (
              <Placeholder>Téléphone à confirmer</Placeholder>
            )}
          </li>
          <li className="hidden lg:block">
            {contact.email ? (
              <a href={`mailto:${contact.email}`} className="transition-colors hover:text-brand-yellow">
                {contact.email}
              </a>
            ) : (
              <Placeholder>E-mail à confirmer</Placeholder>
            )}
          </li>
          <li>{contact.openingHours ?? <Placeholder>Horaires à confirmer</Placeholder>}</li>
        </ul>

        <ul className="flex items-center gap-6">
          <li>
            <Link href="/actualites" className="inline-flex items-center gap-1.5 transition-colors hover:text-white">
              Actualités
              <SoonBadge />
            </Link>
          </li>
          <li>
            <Link href="/mentions-legales" className="transition-colors hover:text-white">
              Mentions légales
            </Link>
          </li>
          {socialLinks.map((s) => (
            <li key={s.href}>
              <a href={s.href} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Placeholder({ children }: { children: string }) {
  return <span className="italic">{children}</span>;
}
