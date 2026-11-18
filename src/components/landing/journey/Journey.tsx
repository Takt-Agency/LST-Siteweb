"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { journeySteps } from "@/data/landing";
import { PlaneShape, PlaneSilhouette } from "@/components/landing/PlaneShape";
import { ShipShape, TruckShape } from "@/components/landing/Vehicles";
import { CLOUD_SHADOW_OFFSET, cloudShadow, cloudTexture, scene, skyClouds } from "./scene";
import { startJourney } from "./animate";


/**
 * Hero : parcours d'un envoi animé au défilement (avion, puis camion, puis bateau).
 * La section fait 700 vh ; la scène reste collée à l'écran pendant que l'on défile.
 */
export function Journey() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return startJourney(ref.current);
  }, []);

  return (
    <section
      id="journey"
      ref={ref}
      aria-label="Le parcours d’un envoi LST Express : par avion, par camion, puis par bateau"
    >
      <div id="stage">
        <svg id="map" aria-hidden="true">
          <defs>
            <pattern id="grid" width="200" height="200" patternUnits="userSpaceOnUse">
              <path d="M200 0H0V200" fill="none" stroke="#F2F3F5" strokeOpacity=".045" strokeWidth="2" />
            </pattern>
            {/* mer : vaguelettes claires sur fond bleu (#stage) */}
            <pattern id="ripple" width="120" height="60" patternUnits="userSpaceOnUse">
              <path d="M0 30q15-8 30 0t30 0" fill="none" stroke="#9fd8ff" strokeOpacity=".13" strokeWidth="2" />
              <path d="M66 52q10-5 20 0" fill="none" stroke="#9fd8ff" strokeOpacity=".08" strokeWidth="1.5" />
            </pattern>
            {/* ciel de l'introduction : même bleu profond que la mer (--water, #0b2e4c), à peine nuancé,
                pour que le passage du ciel à la mer soit continu ; léger halo bleu clair */}
            <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0a2844" />
              <stop offset=".5" stopColor="#0b2e4c" />
              <stop offset="1" stopColor="#0e3656" />
            </linearGradient>
            <radialGradient id="hazeG" cx="70%" cy="35%" r="60%">
              <stop offset="0" stopColor="#9fd8ff" stopOpacity=".12" />
              <stop offset="1" stopColor="#9fd8ff" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g id="cam">
            <rect x="-3000" y="-2000" width="11000" height="7000" fill="url(#ripple)" />
            {/* hauts-fonds : dégradé turquoise le long de la côte (traits superposés, sans filtre coûteux) */}
            <g fill="none" stroke="#2fa3d6" strokeLinejoin="round">
              <path d={LAND} strokeWidth="190" strokeOpacity=".07" />
              <path d={LAND} strokeWidth="120" strokeOpacity=".09" />
              <path d={LAND} strokeWidth="64" strokeOpacity=".13" />
              <path d={LAND} strokeWidth="26" stroke="#7fd3f2" strokeOpacity=".22" />
            </g>
            {/* terre */}
            <path id="land" fill="#1b1c1f" stroke="#2c2f35" strokeWidth="4" d={LAND} />
            <g id="blocks">
              {scene.blocks.map((b, i) => (
                <rect key={i} x={b.x} y={b.y} width={b.width} height={b.height} rx="3" fill={b.fill} opacity={b.opacity} />
              ))}
            </g>
            <g id="roads" fill="none" stroke="#2d2f35" strokeLinecap="round">
              {scene.roads.map((r, i) => (
                <path key={i} d={r.d} strokeWidth={r.strokeWidth} />
              ))}
            </g>

            {/* aéroport */}
            <g id="airport">
              <rect x="1150" y="560" width="760" height="330" rx="10" fill="#202125" />
              <rect x="1210" y="676" width="620" height="48" fill="#2a2c31" />
              <path d="M1240 700H1800" stroke="#F2F3F5" strokeOpacity=".55" strokeWidth="3" strokeDasharray="26 22" />
              <g fill="#F2F3F5" fillOpacity=".55">
                {[1218, 1808].flatMap((x) =>
                  [682, 690, 706, 714].map((y) => <rect key={`${x}-${y}`} x={x} y={y} width="14" height="4" />),
                )}
              </g>
              <path d="M1260 760H1790M1300 724V760M1700 724V760" stroke="#2a2c31" strokeWidth="16" />
              <rect x="1380" y="780" width="260" height="56" rx="4" fill="#2c2e33" />
              <rect x="1756" y="740" width="128" height="96" rx="4" fill="#26282d" />
              <path d="M1820 836V1040" stroke="#2d2f35" strokeWidth="22" />
              <path d="M1100 1040H1900" stroke="#2d2f35" strokeWidth="22" />
            </g>

            {/* port */}
            <g id="port">
              <rect x="2700" y="1380" width="300" height="420" fill="#202125" />
              <g id="stacks">
                {scene.stacks.map((b, i) => (
                  <rect key={i} x={b.x} y={b.y} width={b.width} height={b.height} fill={b.fill} opacity={b.opacity} />
                ))}
              </g>
              <rect x="2990" y="1590" width="480" height="34" fill="#2a2c31" />
              <rect x="2990" y="1760" width="380" height="30" fill="#2a2c31" />
              <g fill="#F8B80B">
                <rect x="3080" y="1580" width="10" height="54" />
                <rect x="3200" y="1580" width="10" height="54" />
                <rect x="3320" y="1580" width="10" height="54" />
              </g>
              <g fill="#3d4148">
                <rect x="3074" y="1576" width="22" height="8" />
                <rect x="3194" y="1576" width="22" height="8" />
                <rect x="3314" y="1576" width="22" height="8" />
              </g>
            </g>

            <rect x="-3000" y="-2000" width="11000" height="7000" fill="url(#grid)" />

            {/* ombres des nuages au sol (visibles pendant le vol) */}
            <g id="cshadows" opacity="0">
              {skyClouds.map(([x, y, size], i) => (
                <image
                  key={i}
                  href={cloudShadow(i)}
                  x={x - size / 2 + CLOUD_SHADOW_OFFSET.x}
                  y={y - size * 0.31 + CLOUD_SHADOW_OFFSET.y}
                  width={size}
                  height={size * 0.62}
                  preserveAspectRatio="none"
                />
              ))}
            </g>

            {/* itinéraires */}
            <g fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path id="bA" stroke="#F2F3F5" strokeOpacity=".28" d={ROUTE_AIR} />
              <path id="bR" stroke="#F2F3F5" strokeOpacity=".28" d={ROUTE_ROAD} />
              <path id="bS" stroke="#F2F3F5" strokeOpacity=".28" d={ROUTE_SEA} />
              <path id="rA" stroke="#F8B80B" d={ROUTE_AIR} />
              <path id="rR" stroke="#F8B80B" d={ROUTE_ROAD} />
              <path id="rS" stroke="#F8B80B" d={ROUTE_SEA} />
            </g>

            {/* plateformes */}
            <g id="hubs">
              <g className="hub" data-x="1820" data-y="790">
                <circle className="ring" fill="none" stroke="#F8B80B" />
                <circle className="dot" fill="#F8B80B" />
              </g>
              <g className="hub" data-x="2930" data-y="1540">
                <circle className="ring" fill="none" stroke="#F8B80B" />
                <circle className="dot" fill="#F8B80B" />
              </g>
            </g>
            <text className="lbl" data-x="1230" data-y="610">Aéroport</text>
            <text className="lbl sub" data-x="1230" data-y="610" data-dy="1.25">Fret aérien</text>
            <text className="lbl" data-x="2720" data-y="1350">Port</text>
            <text className="lbl sub" data-x="2720" data-y="1350" data-dy="1.25">Fret maritime</text>
            <text className="lbl" data-x="1990" data-y="1000">Transit &amp; douane</text>

            {/* bateau */}
            <g id="ship">
              <path
                id="wake"
                d="M-160 -26L-520 -110M-160 26L-520 110M-160 0L-600 0"
                stroke="#F2F3F5"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
                opacity="0"
              />
              <ShipShape id="journey-ship" containers={scene.boxes} />
            </g>

            {/* camion */}
            <g id="truck">
              <TruckShape id="journey-truck" />
            </g>

            {/* ombre de l'avion */}
            <g id="pShadow" opacity=".5">
              <g fill="#000">
                <PlaneSilhouette />
              </g>
            </g>
          </g>

          <g id="veil">
            <rect x="0" y="0" width="100%" height="100%" fill="url(#skyG)" />
            <rect x="0" y="0" width="100%" height="100%" fill="url(#hazeG)" />
          </g>
          <g id="iclouds">
            {scene.introClouds.map((_, i) => (
              <image key={i} href={cloudTexture(i)} preserveAspectRatio="none" opacity="0" />
            ))}
          </g>
          <g id="cam2">
            <g id="plane">
              <PlaneShape id="journey-plane" />
            </g>
          </g>
        </svg>

        <div id="clouds">
          {skyClouds.map((_, i) => (
            <div key={i} className="cl" style={{ backgroundImage: `url(${cloudTexture(i + 1)})` }} />
          ))}
        </div>
        <div id="scrim" />

        <div className="frame">
          <div className="panel" id="hero">
            <h1>Connecter les marchés, optimiser vos opérations.</h1>
            <p>Transport, logistique et consulting pour les entreprises, en Afrique et à l’international.</p>
            <div className="acts">
              <Link className="btn" href="/devis">Demander un devis</Link>
              <a className="link" href="#services">Découvrir nos solutions</a>
            </div>
          </div>

          {journeySteps.map((s) => (
            <div key={s.step} className="panel" data-a={s.a} data-b={s.b}>
              <div className="step"><i />{s.step}</div>
              <h2>{s.title}</h2>
              <p>{s.text}</p>
              <ul>
                {s.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
          <div className="panel" id="end" data-a=".955" data-b="1.2">
            <div className="step"><i />De bout en bout</div>
            <h2>Un seul interlocuteur, du devis à la livraison.</h2>
            <p>Décrivez-nous votre besoin, nous revenons vers vous.</p>
            <div className="acts">
              <Link className="btn" href="/devis">Demander un devis</Link>
            </div>
          </div>

          <div className="hud" aria-hidden="true">
            {["Air", "Route", "Mer"].map((m) => (
              <div key={m}>
                <span>{m}</span>
                <b><i /></b>
              </div>
            ))}
          </div>
          <div id="hint">
            <span>Faites défiler</span>
            <i />
          </div>
        </div>
      </div>
    </section>
  );
}

const LAND =
  "M1000 -400C960 300 1080 650 1020 1000S960 1700 1060 2100S1010 2600 1040 3000L2960 3000C3020 2400 2950 2000 3000 1720L3000 1440C3050 1100 2950 700 3010 300S2990 -100 3000 -400Z";
const ROUTE_AIR ="M150 1900C700 1600 800 700 1230 700L1760 700";
const ROUTE_ROAD =
  "M1820 800L1820 1000Q1820 1040 1860 1040L2400 1040Q2440 1040 2440 1080L2440 1500Q2440 1540 2480 1540L2930 1540";
const ROUTE_SEA = "M3290 1668C3600 1668 3760 1860 4380 2080";
