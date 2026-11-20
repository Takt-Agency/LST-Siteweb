import Image from "next/image";
import Link from "next/link";
import { homeFlags } from "@/data/flags";
import { articles, categoryLabel } from "@/data/articles";
import { news } from "@/data/home";
import { formatDate } from "@/lib/utils";
import "./extra.css";

/**
 * Actualités : liste d'articles ; l'image de l'article survolé (ou focalisé) apparaît à droite.
 * Masqué tant que le drapeau est faux (les articles actuels sont des contenus de démonstration).
 */
export function HomeNews() {
  const items = articles.filter((a) => a.status === "published").slice(0, news.count);
  if (!homeFlags.news || items.length === 0) return null;
  return (
    <section className="sec light-sec" id="actualites" aria-labelledby="nw-t">
      <div className="wrap">
        <div className="nw-head">
          <div>
            <div className="kick"><i />{news.eyebrow}</div>
            <h2 className="big" id="nw-t">{news.title}</h2>
          </div>
          <Link className="link nw-all" href={news.link.href}>
            {news.link.label} →
          </Link>
        </div>
        <ul className="nw-list">
          {items.map((a) => (
            <li key={a.slug}>
              <Link href={`/actualites/${a.slug}`} className="nw-row">
                <span className="mono nw-meta">
                  {categoryLabel[a.category]} · {formatDate(a.publishedAt)}
                </span>
                <span className="nw-title">{a.title}</span>
                <span className="nw-arrow" aria-hidden="true">→</span>
                <span className="nw-img" aria-hidden="true">
                  <Image
                    src={a.image.src}
                    alt=""
                    fill
                    sizes="(max-width: 900px) 1px, 360px"
                    style={{ objectFit: "cover", objectPosition: a.image.position }}
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
