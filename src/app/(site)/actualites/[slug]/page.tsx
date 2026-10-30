import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { ArticleCard } from "@/components/news/ArticleCard";
import { CroppedImage } from "@/components/ui/CroppedImage";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { categoryLabel, getArticle, getRelatedArticles, publishedArticles } from "@/data/articles";
import { site } from "@/data/site";
import { formatDate } from "@/lib/utils";
import type { ArticleBlock } from "@/types";

export function generateStaticParams() {
  return publishedArticles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/actualites/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!site.newsEnabled || !article) return {};
  return { title: article.title, description: article.excerpt };
}

function Block({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "heading":
      return <h2 className="mt-12 text-2xl font-semibold tracking-[-0.02em]">{block.text}</h2>;
    case "list":
      return (
        <ul className="mt-6 space-y-3">
          {block.items?.map((item) => (
            <li key={item} className="flex gap-4">
              <span aria-hidden className="mt-3 size-1.5 shrink-0 bg-brand-yellow" />
              {item}
            </li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote className="my-10 border-l-2 border-brand-yellow pl-6 text-2xl leading-snug font-medium tracking-[-0.01em] text-ink">
          {block.text}
        </blockquote>
      );
    default:
      return <p className="mt-6">{block.text}</p>;
  }
}

/** Params are read inside <Suspense> so client navigations get an instant shell. */
export default function ArticlePage({ params }: PageProps<"/actualites/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ArticleContent params={params} />
    </Suspense>
  );
}

async function ArticleContent({ params }: { params: PageProps<"/actualites/[slug]">["params"] }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!site.newsEnabled || !article || article.status !== "published") notFound();
  const related = getRelatedArticles(article, 3);

  return (
    <>
      <article>
        <header className="bg-white pt-10 pb-12 lg:pt-14 lg:pb-16">
          <div className="container-site">
            <nav aria-label="Fil d'Ariane">
              <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
                <li>
                  <Link href="/" className="hover:text-ink">
                    Accueil
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li>
                  <Link href="/actualites" className="hover:text-ink">
                    Actualités
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li aria-current="page" className="line-clamp-1 text-ink">
                  {article.title}
                </li>
              </ol>
            </nav>
            <div className="mx-auto mt-12 max-w-3xl lg:mt-16">
              <p className="text-xs font-medium tracking-[0.12em] text-muted uppercase">
                {categoryLabel[article.category]} · <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time> ·{" "}
                {article.readingMinutes} min de lecture
              </p>
              <h1 className="mt-5 text-[2.2rem] leading-[1.08] font-semibold tracking-[-0.035em] sm:text-5xl">{article.title}</h1>
              <p className="mt-6 text-xl leading-relaxed text-muted">{article.excerpt}</p>
              <p className="mt-8 border-t border-line pt-6 text-sm">
                Par <span className="font-medium">{article.author}</span>
              </p>
            </div>
          </div>
        </header>

        <div className="bg-white">
          <div className="container-site">
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-paper lg:aspect-[21/9]">
              <CroppedImage image={article.image} sizes="(min-width: 1344px) 1280px, 100vw" decorative={false} preload />
            </div>
          </div>
        </div>

        <div className="bg-white py-14 lg:py-20">
          <div className="container-site">
            <div className="mx-auto max-w-3xl text-lg leading-relaxed text-ink/85">
              {article.body.map((block, i) => (
                <Block key={i} block={block} />
              ))}
            </div>
            <div className="mx-auto mt-16 max-w-3xl border-t border-line pt-8">
              <Link href="/actualites" className="group inline-flex items-center gap-3 font-medium">
                <FontAwesomeIcon icon={faArrowLeft} aria-hidden className="text-xs transition-transform group-hover:-translate-x-0.5" />
                Toutes les actualités
              </Link>
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="border-t border-line bg-paper py-16 lg:py-24">
          <div className="container-site">
            <div className="flex items-end justify-between gap-6">
              <h2 id="related-title" className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                À lire aussi
              </h2>
              <Link href="/actualites" className="group hidden items-center gap-2 text-sm font-medium sm:inline-flex">
                Toutes les actualités
                <FontAwesomeIcon icon={faArrowRight} aria-hidden className="text-xs transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <ul className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <li key={a.slug}>
                  <ArticleCard article={a} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
