import type { Metadata } from "next";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faNewspaper } from "@fortawesome/free-solid-svg-icons";
import { FinalCta } from "@/components/home/FinalCta";
import { FeaturedArticle } from "@/components/news/ArticleCard";
import { NewsList } from "@/components/news/NewsList";
import { PageHeader } from "@/components/ui/PageHeader";
import { newsPage, publishedArticles } from "@/data/articles";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Actualités",
  description: newsPage.intro,
  // Not indexed while the blog is in preparation.
  robots: site.newsEnabled ? undefined : { index: false },
};

export default function NewsPage() {
  if (!site.newsEnabled) return <NewsComingSoon />;
  const [featured, ...rest] = publishedArticles;

  return (
    <>
      <PageHeader crumbs={[{ label: "Accueil", href: "/" }, { label: "Actualités" }]} eyebrow={newsPage.eyebrow} title={newsPage.title}>
        <p>{newsPage.intro}</p>
      </PageHeader>

      {featured && (
        <section aria-label="À la une" className="bg-white pt-14 lg:pt-20">
          <div className="container-site">
            <p className="mb-6 text-xs font-semibold tracking-[0.18em] text-muted uppercase">À la une</p>
            <FeaturedArticle article={featured} />
          </div>
        </section>
      )}

      <section aria-label="Tous les articles" className="bg-white py-16 lg:py-24">
        <div className="container-site">
          <NewsList articles={rest} />
        </div>
      </section>

      <FinalCta />
    </>
  );
}

/** Shown while `site.newsEnabled` is false (articles not published yet). */
function NewsComingSoon() {
  return (
    <>
      <PageHeader crumbs={[{ label: "Accueil", href: "/" }, { label: "Actualités" }]} eyebrow={newsPage.eyebrow} title="Le blog arrive bientôt">
        <p>
          Nous préparons des articles et des conseils métier sur le transport, la logistique et la réglementation. Revenez bientôt !
        </p>
      </PageHeader>
      <section aria-label="Bientôt disponible" className="bg-white py-16 lg:py-24">
        <div className="container-site">
          <div className="flex flex-col items-start gap-6 rounded-2xl border border-dashed border-line p-8 sm:flex-row sm:items-center sm:justify-between lg:p-12">
            <div className="flex items-center gap-5">
              <span className="grid size-14 shrink-0 place-items-center rounded-full bg-brand-yellow text-ink">
                <FontAwesomeIcon icon={faNewspaper} aria-hidden className="text-xl" />
              </span>
              <div>
                <p className="text-xl font-semibold">En attendant, parlons de votre projet</p>
                <p className="mt-1 text-muted">Découvrez nos services ou contactez directement l’équipe.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href="/services"
                className="group inline-flex h-12 items-center gap-3 rounded-md bg-ink px-6 font-medium text-white transition-colors hover:bg-ink-soft"
              >
                Nos services
                <FontAwesomeIcon icon={faArrowRight} aria-hidden className="text-xs text-brand-yellow transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/contact" className="font-medium underline decoration-line decoration-2 underline-offset-[6px] hover:decoration-brand-yellow">
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
