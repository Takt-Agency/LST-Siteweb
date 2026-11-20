"use client";

import { useRef, useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faBolt, faEarthAfrica, faHeadset, faSliders } from "@fortawesome/free-solid-svg-icons";
import { journeySteps, methodSteps, quoteHref, services, type ServiceArtKind } from "@/data/landing";
import { reasons } from "@/data/services";
import { method, whyLst } from "@/data/home";
import { keyFigures } from "@/data/site";
import { sequence, truckSequence, WHEEL_SRC } from "@/data/sequences";
import route from "@/data/city-route.json";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { FrameSequence } from "@/components/scroll/FrameSequence";
import { RotatingWheel } from "@/components/scroll/RotatingWheel";
import { SpeedHUD } from "@/components/scroll/SpeedHUD";
import { RevealText } from "@/components/scroll/RevealText";
import { SeqImage } from "@/components/scroll/SeqImage";
import type { IconName } from "@/types";
import type { OceanState } from "./Ocean";
import { useJourneyTimeline } from "./timeline";
import { AIR_FADE, SCENES, TOTAL } from "./scenes";
import "./journey.css";

const Ocean = dynamic(() => import("./Ocean"), { ssr: false });

const ICONS: Record<ServiceArtKind, IconName> = {
  truck: "truck",
  ship: "ship",
  plane: "plane",
  customs: "file-check",
  logistics: "warehouse",
  consulting: "chart-line",
};
const REASON_ICONS = [faHeadset, faSliders, faBolt, faEarthAfrica];
const pad = (n: number) => String(n).padStart(2, "0");

const SEQ = {
  side: truckSequence("truck-side"),
  rotate: truckSequence("truck-rotate"),
  top: truckSequence("truck-top"),
  load: truckSequence("reachstacker-load"),
  plane: sequence("plane-top"),
  ship: sequence("ship-top"),
  /** Embarquement : camion sans conteneur, et conteneur seul (même cadrage que truck-top). */
  topEmpty: sequence("truck-top-empty"),
  box: sequence("container-top"),
};

/** Nuages de la scène « Air » : [x %, y %, taille vw, image], en trois plans de profondeur. */
const CLOUDS = {
  far: [[-4, 2, 40, 1], [30, -4, 44, 2], [64, 6, 42, 3], [96, 24, 40, 4], [8, 40, 42, 4], [44, 34, 40, 1], [80, 56, 44, 2], [-2, 72, 44, 3], [36, 70, 42, 2], [70, 84, 40, 4]],
  mid: [[-6, 24, 50, 3], [40, 48, 52, 4], [88, 8, 48, 2], [70, 76, 46, 1], [18, 86, 48, 2]],
  near: [[30, -8, 60, 2], [96, 40, 64, 4], [10, 78, 58, 3]],
} as const;

/** Position d'une scène dans le défilement (pour les ancres et le focus clavier). */
const at = (u: number) => ({ "data-at": u }) as Record<string, number>;

export type JourneyLive = {
  load: { current: number };
  rotate: { current: number };
  distance: { current: number };
  ocean: { current: OceanState };
};

/**
 * Parcours réaliste au défilement (scène collante pilotée par une timeline GSAP) :
 * Air (avion au-dessus des nuages, atterrissage) → chargement du conteneur au port →
 * le camion roule (services) → bascule de caméra → route vue du ciel (méthode) → la mer (à propos).
 * Tous les textes sont dans le DOM (SSR). Sans JavaScript ou en reduced-motion : version statique.
 */
export function Journey() {
  const root = useRef<HTMLElement>(null);
  const [live] = useState<JourneyLive>(() => ({
    load: { current: 0 },
    rotate: { current: 0 },
    distance: { current: 0 },
    ocean: { current: { zoom: 1.35, shipX: 0.5, shipY: 0.52, shipLen: 0.5, shipBeam: 0.16, speed: 0.03, wake: 1 } },
  }));
  // Chargement des scènes lourdes armé à l'approche, dans l'ordre du parcours.
  const [armed, setArmed] = useState(0);
  const mode = useJourneyTimeline(root, live, setArmed);

  return (
    <section
      id="journey"
      ref={root}
      className="journey"
      data-mode={mode}
      style={{ "--total": TOTAL, "--fade": AIR_FADE } as CSSProperties}
      aria-label="Le parcours d’un envoi LST Express : par avion, puis par la route, puis par la mer"
    >
      {/* Ancres placées à la position de défilement de leur scène. */}
      <span id="methode" className="j-anchor" style={{ "--at": SCENES.city[0] } as CSSProperties} />
      <span id="apropos" className="j-anchor" style={{ "--at": SCENES.sea[0] + 1.6 } as CSSProperties} />

      <div className="j-stage">
        {/* ============ 1. AIR ============ */}
        <div className="j-scene j-s-air">
          <div className="j-vis" aria-hidden="true">
            <div className="j-ground">
              <div className="j-runway">
                <i className="j-runway-marks" />
              </div>
            </div>
            <div className="j-air-haze" />
            <div className="j-clouds j-cl-far">
              {CLOUDS.far.map(([x, y, s, n], i) => (
                <i key={i} style={{ left: `${x}%`, top: `${y}%`, width: `${s}vw`, backgroundImage: `url(/images/clouds/cloud-${n}.webp)` }} />
              ))}
            </div>
            <div className="j-plane-shadow">
              <SeqImage seq={SEQ.plane} />
            </div>
            <div className="j-clouds j-cl-mid">
              {CLOUDS.mid.map(([x, y, s, n], i) => (
                <i key={i} style={{ left: `${x}%`, top: `${y}%`, width: `${s}vw`, backgroundImage: `url(/images/clouds/cloud-${n}.webp)` }} />
              ))}
            </div>
            <div className="j-plane">
              <SeqImage seq={SEQ.plane} />
            </div>
            <div className="j-clouds j-cl-near">
              {CLOUDS.near.map(([x, y, s, n], i) => (
                <i key={i} style={{ left: `${x}%`, top: `${y}%`, width: `${s}vw`, backgroundImage: `url(/images/clouds/cloud-${n}.webp)` }} />
              ))}
            </div>
          </div>
          <div className="j-frame">
            <StepPanel step={journeySteps[0]} className="j-p-air j-p-card on-dark" data={at(SCENES.air[0] + 0.6)} />
          </div>
        </div>

        {/* ============ 2. INTRO ============ */}
        <div className="j-scene j-s-intro">
          <div className="j-frame j-intro-grid">
            <article className="j-panel j-p-intro on-light" {...at(SCENES.intro[0] + 0.6)}>
              <p className="j-step mono">
                <i aria-hidden="true" />
                De bout en bout
              </p>
              <RevealText as="h2" className="display j-intro-title" manual>
                Un seul interlocuteur, du devis à la livraison.
              </RevealText>
              <p className="j-intro-text">Décrivez-nous votre besoin, nous revenons vers vous.</p>
              <Link className="btn" href="/devis">
                Demander un devis
              </Link>
            </article>
            {/* Chiffres clés : affichés seulement quand LST les aura fournis (src/data/site.ts). */}
            {keyFigures.length > 0 && (
              <dl className="j-figures on-light">
                {keyFigures.slice(0, 3).map((k) => (
                  <div key={k.label}>
                    <dt className="mono">{k.label}</dt>
                    <dd className="display">{k.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>

        {/* ============ 3. CHARGEMENT AU PORT ============ */}
        <div className="j-scene j-s-load">
          <div className="j-vis" aria-hidden="true">
            <div className="j-port-bg" />
            <FrameSequence
              className="j-load-seq"
              frames={SEQ.load.frames}
              mobileFrames={SEQ.load.mobileFrames}
              progress={live.load}
              load={armed >= 1}
              posterFrame={SEQ.load.frames.count - 1}
            />
          </div>
          <div className="j-frame">
            <StepPanel step={journeySteps[1]} className="j-p-load on-light" data={at(SCENES.load[0] + 0.5)} />
          </div>
        </div>

        {/* ============ 4. LE CAMION ROULE (services) ============ */}
        <div className="j-scene j-s-side">
          <div className="j-vis" aria-hidden="true">
            <div className="j-ghost display">Nos services</div>
            <SeqImage seq={SEQ.side} className="j-side-static" />
            <div className="j-road">
              <i className="j-road-marks" />
            </div>
          </div>
          <div className="j-services">
            <p className="j-step mono on-dark">
              <i aria-hidden="true" />
              Nos services
            </p>
            <ul className="j-track">
              {services.map((s, i) => (
                <li
                  key={s.title}
                  className="j-card"
                  {...at(SCENES.side[0] + 0.5 + ((i + 0.5) / services.length) * (SCENES.side[1] - SCENES.side[0] - 0.9))}
                >
                  <div className="j-card-top">
                    <span className="j-card-ico">
                      <ServiceIcon name={ICONS[s.art]} />
                    </span>
                    <span className="mono j-card-n">
                      {pad(i + 1)} / {pad(services.length)}
                    </span>
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                  <ul className="j-card-points">
                    {s.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                  <div className="j-card-acts">
                    <Link className="j-card-more" href={s.href} aria-label={`Découvrir le service ${s.title}`}>
                      Découvrir le service <span aria-hidden="true">→</span>
                    </Link>
                    <Link className="j-card-cta" href={quoteHref(s.href.split("/").pop())}>
                      {s.cta}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ============ 5–6. ROUTE VUE DU CIEL (méthode) ============ */}
        <div className="j-scene j-s-city">
          <div className="j-vis" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element -- carte vectorielle, transformée en continu */}
            <img
              className="j-map"
              src="/images/journey/city-map.svg"
              width={route.width}
              height={route.height}
              alt=""
              decoding="async"
              fetchPriority="low"
              style={{ width: route.width, height: route.height }}
            />
          </div>
          <div className="j-frame">
            <article className="j-panel j-p-method on-dark" {...at(SCENES.city[0] + 0.4)}>
              <p className="j-step mono">
                <i aria-hidden="true" />
                {method.eyebrow}
              </p>
              <h2>Quatre étapes, de votre besoin à vos opérations.</h2>
              <p>{method.text}</p>
            </article>
          </div>
          <ol className="j-milestones">
            {methodSteps.map((s, i) => (
              <li
                key={s.title}
                className="j-milestone"
                data-side={route.milestones[i].side}
                {...at(SCENES.city[0] + 0.6 + route.milestones[i].t * (SCENES.city[1] - SCENES.city[0] - 0.8))}
              >
                <span className="mono j-milestone-n">{pad(i + 1)}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* ============ 7. LA MER (à propos) ============ */}
        <div className="j-scene j-s-sea">
          <div className="j-vis" aria-hidden="true">
            <div className="j-ocean">{armed >= 3 && <Ocean state={live.ocean} active={mode === "live"} />}</div>
            <SeqImage seq={SEQ.ship} className="j-ship" />
            {/* Conteneur LST posé dans son emplacement sur le pont (suit le navire). */}
            <SeqImage seq={SEQ.box} className="j-box j-box-ship" />
          </div>
          <div className="j-frame">
            <StepPanel step={journeySteps[2]} className="j-p-sea on-dark" data={at(SCENES.sea[0] + 2.4)} />
            <article className="j-panel j-p-about on-dark" {...at(SCENES.sea[0] + 3.8)}>
              <p className="j-step mono">
                <i aria-hidden="true" />
                {whyLst.eyebrow}
              </p>
              <h2>{whyLst.title}</h2>
              <p>{whyLst.text}</p>
              <Link className="j-about-cta" href={whyLst.cta.href}>
                {whyLst.cta.label} <FontAwesomeIcon icon={faArrowRight} aria-hidden />
              </Link>
            </article>
          </div>
          <ul className="j-reasons">
            {reasons.map((r, i) => (
              <li key={r.title} className="j-reason on-dark" data-i={i} {...at(SCENES.sea[0] + 4.1)}>
                <FontAwesomeIcon icon={REASON_ICONS[i % REASON_ICONS.length]} aria-hidden className="j-reason-ico" />
                <h3>{r.title}</h3>
                <p>{r.text}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* ============ Camion (commun aux scènes 4 à 6) ============ */}
        <div className="j-truck" aria-hidden="true">
          <div className="j-truck-side">
            <SeqImage seq={SEQ.side} />
            {SEQ.side.wheels.map((w, i) => (
              <RotatingWheel key={i} src={w.src ?? WHEEL_SRC} x={w.x} y={w.y} diameter={w.d} distance={live.distance} />
            ))}
          </div>
          <FrameSequence
            className="j-truck-rot"
            frames={SEQ.rotate.frames}
            mobileFrames={SEQ.rotate.mobileFrames}
            progress={live.rotate}
            load={armed >= 2}
          />
          <SeqImage seq={SEQ.top} className="j-truck-top" />
          <SeqImage seq={SEQ.topEmpty} className="j-truck-empty" />
        </div>
        {/* Conteneur soulevé du camion jusqu'au navire (embarquement). */}
        <SeqImage seq={SEQ.box} className="j-box j-box-lift" />

        <SpeedHUD className="j-speed" />
        <div className="hud j-hud" aria-hidden="true">
          {["Air", "Route", "Mer"].map((m) => (
            <div key={m}>
              <span>{m}</span>
              <b>
                <i />
              </b>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StepPanel({
  step,
  className,
  data,
}: {
  step: (typeof journeySteps)[number];
  className: string;
  data: Record<string, number>;
}) {
  return (
    <article className={`j-panel ${className}`} {...data}>
      <p className="j-step mono">
        <i aria-hidden="true" />
        {step.step}
      </p>
      <h2>{step.title}</h2>
      <p>{step.text}</p>
      <ul>
        {step.points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </article>
  );
}
