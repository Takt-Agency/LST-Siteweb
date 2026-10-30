import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { HorizontalScroller } from "@/components/ui/HorizontalScroller";
import { articles, categoryLabel } from "@/data/articles";
import { news } from "@/data/home";
import { formatDate } from "@/lib/utils";
import { Reveal } from "@/components/motion/Reveal";

/** Latest published articles, newest first. */
const latest = articles
  .filter((a) => a.status === "published")
  .toSorted((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  .slice(0, news.count);

/** Homepage §05-09 — latest articles in a horizontal scroller, with a link to the news page. */
export function News() {
  return (
    <section aria-labelledby="news-title" className="border-t border-line bg-white py-20 lg:py-28">
      <div className="container-site">
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow className="text-muted">{news.eyebrow}</Eyebrow>
            <h2 id="news-title" className="mt-5 text-[2rem] leading-[1.08] font-semibold tracking-[-0.03em] sm:text-[2.5rem] lg:text-5xl">
              {news.title}
            </h2>
          </div>
          <Link
            href={news.link.href}
            className="group inline-flex w-fit shrink-0 items-center gap-2.5 text-sm font-medium underline decoration-line decoration-2 underline-offset-[6px] transition-colors hover:decoration-brand-yellow"
          >
            {news.link.label}
            <FontAwesomeIcon icon={faArrowRight} aria-hidden className="text-xs transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <Reveal delay={0.1} className="mt-12 lg:mt-16">
          <HorizontalScroller label="Derniers articles">
            {latest.map((article) => (
              <li key={article.slug} className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[31%]">
                <Link href={`/actualites/${article.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-paper">
                    {/* Art-directed crop of a shared photo (see `photos` in src/data/site.ts). */}
                    <div className="absolute inset-0" style={{ scale: article.image.zoom, transformOrigin: article.image.position }}>
                      <Image
                        src={article.image.src}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 82vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        style={{ objectPosition: article.image.position }}
                      />
                    </div>
                  </div>
                  <p className="mt-5 text-xs font-medium tracking-[0.12em] text-muted uppercase">
                    {categoryLabel[article.category]} · <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
                  </p>
                  <h3 className="mt-3 text-xl leading-snug font-semibold decoration-brand-yellow decoration-2 underline-offset-4 group-hover:underline">
                    {article.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 leading-relaxed text-muted">{article.excerpt}</p>
                </Link>
              </li>
            ))}
          </HorizontalScroller>
        </Reveal>
      </div>
    </section>
  );
}
