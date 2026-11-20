"use client";
/* eslint-disable react-hooks/immutability -- l'état d'animation partagé (progressions, océan) est muté
   impérativement par la timeline GSAP à chaque image, hors du cycle de rendu React (comme un ref). */

import { useEffect, type Dispatch, type RefObject, type SetStateAction } from "react";
import { gsap, MotionPathPlugin, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { getLenis, useReducedMotion } from "@/lib/motion-prefs";
import { sequence, truckSequence } from "@/data/sequences";
import route from "@/data/city-route.json";
import { SCENES as S, TOTAL, type JourneyMode } from "./scenes";
import type { JourneyLive } from "./Journey";

/** Portion du tracé parcourue dans la scène « route vue du ciel ». */
const U0 = 0.15, U1 = 0.985;
/** Distance parcourue par le camion de côté (px d'écran, roues et marquages au sol). */
const ROAD_DISTANCE = 12000;
/** Période du motif des marquages (px) — doit correspondre à journey.css (.j-road-marks). */
const MARK_PERIOD = 180;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

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
  const mode: JourneyMode = reduced ? "static" : "live";

  useGSAP(
    () => {
      const el = root.current;
      if (!el || mode !== "live") return;
      const q = gsap.utils.selector(el);
      const one = <T extends HTMLElement>(sel: string) => q(sel)[0] as T;

      const stage = one(".j-stage");
      const truck = one(".j-truck");
      const map = one(".j-map");
      const truckTop = one(".j-truck-top");
      const marks = one(".j-road-marks");
      const track = one(".j-track");
      const ship = one(".j-ship");
      const milestones = q(".j-milestone") as HTMLElement[];
      const hud = q(".j-hud > div") as HTMLElement[];
      const hudBars = hud.map((d) => d.querySelector("i") as HTMLElement);

      const raw = MotionPathPlugin.getRawPath(route.road);
      MotionPathPlugin.cacheRawPathMeasurements(raw);
      const topBox = truckSequence("truck-top").bbox.first;
      const shipSeq = sequence("ship-top");
      const shipBox = shipSeq.bbox.first;

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

      /** Décalage vertical du camion de côté : ses roues posées sur la route (76 % de la hauteur). */
      const sideY = () => 0.76 * m.vh - (0.5 * m.vh - 0.5 * m.truckH + 0.648 * m.truckH);

      const city = { u: U0, zoom: 1 };
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
        const s = m.s0 * city.zoom;
        const cx = m.vw / 2, cy = m.vh / 2;
        map.style.transform = `translate3d(${(cx - pos.x * s).toFixed(1)}px, ${(cy - pos.y * s).toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
        truckTop.style.transform = `rotate(${pos.angle.toFixed(2)}deg) scale(${city.zoom.toFixed(4)})`;
        milestones.forEach((li, i) => {
          const ms = route.milestones[i];
          const x = cx + (ms.x - pos.x) * s, y = cy + (ms.y - pos.y) * s;
          const o = clamp01(1 - (Math.abs(city.u - ms.t) - 0.05) / 0.08);
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
        ship.style.transform = `translate3d(${(ocean.shipX * m.vw - imgW * ((shipBox.x + shipBox.w / 2) / 100)).toFixed(1)}px, ${(ocean.shipY * m.vh - imgH * ((shipBox.y + shipBox.h / 2) / 100)).toFixed(1)}px, 0)`;
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
      panelIn(".j-p-air", S.air[0] + 0.15);
      panelOut(".j-p-air", S.air[1] - 0.4);

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
        .fromTo(
          track,
          { x: () => m.vw },
          { x: () => -(track.scrollWidth - m.vw * 0.55), duration: S.side[1] - S.side[0] - 0.6 },
          S.side[0] + 0.4,
        )
        .to(".j-services", { opacity: 0, duration: 0.3 }, S.side[1] - 0.2)
        .fromTo(".j-speed", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, S.side[0] + 0.1)
        .to(".j-speed", { autoAlpha: 0, duration: 0.3 }, S.city[1] - 0.4);

      /* ---------------- 5. Changement de caméra : côté → dessus ---------------- */
      tl.to(".j-ghost", { opacity: 0, duration: 0.3 }, S.side[1] - 0.2)
        .set(".j-truck-side", { autoAlpha: 0 }, S.rotate[0])
        .set(".j-truck-rot", { autoAlpha: 1 }, S.rotate[0])
        .fromTo(live.rotate, { current: 0 }, { current: 1, duration: S.rotate[1] - S.rotate[0] - 0.15 }, S.rotate[0])
        .to(".j-truck", { y: 0, duration: S.rotate[1] - S.rotate[0] - 0.15, ease: "power1.inOut" }, S.rotate[0])
        .fromTo(".j-road", { top: "72%" }, { top: "-4%", duration: S.rotate[1] - S.rotate[0] - 0.15, ease: "power1.inOut" }, S.rotate[0])
        .fromTo(".j-s-city", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45 }, S.rotate[1] - 0.6)
        .set(".j-truck-rot", { autoAlpha: 0 }, S.rotate[1] - 0.15)
        .set(".j-truck-top", { autoAlpha: 1 }, S.rotate[1] - 0.15)
        .set(".j-s-side", { autoAlpha: 0 }, S.rotate[1] - 0.1);

      /* ---------------- 6. Route vue du ciel : méthode ---------------- */
      tl.fromTo(city, { u: U0 }, { u: U1, duration: S.city[1] - S.city[0] - 0.2, ease: "power1.inOut" }, S.city[0] - 0.1)
        .fromTo(city, { zoom: 1 }, { zoom: 0.42, duration: 1.2, ease: "power2.inOut" }, S.city[0] - 0.05);
      panelIn(".j-p-method", S.city[0] + 0.1);
      panelOut(".j-p-method", S.city[1] - 0.5);

      /* ---------------- 7. La mer : à propos ---------------- */
      tl.fromTo(".j-s-sea", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, S.sea[0] - 0.25)
        .to(".j-truck", { autoAlpha: 0, duration: 0.3 }, S.sea[0] - 0.2)
        .set(".j-s-city", { autoAlpha: 0 }, S.sea[0] + 0.3)
        .fromTo(ocean, { zoom: 1.35, shipX: 0.5 }, { zoom: 0.78, shipX: 0.63, duration: S.sea[1] - S.sea[0] - 0.1, ease: "power1.inOut" }, S.sea[0]);
      panelIn(".j-p-sea", S.sea[0] + 0.2);
      panelOut(".j-p-sea", S.sea[0] + 1.5);
      panelIn(".j-p-about", S.sea[0] + 1.75);
      tl.fromTo(".j-reason", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.22, ease: "power2.out" }, S.sea[0] + 1.95);
      tl.to({}, { duration: 0.001 }, TOTAL - 0.001); // durée exacte = TOTAL

      apply();
      onProgress(tl.scrollTrigger?.progress ?? 0);
    },
    { scope: root, dependencies: [mode] },
  );

  // Clavier : un élément focalisé dans une scène amène le défilement sur cette scène.
  useEffect(() => {
    const el = root.current;
    if (!el || mode !== "live") return;
    const onFocus = (e: FocusEvent) => {
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
