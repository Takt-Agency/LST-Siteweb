import { scene, skyClouds } from "./scene";

/* Outils de calcul (repris de la maquette). */
const cl = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const s = (p: number, a: number, b: number) => cl((p - a) / (b - a), 0, 1);
const sm = (t: number) => t * t * (3 - 2 * t);
const eio = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const win = (p: number, a: number, b: number) => {
  const f = 0.035;
  return sm(cl((p - a) / f, 0, 1)) * (1 - sm(cl((p - (b - f)) / f, 0, 1)));
};

type Point = { x: number; y: number; ang: number };

function at(path: SVGPathElement, len: number, t: number): Point {
  const l = cl(t, 0, 1) * len;
  const a = path.getPointAtLength(l);
  const b = path.getPointAtLength(Math.min(len, l + 2));
  const c = path.getPointAtLength(Math.max(0, l - 2));
  return { x: a.x, y: a.y, ang: (Math.atan2(b.y - c.y, b.x - c.x) * 180) / Math.PI };
}

/** Courbe de zoom de la caméra selon la progression (interpolation logarithmique). */
const ZOOM: [number, number][] = [
  [0, 0.72], [0.04, 0.72], [0.14, 0.27], [0.21, 0.36], [0.3, 0.62],
  [0.36, 1.15], [0.66, 1.15], [0.73, 0.62], [1, 0.58],
];
function keys(p: number, arr: [number, number][]) {
  if (p <= arr[0][0]) return arr[0][1];
  for (let i = 1; i < arr.length; i++) {
    if (p <= arr[i][0]) {
      const t = sm((p - arr[i - 1][0]) / (arr[i][0] - arr[i - 1][0]));
      return Math.exp(lerp(Math.log(arr[i - 1][1]), Math.log(arr[i][1]), t));
    }
  }
  return arr[arr.length - 1][1];
}

/** Lance l'animation du parcours dans `sec` (#journey) et renvoie la fonction d'arrêt. */
export function startJourney(sec: HTMLElement) {
  const $ = <T extends Element>(sel: string) => sec.querySelector(sel) as T;
  const $$ = <T extends Element>(sel: string) => Array.from(sec.querySelectorAll<T>(sel));
  const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const stage = $<HTMLElement>("#stage");
  const cam = $<SVGGElement>("#cam");
  const cam2 = $<SVGGElement>("#cam2");
  const veil = $<SVGRectElement>("#veil");
  const P = { A: $<SVGPathElement>("#rA"), R: $<SVGPathElement>("#rR"), S: $<SVGPathElement>("#rS") };
  const B = [$<SVGPathElement>("#bA"), $<SVGPathElement>("#bR"), $<SVGPathElement>("#bS")];
  const L = { A: P.A.getTotalLength(), R: P.R.getTotalLength(), S: P.S.getTotalLength() };
  (["A", "R", "S"] as const).forEach((k) => P[k].setAttribute("stroke-dasharray", `${L[k]} ${L[k]}`));

  const icEls = $$<SVGEllipseElement>("#iclouds ellipse");
  const plane = $<SVGGElement>("#plane");
  const pShadow = $<SVGGElement>("#pShadow");
  const truck = $<SVGGElement>("#truck");
  const ship = $<SVGGElement>("#ship");
  const wake = $<SVGPathElement>("#wake");
  const labels = $$<SVGTextElement>(".lbl");
  const hubs = $$<SVGGElement>(".hub").map((h) => ({
    x: +(h.dataset.x ?? 0),
    y: +(h.dataset.y ?? 0),
    ring: h.querySelector(".ring") as SVGCircleElement,
    dot: h.querySelector(".dot") as SVGCircleElement,
  }));
  const panels = $$<HTMLElement>(".panel[data-a]");
  const hero = $<HTMLElement>("#hero");
  const hint = $<HTMLElement>("#hint");
  const hud = $$<HTMLElement>(".hud div");
  const hudBars = hud.map((d) => d.querySelector("i") as HTMLElement);
  const cEls = $$<HTMLElement>("#clouds .cl");

  let Wd = 0, Ht = 0, mobile = false;
  /* Mobile : centre vertical de l'espace libre entre l'en-tête et le texte du hero. */
  let freeMid = 0;
  const measure = () => {
    Wd = stage.clientWidth;
    Ht = stage.clientHeight;
    mobile = Wd < 820;
    const bar = document.querySelector<HTMLElement>(".bar");
    const top = bar ? bar.getBoundingClientRect().height : 70;
    freeMid = (top + hero.offsetTop) / 2;
  };

  function update(p: number, time: number) {
    const k = cl(Math.min(Wd, Ht) / 760, 0.5, 1.3);
    const tA = eio(s(p, 0.09, 0.32)), tR = eio(s(p, 0.38, 0.665)), tS = eio(s(p, 0.735, 0.94));
    const a = at(P.A, L.A, tA), r = at(P.R, L.R, tR), sh = at(P.S, L.S, tS);

    /* cible suivie par la caméra */
    let F: { x: number; y: number };
    if (p < 0.32) F = a;
    else if (p < 0.38) {
      const u = sm(s(p, 0.32, 0.38));
      F = { x: lerp(a.x, r.x, u), y: lerp(a.y, r.y, u) };
    } else if (p < 0.67) F = r;
    else if (p < 0.735) {
      const v = sm(s(p, 0.67, 0.735));
      F = { x: lerp(r.x, sh.x, v), y: lerp(r.y, sh.y, v) };
    } else F = sh;

    const sf = keys(p, ZOOM) * k;
    const so = Math.min(Wd / 5600, Ht / 2900) * (mobile ? 1.7 : 1);
    const w = sm(s(p, 0.945, 1));
    const sc = Math.exp(lerp(Math.log(sf), Math.log(so), w));
    const OV = { x: mobile ? 2450 : 2350, y: 1350 };
    const C = { x: lerp(F.x, OV.x, w), y: lerp(F.y, OV.y, w) };
    const intro = 1 - sm(s(p, 0.04, 0.13));
    const anc = mobile
      ? { x: Wd * 0.5 + 28 * intro, y: lerp(Ht * 0.36, freeMid + 46, intro) }
      : { x: lerp(Wd * 0.66, Wd * 0.68, intro), y: Ht * 0.5 };
    const ovA = mobile ? { x: Wd * 0.5, y: Ht * 0.34 } : { x: Wd * 0.64, y: Ht * 0.52 };
    const A = { x: lerp(anc.x, ovA.x, w), y: lerp(anc.y, ovA.y, w) };
    const tx = A.x - C.x * sc, ty = A.y - C.y * sc;
    const camT = `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${sc.toFixed(5)})`;
    cam2.setAttribute("transform", camT);
    cam.setAttribute("transform", camT);

    /* révélation : le voile et les nuages d'intro s'écartent */
    const rev = sm(s(p, 0.035, 0.13));
    veil.setAttribute("opacity", (1 - rev).toFixed(3));
    const hr = (a.ang * Math.PI) / 180, spd = rm ? 0 : 0.05, cxs = Wd * 0.55, cys = Ht * 0.5;
    scene.introClouds.forEach((o, q) => {
      const el = icEls[q];
      const R0 = o.r * Math.max(0.6, Math.min(Wd, Ht) / 800);
      let bx = o.x * (Wd + 2 * R0) - time * spd * o.sp * Math.cos(hr);
      let by = o.y * (Ht + 2 * R0) - time * spd * o.sp * Math.sin(hr);
      bx = (((bx % (Wd + 2 * R0)) + (Wd + 2 * R0)) % (Wd + 2 * R0)) - R0;
      by = (((by % (Ht + 2 * R0)) + (Ht + 2 * R0)) % (Ht + 2 * R0)) - R0;
      const ex = cxs + (bx - cxs) * (1 + 2.6 * rev), ey = cys + (by - cys) * (1 + 2.6 * rev);
      el.setAttribute("cx", ex.toFixed(1));
      el.setAttribute("cy", ey.toFixed(1));
      el.setAttribute("rx", (R0 * (1 + 0.6 * rev)).toFixed(1));
      el.setAttribute("ry", (R0 * 0.6 * (1 + 0.6 * rev)).toFixed(1));
      el.setAttribute("opacity", (1 - rev).toFixed(3));
    });

    /* itinéraires */
    const sw = String(2.5 / sc);
    P.A.setAttribute("stroke-width", sw);
    P.R.setAttribute("stroke-width", sw);
    P.S.setAttribute("stroke-width", sw);
    P.A.setAttribute("stroke-dashoffset", String(L.A * (1 - tA)));
    P.R.setAttribute("stroke-dashoffset", String(L.R * (1 - tR)));
    P.S.setAttribute("stroke-dashoffset", String(L.S * (1 - tS)));
    B.forEach((b) => {
      b.setAttribute("stroke-width", String(1.4 / sc));
      b.setAttribute("stroke-dasharray", `${5 / sc} ${7 / sc}`);
    });

    /* plateformes et étiquettes */
    const pulse = (time % 1800) / 1800;
    hubs.forEach((h, i) => {
      const active = i === 0 ? win(p, 0.3, 0.4) : win(p, 0.64, 0.75);
      h.dot.setAttribute("cx", String(h.x));
      h.dot.setAttribute("cy", String(h.y));
      h.dot.setAttribute("r", String(4.5 / sc));
      h.ring.setAttribute("cx", String(h.x));
      h.ring.setAttribute("cy", String(h.y));
      h.ring.setAttribute("r", String((6 + 22 * pulse) / sc));
      h.ring.setAttribute("stroke-width", String(1.5 / sc));
      h.ring.setAttribute("opacity", String((rm ? 0 : 1 - pulse) * (0.25 + 0.75 * active)));
    });
    const fs = 13 / sc;
    labels.forEach((t) => {
      t.setAttribute("font-size", String(fs));
      t.setAttribute("stroke-width", String(3 / sc));
      t.setAttribute("x", t.dataset.x ?? "0");
      t.setAttribute("y", String(+(t.dataset.y ?? 0) + (t.dataset.dy ? fs * +t.dataset.dy : 0)));
    });

    /* avion */
    const alt = 1 - sm(s(tA, 0.42, 0.78));
    const off = alt / sc;
    let psc = 1 + 0.28 * alt;
    /* mobile : avion agrandi pendant l'intro (≈ 62 % de la largeur), ramené à sa taille en vol */
    if (mobile) {
      const big = cl((Wd * 0.62) / (312 * sc * psc), 1, 2.4);
      psc *= lerp(1, big, intro);
    }
    pShadow.setAttribute("transform", `translate(${a.x} ${a.y}) rotate(${a.ang}) scale(${1 - 0.15 * alt})`);
    pShadow.setAttribute("opacity", String(0.25 + 0.3 * (1 - alt)));
    const bank = rm ? 0 : Math.sin(time / 1400) * 3 * alt;
    plane.setAttribute(
      "transform",
      `translate(${a.x - 28 * off} ${a.y - 46 * off}) rotate(${a.ang + bank}) scale(${psc})`,
    );

    /* camion */
    truck.setAttribute("transform", `translate(${r.x} ${r.y}) rotate(${r.ang}) scale(1.2)`);

    /* bateau */
    const bob = rm ? 0 : Math.sin(time / 900) * 0.6;
    ship.setAttribute("transform", `translate(${sh.x} ${sh.y}) rotate(${sh.ang + bob})`);
    wake.setAttribute("opacity", (0.35 * Math.min(1, 8 * tS * (1 - tS))).toFixed(3));
    wake.setAttribute("stroke-width", String(3 / sc));

    /* nuages (parallaxe au-dessus de la carte) */
    const par = 1.7;
    const cop = alt * (1 - w) * 0.9 * (p < 0.34 ? 1 : 0) * sm(s(p, 0.07, 0.12));
    skyClouds.forEach((d, c) => {
      const el = cEls[c];
      const cx = A.x + (d[0] - C.x) * sc * par, cy = A.y + (d[1] - C.y) * sc * par, sz = d[2] * sc * par;
      el.style.width = `${sz}px`;
      el.style.height = `${sz * 0.62}px`;
      el.style.transform = `translate3d(${cx - sz / 2}px,${cy - sz * 0.31}px,0)`;
      el.style.opacity = String(cop);
    });

    /* textes */
    const ho = 1 - sm(s(p, 0.03, 0.07));
    hero.style.opacity = String(ho);
    hero.style.pointerEvents = ho > 0.5 ? "auto" : "none";
    hero.style.transform = mobile
      ? `translateY(${-20 * (1 - ho)}px)`
      : `translateY(calc(-50% + ${-20 * (1 - ho)}px))`;
    hint.style.opacity = String(1 - s(p, 0, 0.025));
    panels.forEach((pn) => {
      const o = win(p, +(pn.dataset.a ?? 0), +(pn.dataset.b ?? 0));
      pn.style.opacity = String(o);
      pn.style.pointerEvents = o > 0.6 ? "auto" : "none";
      pn.style.transform = mobile
        ? `translateY(${16 * (1 - o)}px)`
        : `translateY(calc(-50% + ${16 * (1 - o)}px))`;
    });
    const prog = [tA, tR, tS], ph = p < 0.35 ? 0 : p < 0.7 ? 1 : 2;
    for (let h = 0; h < 3; h++) {
      hudBars[h].style.transform = `scaleX(${prog[h]})`;
      hud[h].className = h === ph && p > 0.05 && p < 0.95 ? "on" : "";
    }
  }

  let target = 0, cur = 0, raf = 0;
  const readP = () => {
    const r = sec.getBoundingClientRect();
    target = cl(-r.top / Math.max(1, r.height - stage.clientHeight), 0, 1);
  };
  const frame = (t: number) => {
    cur = rm ? target : cur + (target - cur) * 0.12;
    if (Math.abs(target - cur) < 0.00015) cur = target;
    update(cur, t);
    raf = requestAnimationFrame(frame);
  };
  const onResize = () => {
    measure();
    readP();
  };

  window.addEventListener("scroll", readP, { passive: true });
  window.addEventListener("resize", onResize);
  /* la hauteur du hero change au chargement des polices : on remesure */
  const ro = new ResizeObserver(onResize);
  ro.observe(hero);
  measure();
  readP();
  cur = target;
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("scroll", readP);
    window.removeEventListener("resize", onResize);
    ro.disconnect();
  };
}
