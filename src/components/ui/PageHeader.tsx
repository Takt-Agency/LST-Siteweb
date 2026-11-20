import Link from "next/link";
import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { JsonLd } from "@/components/seo/JsonLd";
import { absUrl } from "@/lib/seo";

export interface Crumb {
  label: string;
  href?: string;
}

/** Inner-page header: breadcrumb, eyebrow, large title and optional intro. */
export function PageHeader({
  crumbs,
  eyebrow,
  title,
  children,
}: {
  crumbs: Crumb[];
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="border-b border-line bg-white pt-10 pb-14 lg:pt-14 lg:pb-20">
      <div className="container-site">
        <nav aria-label="Fil d'Ariane">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
            {crumbs.map((crumb, i) => (
              <li key={crumb.label} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden>/</span>}
                {crumb.href ? (
                  <Link href={crumb.href} prefetch={crumb.href === "/" ? false : undefined} className="transition-colors hover:text-ink">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-ink">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        {/* Fil d'Ariane pour les moteurs de recherche (dernière étape = page courante, sans lien). */}
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: crumbs.map((c, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: c.label,
              ...(c.href ? { item: absUrl(c.href) } : {}),
            })),
          }}
        />
        <div className="mt-10 animate-rise lg:mt-14">
          <Eyebrow className="text-muted">{eyebrow}</Eyebrow>
          <h1 className="mt-5 max-w-3xl text-[2.4rem] leading-[1.04] font-semibold tracking-[-0.035em] sm:text-5xl lg:text-6xl">{title}</h1>
          {children && <div className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{children}</div>}
        </div>
      </div>
    </header>
  );
}
