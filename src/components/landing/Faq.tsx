import Link from "next/link";
import { contact, faq } from "@/data/landing";
import { PhoneLinks } from "@/components/ui/PhoneLinks";

const pad = (n: number) => String(n).padStart(2, "0");

/** Questions fréquentes : liste numérotée (01, 02…), filets fins, icône +/–, bloc latéral vers le contact. */
export function Faq() {
  return (
    <section className="sec light-sec" id="faq" aria-labelledby="fq-t">
      <div className="wrap faq">
        <div className="faq-side">
          <div className="kick"><i />Questions fréquentes</div>
          <h2 className="big" id="fq-t">Vos questions, nos réponses.</h2>
          <aside className="faq-more" aria-labelledby="fq-more-t">
            <h3 id="fq-more-t">Encore des questions ?</h3>
            <p>Notre équipe vous répond : {contact.hours}.</p>
            <div className="faq-more-acts">
              <Link className="btn" href="/contact">
                Nous contacter
              </Link>
              <span className="faq-phones">
                <PhoneLinks />
              </span>
            </div>
          </aside>
        </div>
        <ol className="faq-list">
          {faq.map((item, i) => (
            <li key={item.q}>
              <details>
                <summary>
                  <span className="faq-n mono" aria-hidden="true">{pad(i + 1)}</span>
                  <span className="faq-q">{item.q}</span>
                  <span className="faq-ico" aria-hidden="true" />
                </summary>
                <p>{item.a}</p>
              </details>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
