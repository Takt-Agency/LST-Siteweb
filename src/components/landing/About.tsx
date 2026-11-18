import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faBolt, faEarthAfrica, faHeadset, faSliders } from "@fortawesome/free-solid-svg-icons";
import { whyLst } from "@/data/home";
import { reasons } from "@/data/services";
import "./about.css";

/** Une icône par argument, dans l'ordre de `reasons` (src/data/services.ts). */
const reasonIcons = [faHeadset, faSliders, faBolt, faEarthAfrica];

/** « Pourquoi LST Express » : introduction + 4 arguments dans une grille à filets (repris du site en ligne). */
export function About() {
  return (
    <section className="sec light-sec" id="apropos" aria-labelledby="wh-t">
      <div className="wrap reasons">
        <div className="reasons-intro">
          <p className="reasons-eyebrow">
            <i aria-hidden="true" />
            {whyLst.eyebrow}
          </p>
          <h2 id="wh-t">{whyLst.title}</h2>
          <p className="reasons-text">{whyLst.text}</p>
          <Link className="reasons-cta" href={whyLst.cta.href}>
            {whyLst.cta.label}
            <FontAwesomeIcon icon={faArrowRight} aria-hidden />
          </Link>
        </div>

        <ul className="reasons-grid">
          {reasons.map((reason, i) => (
            <li key={reason.title}>
              <FontAwesomeIcon icon={reasonIcons[i % reasonIcons.length]} aria-hidden className="reasons-ico" />
              <h3>{reason.title}</h3>
              <p>{reason.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
