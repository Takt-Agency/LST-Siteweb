"use client";
/* eslint-disable react-hooks/immutability -- l'état d'animation partagé (progressions, océan) est muté
   impérativement par la timeline GSAP à chaque image, hors du cycle de rendu React (comme un ref). */

import { useEffect, useState, type Dispatch, type RefObject, type SetStateAction } from "react";
import { gsap, MotionPathPlugin, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { getLenis, useIsMobile, useReducedMotion } from "@/lib/motion-prefs";
import { sequence, truckSequence } from "@/data/sequences";
import route from "@/data/city-route.json";
import shipGeo from "@/data/ship-slot.json";
import { AIR_FADE, BOARD, SCENES as S, TOTAL, type JourneyMode } from "./scenes";
import type { JourneyLive } from "./Journey";

/** Portion du tracé parcourue dans la scène « route vue du ciel ». */
const U0 = 0.15, U1 = 0.985;
/** Distance parcourue par le camion de côté (px d'écran, roues et marquages au sol). */
const ROAD_DISTANCE = 12000;
/** Période du motif des marquages (px) — doit correspondre à journey.css (.j-road-marks). */
const MARK_PERIOD = 180;

/**
 * Embarquement, en fraction de BOARD : le camion s'arrête au bord du quai (DRIVE), le conteneur est soulevé,
 * porté jusqu'à son emplacement libre sur le pont et posé (LIFT), puis la ville s'efface (WIPE) avec le
 * camion ; le navire appareille ensuite avec le conteneur.
 */
const DRIVE = 0.18, LIFT = [0.22, 0.78] as const, WIPE = [0.74, 0.98] as const;
/** Cadrage de la mer à la fin de l'embarquement (= état de départ de la scène « mer »). */
const SEA_ZOOM = 1.35, SEA_SHIP_Y = 0.52;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const smooth = (a: number, b: number, v: number) => {
  const x = clamp01((v - a) / (b - a));
  return x * x * (3 - 2 * x);
};

/**
 * Construit la timeline du parcours (scrubbée sur la hauteur de la section) et renvoie le mode
 * d'affichage : « static » côté serveur, sans JS et en reduced-motion ; « live » sinon.
 */
export function useJourneyTimeline(
  root: RefObject<HTMLElement | null>,
  live: JourneyLive,
  setArmed: Dispatch<SetStateAction<number>>,
): JourneyMode {
  const reduced = useReducedMotion();
  // Mobile (< 768 px) : services en pile, jalons fixes ; la timeline est reconstruite au changement.
  const mobile = useIsMobile();
  const mode: JourneyMode = reduced ? "static" : "live";
  // La timeline (mesures de layout, ScrollTrigger) n'est construite qu'à l'approche du parcours :
  // rien à faire pendant le chargement de la page, quand seul le hero est visible.
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = root.current;
    if (!el || mode !== "live" || near) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "120% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [root, mode, near]);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || mode !== "live" || !near) return;
      const q = gsap.utils.selector(el);
      const one = <T extends HTMLElement>(sel: string) => q(sel)[0] as T;

      const stage = one(".j-stage");
      const truck = one(".j-truck");
      const map = one(".j-map");
      const truckTop = one(".j-truck-top");
      const marks = one(".j-road-marks");
      const track = one(".j-track");
      const ship = one(".j-ship");
      const sea = one(".j-s-sea");
      const truckEmpty = one(".j-truck-empty");
      const boxLift = one(".j-box-lift");
      const boxShip = one(".j-box-ship");
      const milestones = q(".j-milestone") as HTMLElement[];
      const cards = q(".j-card") as HTMLElement[];
      const hud = q(".j-hud > div") as HTMLElement[];
      // Scène courante (clics actifs) : [sélecteur, début, fin] en unités de la timeline.
      const sceneEls: [HTMLElement, number, number][] = [
        [one(".j-s-air"), S.air[0], S.air[1]],
        [one(".j-s-intro"), S.intro[0], S.intro[1]],
        [one(".j-s-load"), S.load[0], S.load[1]],
        [one(".j-s-side"), S.side[0], S.rotate[0]],
        [one(".j-s-city"), S.rotate[1], S.city[1]],
        [one(".j-s-sea"), S.sea[0], S.sea[1] + 1],
      ];
      const hudBars = hud.map((d) => d.querySelector("i") as HTMLElement);

      const raw = MotionPathPlugin.getRawPath(route.road);
      MotionPathPlugin.cacheRawPathMeasurements(raw);
      const topBox = truckSequence("truck-top").bbox.first;
      const shipSeq = sequence("ship-top");
      const shipBox = shipSeq.bbox.first;
      const boxSeq = sequence("container-top");
      const boxBox = boxSeq.bbox.first;

      const m = { vw: 1, vh: 1, truckW: 1, truckH: 1, s0: 1 };
      const measure = () => {
        m.vw = stage.clientWidth;
        m.vh = stage.clientHeight;
        m.truckW = truck.offsetWidth;
        m.truckH = truck.offsetHeight;
        // Échelle de la carte telle que le camion vu du dessus y ait sa longueur à l'écran.
        m.s0 = (m.truckW * (topBox.w / 100)) / route.truckLength;
      };
      measure();

      // Centrage explicite des éléments animés en x/y (le `translate` CSS est neutralisé en mode live) :
      // GSAP convertit sinon `translate: -50% -50%` en pixels et peut perdre le centrage selon l'arrondi.
      gsap.set([".j-plane", ".j-plane-shadow", truck], { xPercent: -50, yPercent: -50 });

      /** Décalage vertical du camion de côté : ses roues posées sur la route (76 % de la hauteur). */
      // Mobile : route plus basse, sous la pile de cartes de services.
      const ROAD_Y = mobile ? 0.84 : 0.76;
      const sideY = () => ROAD_Y * m.vh - (0.5 * m.vh - 0.5 * m.truckH + 0.648 * m.truckH);
      gsap.set(".j-road", { top: `${(ROAD_Y - 0.04) * 100}%` });

      const city = { u: U0, zoom: 1 };
      const board = { b: 0 };
      // Monde de l'embarquement (unités de la carte) : fin de route, bord de l'eau, navire poupe contre le quai.
      const roadEnd = MotionPathPlugin.getPositionOnPath(raw, U1, true) as { x: number; y: number };
      const waterX = route.quayX + 360;
      // Cadre truck-top : 1 % de sa largeur = wpp unités de carte (le camion en occupe topBox.w %).
      const wpp = route.truckLength / topBox.w;
      const boxLen = boxBox.w * wpp; // longueur du conteneur
      const boxDx = (boxBox.x + boxBox.w / 2 - 50) * wpp, boxDy = (boxBox.y + boxBox.h / 2 - 50) * (9 / 16) * wpp;
      // Navire à l'échelle du conteneur : son emplacement libre (ship-slot.json) a exactement sa longueur.
      const shipIW = boxLen / shipGeo.slot.len, shipIH = shipIW / shipSeq.aspect;
      const shipLw = (shipIW * shipBox.w) / 100;
      const shipLeft = waterX + 6 - shipGeo.stern * shipIW, shipTop = roadEnd.y - shipGeo.axis * shipIH;
      const shipCx = shipLeft + ((shipBox.x + shipBox.w / 2) / 100) * shipIW;
      const shipCy = shipTop + ((shipBox.y + shipBox.h / 2) / 100) * shipIH;
      const slotX = shipLeft + shipGeo.slot.x * shipIW, slotY = shipTop + shipGeo.slot.y * shipIH;
      // Arrêt du camion : l'avant à 25 unités du bord de l'eau.
      const stopX = waterX - 25 - (topBox.x + topBox.w - 50) * wpp;
      /** Place le conteneur (cadre container-top) : centre (x, y) et longueur à l'écran, en px. */
      const placeBox = (el: HTMLElement, x: number, y: number, len: number) => {
        const w = len / (boxBox.w / 100), h = w / boxSeq.aspect;
        el.style.width = `${w.toFixed(1)}px`;
        el.style.transform = `translate3d(${(x - w * ((boxBox.x + boxBox.w / 2) / 100)).toFixed(1)}px, ${(y - h * ((boxBox.y + boxBox.h / 2) / 100)).toFixed(1)}px, 0)`;
      };
      const ocean = live.ocean.current;
      let lastMarks = NaN;

      /** Mises à jour dérivées, à chaque rendu de la timeline. */
      const apply = () => {
        // Marquages de la route (vue de côté).
        const d = live.distance.current;
        const mk = -(d % MARK_PERIOD);
        if (mk !== lastMarks) {
          marks.style.backgroundPositionX = `${mk.toFixed(1)}px`;
          lastMarks = mk;
        }

        // Route vue du ciel : la caméra suit le camion ; le camion s'oriente selon la tangente.
        const pos = MotionPathPlugin.getPositionOnPath(raw, city.u, true) as { x: number; y: number; angle: number };
        const cx = m.vw / 2, cy = m.vh / 2;
        const shipF = m.vw < 768 ? 1.7 : 1; // même facteur que la longueur du navire plus bas
        // Caméra : suit le camion ; pendant l'embarquement, recule (zoom exponentiel) jusqu'au cadrage de la mer.
        let camX = pos.x, camY = pos.y, s = m.s0 * city.zoom;
        let tx = pos.x, ty = pos.y, angle = pos.angle;
        const b = board.b;
        if (b > 0) {
          const e = ease(b);
          const s0 = s, s1 = (0.36 * SEA_ZOOM * shipF * m.vw) / shipLw;
          // Recul rapide au début : la photo du navire, à l'échelle du conteneur, n'est que brièvement très agrandie.
          s = s0 * (s1 / s0) ** (1 - (1 - b) ** 1.8);
          camX = lerp(roadEnd.x, shipCx, e);
          camY = lerp(roadEnd.y, shipCy - ((SEA_SHIP_Y - 0.5) * m.vh) / s1, e);
          // Le camion roule jusqu'au bord du quai et s'y arrête.
          tx = lerp(roadEnd.x, Math.max(roadEnd.x, stopX), ease(clamp01(b / DRIVE)));
          ty = roadEnd.y;
          angle = 0;
          // Le conteneur quitte la remorque : levé (plus grand, ombre portée qui s'écarte), porté, posé.
          const lifting = b >= LIFT[0] && b < LIFT[1];
          boxLift.classList.toggle("on", lifting);
          if (lifting) {
            const q = (b - LIFT[0]) / (LIFT[1] - LIFT[0]);
            const h = Math.min(smooth(0, 0.2, q), 1 - smooth(0.8, 1, q));
            const p = ease(clamp01((q - 0.12) / 0.76));
            const bx = lerp(tx + boxDx, slotX, p), by = lerp(ty + boxDy, slotY, p);
            const len = boxLen * s * (1 + 0.14 * h);
            placeBox(boxLift, cx + (bx - camX) * s, cy + (by - camY) * s, len);
            const dd = h * Math.max(5, len * 0.05);
            boxLift.style.filter = `drop-shadow(${dd.toFixed(1)}px ${(dd * 1.25).toFixed(1)}px ${(2 + dd * 0.8).toFixed(1)}px rgba(0,0,0,.5))`;
          }
          // L'océan (et le navire) suivent la même caméra ; à b = 1 : état de départ de la scène « mer ».
          if (b < 1) {
            ocean.zoom = (shipLw * s) / m.vw / 0.36 / shipF;
            ocean.shipX = (cx + (shipCx - camX) * s) / m.vw;
            ocean.shipY = (cy + (shipCy - camY) * s) / m.vh;
          } else ocean.shipY = SEA_SHIP_Y;
          // La mer n'apparaît d'abord qu'au-delà du quai, puis recouvre la ville par un balayage doux.
          const edge = cx + (waterX - camX) * s;
          const w = ease(clamp01((b - WIPE[0]) / (WIPE[1] - WIPE[0])));
          const from = lerp(edge, -0.3 * m.vw, w), soft = lerp(2, 0.3 * m.vw, w);
          sea.style.maskImage = sea.style.webkitMaskImage =
            b < 1 ? `linear-gradient(90deg, transparent ${from.toFixed(1)}px, #000 ${(from + soft).toFixed(1)}px)` : "none";
        } else {
          sea.style.maskImage = sea.style.webkitMaskImage = "none";
          boxLift.classList.remove("on");
        }
        truck.classList.toggle("is-unloaded", b >= LIFT[0]);
        truckEmpty.style.transform = `translate(${((tx - camX) * s).toFixed(1)}px, ${((ty - camY) * s).toFixed(1)}px) rotate(${angle.toFixed(2)}deg) scale(${(s / m.s0).toFixed(4)})`;
        map.style.transform = `translate3d(${(cx - camX * s).toFixed(1)}px, ${(cy - camY * s).toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
        truckTop.style.transform = `translate(${((tx - camX) * s).toFixed(1)}px, ${((ty - camY) * s).toFixed(1)}px) rotate(${angle.toFixed(2)}deg) scale(${(s / m.s0).toFixed(4)})`;
        // Mobile : les jalons s'affichent tous au même endroit ; seul le plus proche est visible (pas de superposition).
        let nearest = 0;
        route.milestones.forEach((ms, i) => {
          if (Math.abs(city.u - ms.t) < Math.abs(city.u - route.milestones[nearest].t)) nearest = i;
        });
        milestones.forEach((li, i) => {
          const ms = route.milestones[i];
          // Mobile : le jalon actif s'affiche en haut de l'écran plutôt qu'à côté de la route.
          const x = mobile ? cx : cx + (ms.x - camX) * s;
          const y = mobile ? m.vh * 0.32 : cy + (ms.y - camY) * s;
          const o = mobile && i !== nearest ? 0 : clamp01(1 - (Math.abs(city.u - ms.t) - 0.05) / 0.08);
          li.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
          li.style.opacity = o.toFixed(3);
          li.style.pointerEvents = o > 0.5 ? "auto" : "none";
        });

        // Navire : même état que le shader de l'océan (sillage calé sur la coque).
        ocean.shipLen = 0.36 * ocean.zoom * (m.vw < 768 ? 1.7 : 1);
        ocean.shipBeam = shipBox.h / 100 / shipSeq.aspect / (shipBox.w / 100);
        const imgW = (ocean.shipLen * m.vw) / (shipBox.w / 100);
        const imgH = imgW / shipSeq.aspect;
        ship.style.width = `${imgW.toFixed(1)}px`;
        const shipL = ocean.shipX * m.vw - imgW * ((shipBox.x + shipBox.w / 2) / 100);
        const shipT = ocean.shipY * m.vh - imgH * ((shipBox.y + shipBox.h / 2) / 100);
        ship.style.transform = `translate3d(${shipL.toFixed(1)}px, ${shipT.toFixed(1)}px, 0)`;
        // Conteneur posé : il fait partie du navire (même calque que lui) et le suit jusqu'au bout.
        const landed = board.b >= LIFT[1];
        boxShip.classList.toggle("on", landed);
        if (landed) placeBox(boxShip, shipL + shipGeo.slot.x * imgW, shipT + shipGeo.slot.y * imgH, shipGeo.slot.len * imgW);
      };

      let armedNow = 0;
      const onProgress = (p: number) => {
        const u = p * TOTAL;
        // Armer le chargement des séquences un peu avant leur scène.
        const need = u > S.sea[0] - 5 ? 3 : u > S.rotate[0] - 4 ? 2 : u > S.load[0] - 2.5 ? 1 : 0;
        if (need > armedNow) {
          armedNow = need;
          setArmed((a) => Math.max(a, need));
        }
        // HUD Air / Route / Mer.
        const prog = [clamp01(u / S.intro[0]), clamp01((u - S.load[0]) / (S.sea[0] - S.load[0])), clamp01((u - S.sea[0]) / (S.sea[1] - S.sea[0]))];
        const on = u < S.load[0] ? 0 : u < S.sea[0] ? 1 : 2;
        sceneEls.forEach(([sc, a, b]) => sc.classList.toggle("is-active", u >= a && u < b));
        hud.forEach((h, i) => {
          hudBars[i].style.transform = `scaleX(${prog[i].toFixed(3)})`;
          h.classList.toggle("on", i === on);
        });
      };

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        onUpdate: apply,
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
          onRefresh: (self) => {
            measure();
            onProgress(self.progress);
            apply();
          },
          onUpdate: (self) => onProgress(self.progress),
        },
      });
      const panelIn = (sel: string, t: number) => tl.fromTo(sel, { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, t);
      const panelOut = (sel: string, t: number) => tl.to(sel, { opacity: 0, y: -32, duration: 0.3, ease: "power2.in" }, t);

      /* ---------------- 1. Air : au-dessus des nuages, descente, atterrissage ---------------- */
      // Fondu d'entrée par-dessus la fin du hero (le fond de la scène vient de son .j-vis).
      tl.fromTo(".j-s-air", { autoAlpha: 0 }, { autoAlpha: 1, duration: AIR_FADE, ease: "power1.inOut" }, 0)
        .fromTo(stage, { backgroundColor: "rgba(223,230,236,0)" }, { backgroundColor: "rgba(223,230,236,1)", duration: 0.01 }, AIR_FADE);
      tl.fromTo(".j-cl-far", { x: "0vw", y: "0vh", scale: 1 }, { x: "-28vw", y: "-8vh", scale: 1.35, duration: 3 }, 0)
        .to(".j-cl-far", { opacity: 0, duration: 0.8 }, 1.6)
        .fromTo(".j-cl-mid", { x: "0vw", scale: 1 }, { x: "-58vw", scale: 1.8, duration: 2.6 }, 0)
        .to(".j-cl-mid", { opacity: 0, duration: 0.7 }, 1.3)
        .fromTo(".j-cl-near", { x: "0vw", scale: 1.1 }, { x: "-100vw", scale: 2.8, duration: 2 }, 0)
        .to(".j-cl-near", { opacity: 0, duration: 0.6 }, 0.9)
        .fromTo(".j-air-haze", { opacity: 1 }, { opacity: 0, duration: 1.2 }, 1.0)
        .fromTo(".j-ground", { scale: 0.5 }, { scale: 1, duration: 2.3, ease: "power1.inOut" }, 0.5)
        .fromTo(".j-runway-marks", { x: 0 }, { x: "-240vw", duration: 2.2, ease: "power2.out" }, 0.8)
        .fromTo(".j-plane-shadow", { x: "15vw", y: "20vh", opacity: 0, scale: 0.88 }, { x: "0.8vw", y: "1.2vh", opacity: 0.5, scale: 1, duration: 2, ease: "power1.in" }, 0.9)
        .fromTo(".j-plane", { x: "-8vw" }, { x: "0vw", duration: 2.6, ease: "power1.out" }, 0);
      panelIn(".j-p-air", S.air[0] + AIR_FADE);
      // Reste affiché jusqu'à l'arrêt de l'avion sur la piste (fin du roulage ≈ 3,0).
      panelOut(".j-p-air", S.air[1] - 0.25);

      /* ---------------- 2. Intro : un seul interlocuteur ---------------- */
      tl.fromTo(".j-s-intro", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 }, S.intro[0] - 0.15);
      panelIn(".j-p-intro", S.intro[0]);
      const words = q(".j-intro-title .rt-word");
      if (words.length) tl.fromTo(words, { opacity: 0.3 }, { opacity: 1, duration: 0.2, stagger: { amount: 0.8 } }, S.intro[0] + 0.2);
      if (q(".j-figures").length) tl.fromTo(".j-figures > div", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.15 }, S.intro[0] + 0.3);
      panelOut(".j-p-intro", S.intro[1] - 0.2);

      /* ---------------- 3. Chargement au port ---------------- */
      tl.fromTo(".j-s-load", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 }, S.load[0] - 0.15)
        .set(".j-s-air", { autoAlpha: 0 }, S.load[0] + 0.2)
        .set(".j-s-intro", { autoAlpha: 0 }, S.load[0] + 0.2)
        .fromTo(live.load, { current: 0 }, { current: 1, duration: 2 }, S.load[0] + 0.3);
      panelIn(".j-p-load", S.load[0] + 0.15);
      panelOut(".j-p-load", S.load[1] - 0.2);

      /* ---------------- 4. Le camion roule : services ---------------- */
      tl.fromTo(".j-s-side", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, S.side[0] - 0.1)
        .fromTo(".j-truck", { autoAlpha: 0, x: "55vw", y: sideY }, { autoAlpha: 1, x: "0vw", y: sideY, duration: 0.7, ease: "power2.out" }, S.side[0])
        .set(".j-s-load", { autoAlpha: 0 }, S.side[0] + 0.35)
        .fromTo(live.distance, { current: 0 }, { current: ROAD_DISTANCE, duration: S.rotate[1] - 0.1 - S.side[0] }, S.side[0])
        .fromTo(".j-ghost", { x: "35vw" }, { x: "-120vw", duration: S.side[1] - S.side[0] }, S.side[0])
        .fromTo(".j-services", { opacity: 0 }, { opacity: 1, duration: 0.3 }, S.side[0] + 0.2)
        .to(".j-services", { opacity: 0, duration: 0.3 }, S.side[1] - 0.2);
      if (mobile) {
        // Cartes en pile : chacune arrive par la droite et recouvre la précédente.
        const slot = (S.side[1] - S.side[0] - 0.8) / cards.length;
        cards.forEach((card, i) => {
          const t = S.side[0] + 0.3 + i * slot;
          if (i > 0) tl.fromTo(card, { xPercent: 115 }, { xPercent: 0, duration: 0.35, ease: "power2.out" }, t);
          if (i > 0) tl.to(cards[i - 1], { scale: 0.92, opacity: 0, duration: 0.35 }, t);
        });
      } else {
        tl.fromTo(
          track,
          { x: () => m.vw },
          { x: () => -(track.scrollWidth - m.vw * 0.55), duration: S.side[1] - S.side[0] - 0.6 },
          S.side[0] + 0.4,
        );
      }
      tl
        .fromTo(".j-speed", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, S.side[0] + 0.1)
        .to(".j-speed", { autoAlpha: 0, duration: 0.3 }, S.city[1] - 0.4);

      /* ---------------- 5. Changement de caméra : côté → dessus ---------------- */
      tl.to(".j-ghost", { opacity: 0, duration: 0.3 }, S.side[1] - 0.2)
        .set(".j-truck-side", { autoAlpha: 0 }, S.rotate[0])
        .set(".j-truck-rot", { autoAlpha: 1 }, S.rotate[0])
        .fromTo(live.rotate, { current: 0 }, { current: 1, duration: S.rotate[1] - S.rotate[0] - 0.15 }, S.rotate[0])
        .to(".j-truck", { y: 0, duration: S.rotate[1] - S.rotate[0] - 0.15, ease: "power1.inOut" }, S.rotate[0])
        .fromTo(".j-road", { top: `${(ROAD_Y - 0.04) * 100}%` }, { top: "-4%", duration: S.rotate[1] - S.rotate[0] - 0.15, ease: "power1.inOut" }, S.rotate[0])
        .fromTo(".j-s-city", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45 }, S.rotate[1] - 0.6)
        .set(".j-truck-rot", { autoAlpha: 0 }, S.rotate[1] - 0.15)
        .set(".j-truck-top", { autoAlpha: 1 }, S.rotate[1] - 0.15)
        .set(".j-s-side", { autoAlpha: 0 }, S.rotate[1] - 0.1);

      /* ---------------- 6. Route vue du ciel : méthode ---------------- */
      tl.fromTo(city, { u: U0 }, { u: U1, duration: S.city[1] - S.city[0] - 0.2, ease: "power1.inOut" }, S.city[0] - 0.1)
        .fromTo(city, { zoom: 1 }, { zoom: 0.42, duration: 1.2, ease: "power2.inOut" }, S.city[0] - 0.05);
      panelIn(".j-p-method", S.city[0] + 0.1);
      panelOut(".j-p-method", S.city[1] - 0.5);

      /* ---------------- 7. Embarquement, puis la mer : à propos ---------------- */
      // La mer (masquée au-delà du quai, cf. apply) apparaît sous la ville ; le conteneur passe du camion au
      // navire pendant que la caméra recule ; la ville et le camion s'effacent ; le navire appareille.
      const boardLen = BOARD[1] - BOARD[0];
      tl.fromTo(".j-s-sea", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12 }, BOARD[0])
        .fromTo(board, { b: 0 }, { b: 1, duration: boardLen }, BOARD[0])
        .to(".j-truck", { autoAlpha: 0, duration: boardLen * (WIPE[1] - WIPE[0]) * 0.7 }, BOARD[0] + boardLen * WIPE[0])
        .set(".j-s-city", { autoAlpha: 0 }, BOARD[1])
        .fromTo(ocean, { wake: 0, speed: 0 }, { wake: 1, speed: 0.03, duration: 0.8, ease: "power1.in" }, BOARD[1] - 0.2)
        .fromTo(ocean, { zoom: SEA_ZOOM, shipX: 0.5 }, { zoom: 0.78, shipX: 0.63, duration: S.sea[1] - BOARD[1] - 0.1, ease: "power1.inOut" }, BOARD[1]);
      panelIn(".j-p-sea", BOARD[1] - 0.1);
      panelOut(".j-p-sea", S.sea[0] + 3.4);
      panelIn(".j-p-about", S.sea[0] + 3.65);
      tl.fromTo(".j-reason", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.22, ease: "power2.out" }, S.sea[0] + 3.85);
      tl.to({}, { duration: 0.001 }, TOTAL - 0.001); // durée exacte = TOTAL

      apply();
      onProgress(tl.scrollTrigger?.progress ?? 0);
    },
    { scope: root, dependencies: [mode, mobile, near] },
  );

  // Clavier : un élément focalisé dans une scène amène le défilement sur cette scène.
  useEffect(() => {
    const el = root.current;
    if (!el || mode !== "live") return;
    const stage = el.querySelector<HTMLElement>(".j-stage");
    const onFocus = (e: FocusEvent) => {
      // Sans overflow: clip, le navigateur fait défiler la scène collante pour montrer l'élément.
      if (stage) stage.scrollLeft = stage.scrollTop = 0;
      const target = (e.target as HTMLElement).closest<HTMLElement>("[data-at]");
      if (!target) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const y = top + (Number(target.dataset.at) / TOTAL) * (el.offsetHeight - window.innerHeight);
      if (Math.abs(window.scrollY - y) < window.innerHeight * 0.25) return;
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(y, { immediate: true });
      else window.scrollTo(0, y);
      ScrollTrigger.update();
    };
    el.addEventListener("focusin", onFocus);
    return () => el.removeEventListener("focusin", onFocus);
  }, [root, mode]);

  return mode;
}
