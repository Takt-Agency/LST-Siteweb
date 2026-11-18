import { methodSteps } from "@/data/landing";

export function Method() {
  return (
    <section className="sec dark-sec" id="methode" aria-labelledby="pr-t">
      <div className="wrap">
        <div className="kick"><i />Notre méthode</div>
        <h2 className="big" id="pr-t">Quatre étapes, de votre besoin à vos opérations.</h2>
        <ol className="steps">
          {methodSteps.map((s) => (
            <li key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
