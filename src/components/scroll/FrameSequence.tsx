"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { useIsMobile, useReducedMotion } from "@/lib/motion-prefs";
import {
  frameUrl,
  loadOrder,
  preferredExt,
  readProgress,
  type FrameSet,
  type ProgressSource,
} from "./frames";

type Props = {
  /** Séquence desktop. */
  frames: FrameSet;
  /** Séquence allégée pour les écrans < 768 px (une frame sur deux, 960 px). */
  mobileFrames?: FrameSet;
  /**
   * Progression 0 → 1. Une valeur (re-rendu React) ou, de préférence, une référence `{ current }`
   * écrite par une timeline GSAP : elle est lue à chaque image, sans re-rendu.
   */
  progress?: ProgressSource;
  /**
   * Raccourci : crée un ScrollTrigger sur le conteneur (ou `trigger`) qui pilote la progression.
   * Ignoré si `progress` est fourni.
   */
  scrollTrigger?: Omit<ScrollTrigger.Vars, "onUpdate">;
  /** Ajustement de l'image dans le conteneur (comme object-fit). */
  fit?: "contain" | "cover";
  /** Point d'ancrage de l'image quand elle ne remplit pas le conteneur (0 → 1, 0.5 = centré). */
  align?: { x: number; y: number };
  /** Charger tout de suite (scène visible au chargement) plutôt qu'à l'approche de la scène. */
  priority?: boolean;
  /** Image statique (reduced-motion, attente du chargement). Par défaut : la frame `posterFrame` en WebP. */
  poster?: string;
  posterFrame?: number;
  /** Nombre de frames décodées gardées en mémoire (les autres restent compressées). */
  cacheSize?: number;
  className?: string;
  style?: CSSProperties;
};

/**
 * Séquence d'images pilotée par le défilement (technique « Apple ») : rendus 3D pré-calculés,
 * dessinés dans un <canvas>. Décoratif : aria-hidden, le texte de la scène reste dans le DOM.
 *
 * - chargement progressif (frame de départ, puis « grossier → fin »), à l'approche de la scène ;
 * - frames gardées compressées (Blob) ; décodage via createImageBitmap dans un petit cache LRU ;
 * - dessin seulement quand la frame affichée change ; DPR plafonné à 2 ; ResizeObserver ;
 * - boucle d'animation arrêtée hors écran (IntersectionObserver) ;
 * - reduced-motion : image statique uniquement.
 */
export function FrameSequence({
  frames,
  mobileFrames,
  progress,
  scrollTrigger,
  fit = "contain",
  align = { x: 0.5, y: 0.5 },
  priority = false,
  poster,
  posterFrame = 0,
  cacheSize,
  className,
  style,
}: Props) {
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  const set = mobile && mobileFrames ? mobileFrames : frames;
  // Clés primitives : un objet `frames` recréé à chaque rendu ne relance pas le chargement.
  const { pattern, count: frameCount, pad } = set;

  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);

  // Dernières valeurs des props lues par la boucle d'animation (sans relancer l'effet).
  const live = useRef({ progress, fit, align });
  useEffect(() => {
    live.current = { progress, fit, align };
  });

  const stVars = useRef(scrollTrigger);
  const hasExternalProgress = progress !== undefined;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const posterEl = posterRef.current;
    if (reduced || !wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const seq: FrameSet = { pattern, count: frameCount, pad };
    const count = frameCount;
    const blobs: (Blob | undefined)[] = new Array(count);
    const cache = new Map<number, ImageBitmap>(); // ordre d'insertion = ordre d'usage (LRU)
    const decoding = new Set<number>();
    const maxCache = cacheSize ?? (mobile ? 12 : 24);
    const abort = new AbortController();
    let destroyed = false;
    let drawn = -1;
    let dirty = true;
    let raf = 0;
    let visible = false;
    let started = false;
    let stProgress = 0;

    const target = () => {
      const p = hasExternalProgress ? readProgress(live.current.progress) : stProgress;
      return Math.round(Math.min(1, Math.max(0, p)) * (count - 1));
    };

    /** Libère les frames décodées les moins récemment utilisées, sauf celles autour de la frame visée. */
    const evict = () => {
      if (cache.size <= maxCache) return;
      const t = target();
      for (const k of cache.keys()) {
        if (cache.size <= maxCache) break;
        if (Math.abs(k - t) <= 2) continue;
        cache.get(k)?.close();
        cache.delete(k);
      }
    };

    const decode = (i: number) => {
      if (i < 0 || i >= count || cache.has(i) || decoding.has(i) || !blobs[i]) return;
      decoding.add(i);
      createImageBitmap(blobs[i]!)
        .then((bm) => {
          decoding.delete(i);
          if (destroyed) return bm.close();
          cache.set(i, bm);
          evict();
          dirty = true;
          request();
        })
        .catch(() => decoding.delete(i));
    };

    /** Frame décodée la plus proche de `t` (si la frame exacte n'est pas encore prête). */
    const nearest = (t: number) => {
      if (cache.has(t)) return t;
      let best = -1;
      for (const k of cache.keys()) if (best < 0 || Math.abs(k - t) < Math.abs(best - t)) best = k;
      return best;
    };

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.round(wrap.clientWidth * dpr));
      const h = Math.max(1, Math.round(wrap.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        dirty = true;
        request();
      }
    };

    const draw = (i: number) => {
      const bm = cache.get(i);
      if (!bm) return;
      // Marquer comme récemment utilisée.
      cache.delete(i);
      cache.set(i, bm);
      const { fit: f, align: a } = live.current;
      const cw = canvas.width, ch = canvas.height;
      const s = f === "cover" ? Math.max(cw / bm.width, ch / bm.height) : Math.min(cw / bm.width, ch / bm.height);
      const w = bm.width * s, h = bm.height * s;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(bm, (cw - w) * a.x, (ch - h) * a.y, w, h);
      if (drawn < 0) {
        canvas.style.opacity = "1";
        if (posterEl) posterEl.style.opacity = "0";
      }
      drawn = i;
      dirty = false;
    };

    let lastT = 0;
    const tick = () => {
      raf = 0;
      const t = target();
      // Décoder la frame visée et ses voisines, dans le sens du défilement.
      const dir = t >= lastT ? 1 : -1;
      lastT = t;
      decode(t);
      for (let k = 1; k <= 3; k++) decode(t + k * dir);
      decode(t - dir);
      const show = nearest(t);
      if (show >= 0 && (show !== drawn || dirty)) draw(show);
      if (visible) raf = requestAnimationFrame(tick);
    };
    function request() {
      if (!raf && visible) raf = requestAnimationFrame(tick);
    }

    const load = async () => {
      if (started) return;
      started = true;
      const ext = await preferredExt();
      const order = loadOrder(count, target());
      let next = 0;
      const worker = async () => {
        while (!destroyed && next < order.length) {
          const i = order[next++];
          try {
            const res = await fetch(frameUrl(seq, i, ext), { signal: abort.signal });
            if (!res.ok) continue;
            blobs[i] = await res.blob();
            // Les premières frames sont décodées tout de suite pour un affichage immédiat.
            if (cache.size < 2 || Math.abs(i - target()) <= 3) decode(i);
          } catch {
            return; // annulé
          }
        }
      };
      await Promise.all(Array.from({ length: priority ? 6 : 4 }, worker));
    };

    // Progression propre (raccourci scrollTrigger).
    let st: ScrollTrigger | undefined;
    if (!hasExternalProgress) {
      st = ScrollTrigger.create({
        trigger: wrap,
        start: "top bottom",
        end: "bottom top",
        ...stVars.current,
        onUpdate: (self) => {
          stProgress = self.progress;
          request();
        },
      });
      stProgress = st.progress;
    }

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    // Charger à l'approche (1,5 écran avant), animer seulement quand visible.
    const near = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          load();
          near.disconnect();
        }
      },
      { rootMargin: "150% 0px" },
    );
    if (priority) load();
    else near.observe(wrap);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && document.visibilityState === "visible";
      if (visible) request();
      else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(wrap);

    return () => {
      destroyed = true;
      abort.abort();
      cancelAnimationFrame(raf);
      ro.disconnect();
      near.disconnect();
      io.disconnect();
      st?.kill();
      cache.forEach((bm) => bm.close());
      cache.clear();
      canvas.style.opacity = "0";
      if (posterEl) posterEl.style.opacity = "1";
    };
  }, [reduced, mobile, pattern, frameCount, pad, cacheSize, priority, hasExternalProgress]);

  const posterSrc = poster ?? frameUrl(set, Math.min(posterFrame, set.count - 1), "webp");

  return (
    <div
      ref={wrapRef}
      className={className}
      aria-hidden="true"
      style={{
        position: "relative",
        aspectRatio: set.aspect ?? frames.aspect,
        ...style,
      }}
    >
      {/* Image statique : affichée avant le premier dessin du canvas, et seule en reduced-motion. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- frame déjà optimisée (AVIF/WebP), décorative */}
      <img
        ref={posterRef}
        src={posterSrc}
        alt=""
        decoding="async"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: fit,
          objectPosition: `${align.x * 100}% ${align.y * 100}%`,
          transition: "opacity .2s",
        }}
      />
      {!reduced && (
        <canvas
          ref={canvasRef}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0 }}
        />
      )}
    </div>
  );
}
