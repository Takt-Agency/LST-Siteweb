import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { transportServices } from "@/data/services";
import { publishedArticles } from "@/data/articles";
import { absUrl } from "@/lib/seo";

/**
 * Plan du site (/sitemap.xml) : pages indexables uniquement (pages légales en noindex exclues).
 * Pas de `lastModified: new Date()` : avec cacheComponents, une date « maintenant » au prérendu casse le build.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    { path: "/services", priority: 0.9 },
    ...transportServices.map((s) => ({ path: `/services/${s.slug}`, priority: 0.8 })),
    { path: "/consulting", priority: 0.8 },
    { path: "/devis", priority: 0.7 },
    { path: "/a-propos", priority: 0.6 },
    { path: "/contact", priority: 0.6 },
    ...(site.newsEnabled
      ? [{ path: "/actualites", priority: 0.5 }, ...publishedArticles.map((a) => ({ path: `/actualites/${a.slug}`, priority: 0.5 }))]
      : []),
  ];
  return pages.map(({ path, priority }) => ({ url: absUrl(path), priority }));
}
