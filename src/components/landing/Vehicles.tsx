/**
 * Camion et porte-conteneurs vus de dessus, avant vers +x, centrés sur l'origine.
 * Utilisés dans le parcours animé et sur les cartes « Transport terrestre » / « Fret maritime ».
 * `id` préfixe les dégradés : il doit être unique dans la page.
 */

const ARROW = "/brand/lst-fleche.png";

/* ------------------------------------------------------------------ camion (≈ 92 × 27) */

/** Pneus visibles sous la remorque et la cabine : x de chaque essieu. */
const AXLES = [-40, -33, 27, 38];
/** Nervures du toit de la remorque. */
const RIBS = "M-38 -11v22M-30 -11v22M-22 -11v22M-14 -11v22M-6 -11v22M2 -11v22M10 -11v22";

export function TruckShape({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-trailer`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d5d8dd" />
          <stop offset=".3" stopColor="#ffffff" />
          <stop offset=".7" stopColor="#f2f3f5" />
          <stop offset="1" stopColor="#c3c7ce" />
        </linearGradient>
        <linearGradient id={`${id}-cab`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d99e00" />
          <stop offset=".35" stopColor="#ffc93a" />
          <stop offset=".7" stopColor="#F8B80B" />
          <stop offset="1" stopColor="#c98f00" />
        </linearGradient>
      </defs>

      {/* ombre portée */}
      <rect x="-45" y="-9.5" width="92" height="23" rx="4" fill="#000" opacity=".35" />

      {/* pneus */}
      <g fill="#16181c">
        {AXLES.map((x) => (
          <g key={x}>
            <rect x={x} y="-12.6" width="5" height="2" rx="1" />
            <rect x={x} y="10.6" width="5" height="2" rx="1" />
          </g>
        ))}
      </g>

      {/* remorque : toit nervuré, portes arrière, logo LST */}
      <rect x="-46" y="-11" width="66" height="22" rx="2" fill={`url(#${id}-trailer)`} stroke="#b4b8bf" strokeWidth=".6" />
      <path d={RIBS} stroke="#000" strokeWidth=".8" opacity=".06" />
      <path d="M-44 -10v20" stroke="#9a9ea6" strokeWidth=".8" />
      <image href={ARROW} x="-36" y="-7" width="42" height="14" />

      {/* attelage */}
      <rect x="20" y="-3" width="5" height="6" fill="#2a2c31" />

      {/* cabine : toit, déflecteur, pare-brise, rétroviseurs, phares */}
      <path d="M24 -11H39Q45 -11 45 -5V5Q45 11 39 11H24Z" fill={`url(#${id}-cab)`} stroke="#b88400" strokeWidth=".6" />
      <path d="M25 -9H34Q36 -9 36 -7V7Q36 9 34 9H25Z" fill="#ffd766" opacity=".55" />
      <path d="M38.5 -9Q41 -9 42.5 -7.5V7.5Q41 9 38.5 9Z" fill="#1f2228" />
      <path d="M40.2 -6v3.5" stroke="#9fc7ea" strokeWidth=".8" strokeLinecap="round" opacity=".7" />
      <rect x="37" y="-13.6" width="3" height="2.6" rx=".6" fill="#16181c" />
      <rect x="37" y="11" width="3" height="2.6" rx=".6" fill="#16181c" />
      <rect x="44.4" y="-8.5" width="1" height="3" rx=".4" fill="#fff6d6" />
      <rect x="44.4" y="5.5" width="1" height="3" rx=".4" fill="#fff6d6" />
    </>
  );
}

/* ------------------------------------------------------- porte-conteneurs (≈ 346 × 60) */

export type ShipContainer = { x: number; y: number; fill: string };

const HULL =
  "M-150 -30H70C118 -30 150 -17 172 0C150 17 118 30 70 30H-150Q-162 30 -162 18V-18Q-162 -30 -150 -30Z";
const DECK =
  "M-146 -25H68C108 -25 136 -14 154 0C136 14 108 25 68 25H-146Q-154 25 -154 17V-17Q-154 -25 -146 -25Z";

/** Grille de conteneurs par défaut (9 rangées × 4), couleurs en rotation. */
const DEFAULT_COLORS = ["#F2F3F5", "#5c6169", "#3d4148", "#F8B80B"];
export const defaultContainers: ShipContainer[] = Array.from({ length: 9 }, (_, col) =>
  [-24, -12, 0, 12].map((y, row) => ({ x: -104 + col * 24, y, fill: DEFAULT_COLORS[(col + row) % 4] })),
).flat();

export function ShipShape({ id, containers = defaultContainers }: { id: string; containers?: ShipContainer[] }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-hull`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a3d44" />
          <stop offset=".5" stopColor="#2a2c31" />
          <stop offset="1" stopColor="#1e2024" />
        </linearGradient>
        <linearGradient id={`${id}-bridge`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d5d8dd" />
          <stop offset=".35" stopColor="#ffffff" />
          <stop offset="1" stopColor="#c3c7ce" />
        </linearGradient>
      </defs>

      {/* ombre portée et vague d'étrave */}
      <path d={HULL} fill="#000" opacity=".3" transform="translate(4 6)" />
      <path d="M140 -27Q168 -12 184 0Q168 12 140 27" fill="none" stroke="#F2F3F5" strokeWidth="2" strokeLinecap="round" opacity=".35" />

      {/* coque (liseré jaune LST) et pont */}
      <path d={HULL} fill={`url(#${id}-hull)`} stroke="#F8B80B" strokeWidth="2.5" />
      <path d={DECK} fill="#3a3d44" />

      {/* gaillard avant : guindeaux et mât */}
      <path d="M114 -18C132 -14 146 -7 154 0C146 7 132 14 114 18Z" fill="#474b53" />
      <circle cx="128" cy="-7" r="2.2" fill="#23252a" />
      <circle cx="128" cy="7" r="2.2" fill="#23252a" />
      <circle cx="141" cy="0" r="1.6" fill="#F8B80B" />

      {/* conteneurs, avec un reflet sur le dessus */}
      <g>
        {containers.map((c, i) => (
          <g key={i}>
            <rect x={c.x} y={c.y} width="22" height="11" rx=".6" fill={c.fill} stroke="#000" strokeOpacity=".35" strokeWidth=".8" />
            <path d={`M${c.x + 1.5} ${c.y + 1.6}H${c.x + 20.5}`} stroke="#fff" strokeWidth=".8" opacity=".25" />
          </g>
        ))}
      </g>

      {/* canots de sauvetage */}
      <rect x="-112" y="-25" width="10" height="4" rx="2" fill="#c4c7cc" />
      <rect x="-112" y="21" width="10" height="4" rx="2" fill="#c4c7cc" />

      {/* passerelle : ailerons, vitrage avant, cheminée jaune */}
      <rect x="-125" y="-29" width="8" height="58" rx="2" fill="#e4e6ea" />
      <rect x="-152" y="-26" width="34" height="52" rx="4" fill={`url(#${id}-bridge)`} stroke="#9a9ea6" strokeWidth=".6" />
      <rect x="-122.5" y="-23" width="3" height="46" rx="1.5" fill="#1f2228" />
      <path d="M-121 -18v8" stroke="#9fc7ea" strokeWidth=".9" strokeLinecap="round" opacity=".7" />
      <rect x="-146" y="-7" width="12" height="14" rx="3" fill="#F8B80B" />
      <rect x="-144" y="-4" width="8" height="8" rx="2" fill="#161616" />
    </>
  );
}
