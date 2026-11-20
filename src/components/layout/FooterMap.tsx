import dots from "@/data/world-dots.json";
import { NABEUL } from "@/data/hero";

/** Carte du monde en points (décorative) avec un marqueur pulsant sur Nabeul, siège de LST Express. */
export function FooterMap() {
  const x = ((NABEUL.lon + 180) / 360) * 100;
  const y = ((dots.latTop - NABEUL.lat) / (dots.latTop - dots.latBottom)) * 100;
  return (
    <div className="foot-map" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element -- SVG statique léger (30 Ko), décoratif */}
      <img src="/images/world-dots.svg" alt="" width={dots.width} height={dots.height} loading="lazy" decoding="async" />
      <span className="foot-pin" style={{ left: `${x}%`, top: `${y}%` }}>
        <i />
        <b className="mono">Nabeul, Tunisie</b>
      </span>
    </div>
  );
}
