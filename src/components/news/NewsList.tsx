"use client";

import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import { ArticleCard } from "@/components/news/ArticleCard";
import { articleCategories } from "@/data/articles";
import { cn, normalize, paginate } from "@/lib/utils";
import type { Article } from "@/types";
import { Reveal } from "@/components/motion/Reveal";

const PER_PAGE = 6;

/** Article grid with category tabs, local search and pagination (all client-side). */
export function NewsList({ articles }: { articles: Article[] }) {
  const [category, setCategory] = useState<string>("tous");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return articles.filter(
      (a) => (category === "tous" || a.category === category) && (!q || normalize(`${a.title} ${a.excerpt}`).includes(q)),
    );
  }, [articles, category, query]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pages);
  const visible = paginate(filtered, current, PER_PAGE);

  return (
    <div>
      <div className="flex flex-col gap-5 border-b border-line pb-8 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Filtrer par catégorie" className="flex flex-wrap gap-2">
          {articleCategories.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={category === c.id}
              onClick={() => {
                setCategory(c.id);
                setPage(1);
              }}
              className={cn(
                "h-10 rounded-full border px-5 text-sm font-medium transition-colors",
                category === c.id ? "border-ink bg-ink text-white" : "border-line text-ink/70 hover:border-ink hover:text-ink",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-80">
          <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher un article"
            aria-label="Rechercher un article"
            className="h-11 w-full rounded-full border border-line bg-white pr-10 pl-11 text-sm outline-none placeholder:text-ink/40 focus:border-ink [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Effacer la recherche" className="absolute top-1/2 right-3 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-paper hover:text-ink">
              <FontAwesomeIcon icon={faXmark} aria-hidden className="text-xs" />
            </button>
          )}
        </div>
      </div>

      <p aria-live="polite" className="mt-6 text-sm text-muted">
        {filtered.length} article{filtered.length > 1 ? "s" : ""}
      </p>

      {visible.length > 0 ? (
        <ul className="mt-8 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((a) => (
            <Reveal as="li" key={a.slug}>
              <ArticleCard article={a} />
            </Reveal>
          ))}
        </ul>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-line px-6 py-16 text-center">
          <p className="text-lg font-medium">Aucun article ne correspond à votre recherche.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("tous");
            }}
            className="mt-4 font-medium underline decoration-line decoration-2 underline-offset-[6px] hover:decoration-brand-yellow"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-16 flex items-center justify-center gap-2">
          <button type="button" disabled={current === 1} onClick={() => setPage(current - 1)} aria-label="Page précédente" className="grid size-11 place-items-center rounded-full border border-line hover:border-ink disabled:opacity-30">
            <FontAwesomeIcon icon={faArrowLeft} aria-hidden className="text-xs" />
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              aria-current={n === current ? "page" : undefined}
              className={cn("grid size-11 place-items-center rounded-full text-sm font-medium", n === current ? "bg-ink text-white" : "hover:bg-paper")}
            >
              {n}
            </button>
          ))}
          <button type="button" disabled={current === pages} onClick={() => setPage(current + 1)} aria-label="Page suivante" className="grid size-11 place-items-center rounded-full border border-line hover:border-ink disabled:opacity-30">
            <FontAwesomeIcon icon={faArrowRight} aria-hidden className="text-xs" />
          </button>
        </nav>
      )}
    </div>
  );
}
