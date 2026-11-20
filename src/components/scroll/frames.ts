/** Description d'une séquence d'images (voir scripts/encode-frames.mjs pour la production des fichiers). */
export type FrameSet = {
  /**
   * Modèle d'URL : `{i}` est remplacé par le numéro de la frame (complété par des zéros),
   * `{ext}` par « avif » ou « webp » selon le navigateur.
   * Ex. « /sequences/truck-rotate/desktop/frame_{i}.{ext} ».
   */
  pattern: string;
  /** Nombre de frames (numérotées à partir de 0). */
  count: number;
  /** Nombre de chiffres du numéro (3 par défaut : frame_000). */
  pad?: number;
  /** Largeur / hauteur des frames : fixe le ratio du conteneur et évite tout décalage de mise en page. */
  aspect?: number;
};

/** Progression 0 → 1 : une valeur, ou une référence lue à chaque image (écrite par une timeline GSAP). */
export type ProgressSource = number | { readonly current: number };

export const readProgress = (p: ProgressSource | undefined) =>
  typeof p === "number" ? p : (p?.current ?? 0);

export type FrameExt = "avif" | "webp";

export const frameUrl = (set: FrameSet, i: number, ext: FrameExt) =>
  set.pattern.replace("{i}", String(i).padStart(set.pad ?? 3, "0")).replace("{ext}", ext);

/* AVIF 1×1 avec canal alpha : si le navigateur le décode, les séquences AVIF (avec transparence) sont utilisables. */
const AVIF_PROBE =
  "data:image/avif;base64,AAAAHGZ0eXBhdmlmAAAAAG1pZjFhdmlmbWlhZgAAAXBtZXRhAAAAAAAAACFoZGxyAAAAAAAAAABwaWN0AAAAAAAAAAAAAAAAAAAAADRpbG9jAAAAAERAAAIAAQAAAAABlAABAAAAAAAAAB0AAgAAAAABsQABAAAAAAAAABAAAAA4aWluZgAAAAAAAgAAABVpbmZlAgAAAAABAABhdjAxAAAAABVpbmZlAgAAAAACAABhdjAxAAAAAA5waXRtAAAAAAABAAAAr2lwcnAAAACKaXBjbwAAAAxhdjFDgSACAAAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAcAAAAAA5waXhpAAAAAAEIAAAAOGF1eEMAAAAAdXJuOm1wZWc6bXBlZ0I6Y2ljcDpzeXN0ZW1zOmF1eGlsaWFyeTphbHBoYQAAAAAdaXBtYQAAAAAAAAACAAEDgQIDAAIEhAIFhgAAABppcmVmAAAAAAAAAA5hdXhsAAIAAQABAAAANW1kYXQSAAoHOAAGkBDQaTIQGUJjBMAANAAAkEDOl7ddEhIACgQYAAYVMgYYAAABQA8=";

let extPromise: Promise<FrameExt> | null = null;

/** Format retenu pour ce navigateur (testé une seule fois). */
export function preferredExt(): Promise<FrameExt> {
  extPromise ??= new Promise<FrameExt>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width > 0 ? "avif" : "webp");
    img.onerror = () => resolve("webp");
    img.src = AVIF_PROBE;
  });
  return extPromise;
}

/**
 * Ordre de chargement « grossier puis fin » : la frame de départ, puis une frame sur 16, sur 8, sur 4…
 * Le défilement est ainsi possible très tôt (on dessine la frame chargée la plus proche).
 */
export function loadOrder(count: number, first = 0): number[] {
  const seen = new Set<number>([first]);
  const out = [first];
  for (let step = 16; step >= 1; step = step >> 1) {
    for (let i = 0; i < count; i += step) {
      if (!seen.has(i)) {
        seen.add(i);
        out.push(i);
      }
    }
  }
  if (!seen.has(count - 1)) out.push(count - 1);
  return out;
}
