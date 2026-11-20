import Link from "next/link";
import { consultingChain, consultingDomains, quoteHref } from "@/data/landing";
import { RevealText } from "@/components/scroll/RevealText";
import { Stagger } from "@/components/motion/Stagger";

/** Consulting (fond sombre) : titre qui se remplit au défilement, démarche 01–04 en apparition décalée. */
export function Consulting() {
  return (
    <section className="sec dark-sec" id="consulting" aria-labelledby="cs-t">
      <div className="wrap">
        <div className="cons">
          <div>
            <span className="badge">Notre offre phare</span>
            <div className="kick"><i />Consulting</div>
            <RevealText as="h2" className="big" id="cs-t" start="top 80%" end="bottom 50%">
              L’expertise qui fait la différence : analyser, conseiller, optimiser.
            </RevealText>
            <p className="intro">
              Nous analysons votre organisation transport et logistique pour réduire vos coûts et fluidifier vos
              opérations.
            </p>
            <p className="who">
              <b>Pour qui ?</b> Dirigeants, responsables achats, supply chain ou opérations, importateurs et
              exportateurs, entreprises industrielles et commerciales.
            </p>
            <div className="acts2">
              <Link className="btn" href={quoteHref("consulting")}>
                Demander un diagnostic
              </Link>
            </div>
          </div>
          <ul className="dom">
            {consultingDomains.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
        <Stagger className="chain">
          {consultingChain.map((c, i) => (
            <div key={c.title}>
              <small>{String(i + 1).padStart(2, "0")}</small>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
