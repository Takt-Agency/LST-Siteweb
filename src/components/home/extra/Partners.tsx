import Image from "next/image";
import { homeFlags } from "@/data/flags";
import { partners } from "@/data/social-proof";
import "./extra.css";

/** Logos partenaires — masqué tant que le drapeau est faux ou qu'il n'y a pas de logos réels. */
export function Partners() {
  if (!homeFlags.partners || partners.length === 0) return null;
  return (
    <section className="sec dark-sec" id="partenaires" aria-labelledby="pt-t">
      <div className="wrap">
        <div className="kick"><i />Partenaires</div>
        <h2 className="big" id="pt-t">Un réseau de partenaires de confiance.</h2>
        <ul className="pt-list">
          {partners.map((p) => {
            const logo = <Image src={p.logo.src} width={p.logo.width} height={p.logo.height} alt={p.name} />;
            return (
              <li key={p.name}>
                {p.href ? (
                  <a href={p.href} target="_blank" rel="noopener noreferrer">
                    {logo}
                  </a>
                ) : (
                  logo
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
