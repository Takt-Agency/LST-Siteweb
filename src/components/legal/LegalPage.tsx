import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { TODO, legalPages, type LegalPageData } from "@/data/legal";
import { cn, formatDate } from "@/lib/utils";

/**
 * Drops rows whose value LST has not supplied yet (`TODO` in src/data/legal.ts),
 * then sections left empty — they reappear once the value is filled in.
 */
function visibleSections(page: LegalPageData) {
  return page.sections
    .map((section) => ({
      ...section,
      content: section.content.filter((item) => typeof item === "string" || item[1] !== TODO),
    }))
    .filter((section) => section.content.length > 0);
}

/** Shared layout for the legal pages: side navigation + numbered sections. */
export function LegalPage({ page }: { page: LegalPageData }) {
  return (
    <>
      <PageHeader crumbs={[{ label: "Accueil", href: "/" }, { label: page.title }]} eyebrow="Informations légales" title={page.title}>
        <p>{page.intro}</p>
        <p className="mt-3 text-sm">
          Dernière mise à jour : <time dateTime={page.updatedAt}>{formatDate(page.updatedAt)}</time>
        </p>
      </PageHeader>

      <div className="bg-white py-14 lg:py-20">
        <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-16">
          <nav aria-label="Pages légales" className="lg:col-span-3">
            <ul className="flex flex-wrap gap-2 lg:sticky lg:top-28 lg:flex-col lg:gap-1">
              {legalPages.map((p) => {
                const active = p.slug === page.slug;
                return (
                  <li key={p.slug}>
                    <Link
                      href={`/${p.slug}`}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "block rounded-md px-4 py-2.5 text-sm transition-colors",
                        active ? "bg-ink font-medium text-white" : "border border-line text-ink/75 hover:text-ink lg:border-0 lg:hover:bg-paper",
                      )}
                    >
                      {p.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="max-w-3xl lg:col-span-9">
            {visibleSections(page).map((section, i) => (
              <section key={section.title} className="border-t border-line py-10 first:border-t-0 first:pt-0">
                <h2 className="flex gap-4 text-2xl font-semibold tracking-[-0.02em]">
                  <span className="pt-1 text-sm font-normal text-muted tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  {section.title}
                </h2>
                <div className="mt-5 space-y-4 pl-9 leading-relaxed text-ink/80">
                  {section.content.map((item, j) =>
                    typeof item === "string" ? (
                      <p key={j}>{item}</p>
                    ) : (
                      <dl key={j} className="grid gap-1 border-b border-line pb-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-6">
                        <dt className="text-sm text-muted">{item[0]}</dt>
                        <dd className="font-medium text-ink">{item[1]}</dd>
                      </dl>
                    ),
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
