import Link from "next/link";
import { CroppedImage } from "@/components/ui/CroppedImage";
import { categoryLabel } from "@/data/articles";
import { cn, formatDate } from "@/lib/utils";
import type { Article } from "@/types";

/** Article teaser: photo, category · date, title and excerpt. */
export function ArticleCard({ article, large, className }: { article: Article; large?: boolean; className?: string }) {
  return (
    <Link href={`/actualites/${article.slug}`} className={cn("group block", className)}>
      <div className={cn("relative overflow-hidden rounded-lg bg-paper", large ? "aspect-[16/10]" : "aspect-[4/3]")}>
        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.03]">
          <CroppedImage image={article.image} sizes={large ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"} />
        </div>
      </div>
      <p className="mt-5 text-xs font-medium tracking-[0.12em] text-muted uppercase">
        {categoryLabel[article.category]} · <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
      </p>
      <h3
        className={cn(
          "mt-3 leading-snug font-semibold decoration-brand-yellow decoration-2 underline-offset-4 group-hover:underline",
          large ? "text-2xl tracking-[-0.02em] sm:text-3xl" : "text-xl",
        )}
      >
        {article.title}
      </h3>
      <p className={cn("mt-2 leading-relaxed text-muted", large ? "max-w-2xl text-lg" : "line-clamp-2")}>{article.excerpt}</p>
    </Link>
  );
}

/** Featured article: large photo with the text alongside (stacked on mobile). */
export function FeaturedArticle({ article }: { article: Article }) {
  return (
    <Link href={`/actualites/${article.slug}`} className="group grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-paper lg:col-span-7">
        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.03]">
          <CroppedImage image={article.image} sizes="(min-width: 1024px) 60vw, 100vw" preload />
        </div>
      </div>
      <div className="lg:col-span-5">
        <p className="text-xs font-medium tracking-[0.12em] text-muted uppercase">
          {categoryLabel[article.category]} · <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time> ·{" "}
          {article.readingMinutes} min de lecture
        </p>
        <h2 className="mt-4 text-[1.75rem] leading-[1.15] font-semibold tracking-[-0.025em] decoration-brand-yellow decoration-2 underline-offset-4 group-hover:underline sm:text-4xl">
          {article.title}
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-muted">{article.excerpt}</p>
        <span className="mt-8 inline-flex h-12 items-center rounded-md bg-ink px-6 font-medium text-white transition-colors group-hover:bg-ink-soft">
          Lire l’article
        </span>
      </div>
    </Link>
  );
}
