import { homeFlags } from "@/data/flags";
import { testimonials } from "@/data/social-proof";
import "./extra.css";

/** Témoignages clients — masqué tant que le drapeau est faux ou qu'il n'y a pas de contenu réel. */
export function Testimonials() {
  if (!homeFlags.testimonials || testimonials.length === 0) return null;
  return (
    <section className="sec light-sec" id="temoignages" aria-labelledby="tm-t">
      <div className="wrap">
        <div className="kick"><i />Ils nous font confiance</div>
        <h2 className="big" id="tm-t">Ce que disent nos clients.</h2>
        <ul className="tm-list">
          {testimonials.map((t) => (
            <li key={t.author}>
              <figure>
                <blockquote>« {t.quote} »</blockquote>
                <figcaption>
                  <b>{t.author}</b>
                  {(t.role || t.company) && (
                    <span className="mono">{[t.role, t.company].filter(Boolean).join(" · ")}</span>
                  )}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
