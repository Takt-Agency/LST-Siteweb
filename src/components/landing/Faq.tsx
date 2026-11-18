import { faq } from "@/data/landing";

export function Faq() {
  return (
    <section className="sec light-sec" id="faq" aria-labelledby="fq-t">
      <div className="wrap faq">
        <div>
          <div className="kick"><i />Questions fréquentes</div>
          <h2 className="big" id="fq-t">Vos questions, nos réponses.</h2>
        </div>
        <div>
          {faq.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
