import Link from "next/link";
import { quoteHref, services, type ServiceArtKind } from "@/data/landing";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import type { IconName } from "@/types";
import { ServiceArt } from "./ServiceArt";
import { ServiceStack } from "./ServiceStack";
import "./services.css";

const ICONS: Record<ServiceArtKind, IconName> = {
  truck: "truck",
  ship: "ship",
  plane: "plane",
  customs: "file-check",
  logistics: "warehouse",
  consulting: "chart-line",
};

const pad = (n: number) => String(n).padStart(2, "0");

export function Services() {
  return (
    <section className="sec light-sec" id="services" aria-labelledby="svc-t">
      <div className="wrap">
        <div className="kick"><i />Nos services</div>
        <h2 className="big" id="svc-t">
          Transport, logistique et conseil, réunis chez un seul partenaire.
        </h2>
        <p className="intro">
          Route, mer ou air, formalités douanières, coordination des flux et consulting : nous choisissons avec
          vous la solution adaptée à votre volume, votre urgence et votre budget.
        </p>
        <ServiceStack>
          {services.map((s, i) => (
            <article key={s.title} className={`svc k-${s.tone}`} style={{ "--i": i } as React.CSSProperties}>
              <div className="in">
                <div className="txt">
                  <div className="top">
                    <span className="pill">
                      <span className="ico">
                        <ServiceIcon name={ICONS[s.art]} />
                      </span>
                      {s.pill}
                    </span>
                    <span className="svc-count">
                      <span className="svc-prog" aria-hidden="true">
                        {services.map((_, j) => (
                          <i key={j} className={j <= i ? "on" : undefined} />
                        ))}
                      </span>
                      <span>
                        <b>{pad(i + 1)}</b> <span className="of">/ {pad(services.length)}</span>
                      </span>
                    </span>
                  </div>
                  <div className="svc-body">
                    <h3>{s.title}</h3>
                    <p className="desc">{s.description}</p>
                  </div>
                  <div className="bottom">
                    <ul className="list">
                      {s.points.map((p) => (
                        <li key={p}>
                          <svg viewBox="0 0 16 16" aria-hidden="true">
                            <path d="M4 8.5l2.6 2.6L12 5.4" />
                          </svg>
                          {p}
                        </li>
                      ))}
                    </ul>
                    <div className="svc-actions">
                      <Link className="cta" href={quoteHref(s.href.split("/").pop())}>
                        {s.cta}
                      </Link>
                      <Link className="more" href={s.href} aria-label={`Découvrir le service ${s.title}`}>
                        Découvrir<span className="lg"> le service</span> <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
                <ServiceArt kind={s.art} />
              </div>
            </article>
          ))}
        </ServiceStack>
      </div>
    </section>
  );
}
