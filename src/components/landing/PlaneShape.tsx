/**
 * Avion de ligne vu de dessus, nez vers +x (≈ 312 × 300 unités, centré sur l'origine).
 * Utilisé dans le parcours animé et sur la carte « Fret aérien ».
 * `id` préfixe les dégradés : il doit être unique dans la page.
 */

const ARROW = "/brand/lst-fleche.png";

/** Contours partagés par l'avion et son ombre. */
const FUSELAGE =
  "M150 0C150 -9 140 -15 118 -15L-100 -15C-125 -15 -150 -9 -160 -4L-162 0L-160 4C-150 9 -125 15 -100 15L118 15C140 15 150 9 150 0Z";
const WINGS =
  "M32 -13C10 -40 -30 -110 -50 -146L-62 -150L-70 -146L-40 -60L-38 -13Z" +
  "M32 13C10 40 -30 110 -50 146L-62 150L-70 146L-40 60L-38 13Z";
const STABILIZERS = "M-112 -10L-140 -56L-153 -57L-146 -10ZM-112 10L-140 56L-153 57L-146 10Z";

/** Réacteurs : [x arrière, y centre]. Ils passent sous l'aile, seul l'avant dépasse. */
const ENGINES: [number, number][] = [
  [-24, -62],
  [-52, -108],
  [-24, 62],
  [-52, 108],
];

export function PlaneShape({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c3c7ce" />
          <stop offset=".3" stopColor="#ffffff" />
          <stop offset=".62" stopColor="#f2f3f5" />
          <stop offset="1" stopColor="#aeb3bb" />
        </linearGradient>
        <linearGradient id={`${id}-wing`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#f4f5f7" />
          <stop offset="1" stopColor="#c9ccd2" />
        </linearGradient>
        <linearGradient id={`${id}-engine`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7d828a" />
          <stop offset=".45" stopColor="#c4c7cc" />
          <stop offset="1" stopColor="#6c7178" />
        </linearGradient>
      </defs>

      {/* réacteurs (dessinés avant les ailes : seul l'avant reste visible) */}
      {ENGINES.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y - 8} width="40" height="16" rx="7" fill={`url(#${id}-engine)`} />
          <ellipse cx={x + 39} cy={y} rx="3" ry="6" fill="#3d4148" />
        </g>
      ))}

      {/* ailes, volets et saumons jaunes */}
      <path d={WINGS} fill={`url(#${id}-wing)`} stroke="#b4b8bf" strokeWidth="1" strokeLinejoin="round" />
      <path
        d="M-31 -22L-33 -56M-35 -66L-57 -128M-31 22L-33 56M-35 66L-57 128"
        stroke="#9a9ea6"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity=".7"
      />
      <path d="M-50 -146L-62 -150L-70 -146M-50 146L-62 150L-70 146" fill="none" stroke="#F8B80B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

      {/* empennage */}
      <path d={STABILIZERS} fill={`url(#${id}-wing)`} stroke="#b4b8bf" strokeWidth="1" strokeLinejoin="round" />

      {/* fuselage */}
      <path d={FUSELAGE} fill={`url(#${id}-body)`} stroke="#aeb3bb" strokeWidth="1" />
      <path d="M112 -6L-96 -6" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity=".7" />

      {/* dérive (vue de dessus) aux couleurs LST */}
      <rect x="-163" y="-3.5" width="56" height="7" rx="3.5" fill="#F8B80B" />

      {/* cockpit */}
      <path d="M126 -9Q141 -7 145 0Q141 7 126 9Q130 0 126 -9Z" fill="#1f2228" />
      <path d="M128 -5.5Q138 -4 141 0" fill="none" stroke="#9fc7ea" strokeWidth="1.4" strokeLinecap="round" opacity=".8" />

      {/* logo LST sur le fuselage */}
      <image href={ARROW} x="42" y="-10" width="60" height="20" />
    </>
  );
}

/** Silhouette pleine de l'avion (pour l'ombre portée au sol). */
export function PlaneSilhouette() {
  return (
    <>
      <path d={WINGS} />
      <path d={STABILIZERS} />
      <path d={FUSELAGE} />
      {ENGINES.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y - 8} width="40" height="16" rx="7" />
      ))}
    </>
  );
}
