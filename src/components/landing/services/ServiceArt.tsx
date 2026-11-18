import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faIndustry, faLocationDot, faPlane, faShip, faStore, faWarehouse } from "@fortawesome/free-solid-svg-icons";
import type { ServiceArtKind } from "@/data/landing";
import { PlaneShape, PlaneSilhouette } from "@/components/landing/PlaneShape";

const ARROW = "/brand/lst-fleche.png";

/**
 * Illustration animée de chaque carte de service (scène SVG 480 × 360).
 * Les décors (route, mer, ville…) débordent volontairement du viewBox : le panneau
 * les recadre, quelle que soit sa proportion. Les animations ne tournent que sur la
 * carte au premier plan (classe `.on` posée par ServiceStack).
 */
export function ServiceArt({ kind }: { kind: ServiceArtKind }) {
  const { scene, chips } = arts[kind];
  return (
    <div className={`art art-${kind}`} aria-hidden="true">
      {scene}
      <span className="chip c1">
        <i />
        {chips[0]}
      </span>
      <span className="chip c2">
        <i />
        {chips[1]}
      </span>
    </div>
  );
}

/* ---------- helpers ---------- */

/** Pictogramme Font Awesome centré sur (x, y). */
function Glyph({ icon, x, y, size, fill }: { icon: IconDefinition; x: number; y: number; size: number; fill: string }) {
  const [w, h, , , d] = icon.icon;
  return (
    <svg x={x - size / 2} y={y - size / 2} width={size} height={size} viewBox={`0 0 ${w} ${h}`}>
      <path d={Array.isArray(d) ? d.join(" ") : d} fill={fill} />
    </svg>
  );
}

/** Houle répétée (période `len`) : une translation de -len la fait boucler sans à-coup. */
function wave(y: number, amp: number, len: number) {
  let d = `M-480 ${y}`;
  for (let x = -480; x < 1040; x += len) d += ` q${len / 4} ${-amp} ${len / 2} 0 t${len / 2} 0`;
  return `${d} V900 H-480 Z`;
}

/* ---------- route ---------- */

/** Immeubles en arrière-plan : [x, largeur, hauteur]. */
const CITY: [number, number, number][] = [
  [-200, 44, 80], [-150, 30, 116], [-114, 48, 90], [-60, 36, 132], [-18, 52, 96], [40, 30, 150],
  [76, 44, 106], [126, 36, 78], [168, 56, 120], [230, 30, 92], [266, 48, 142], [320, 38, 98],
  [364, 54, 124], [424, 34, 82], [464, 46, 110], [516, 40, 74], [562, 50, 118], [618, 36, 90],
];

function Wheel({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 286)`}>
      <circle r="21" fill="#0b0b0c" />
      <g className="tk-wheel">
        <circle r="12.5" fill="#5c6169" />
        <path d="M-12 0H12M0 -12V12" stroke="#2a2c31" strokeWidth="3" />
        <circle r="4.5" fill="#c4c7cc" />
      </g>
    </g>
  );
}

const truck = (
  <svg viewBox="0 0 480 360">
    <defs>
      <linearGradient id="tk-beam" x1="0" x2="1">
        <stop offset="0" stopColor="#F8B80B" stopOpacity=".45" />
        <stop offset="1" stopColor="#F8B80B" stopOpacity="0" />
      </linearGradient>
    </defs>

    <circle cx="372" cy="98" r="80" fill="#F8B80B" opacity=".07" />
    <circle cx="372" cy="98" r="40" fill="#F8B80B" />

    <g fill="#26282d">
      {CITY.map(([x, w, h]) => (
        <rect key={x} x={x} y={256 - h} width={w} height={h} />
      ))}
    </g>
    <g fill="#F8B80B" opacity=".5">
      {CITY.flatMap(([x, w, h], i) =>
        Array.from({ length: Math.floor((h - 30) / 18) }, (_, r) =>
          (i + r) % 3 === 0 ? <rect key={`${x}-${r}`} x={x + 8 + ((i + r) % 2) * (w - 22)} y={256 - h + 12 + r * 18} width="6" height="7" /> : null,
        ),
      )}
    </g>

    {/* chaussée */}
    <rect x="-600" y="256" width="1680" height="900" fill="#1c1d21" />
    <rect x="-600" y="256" width="1680" height="86" fill="#2a2c31" />
    <path d="M-600 257H1080M-600 341H1080" stroke="#3d4148" strokeWidth="2" />
    <path className="tk-dash" d="M-600 324H1080" stroke="#F2F3F5" strokeWidth="4" strokeDasharray="28 24" opacity=".8" />

    <g className="tk-speed" stroke="#F2F3F5" strokeWidth="3" strokeLinecap="round">
      <path d="M8 192h40" />
      <path d="M-10 222h52" />
      <path d="M14 248h30" />
    </g>

    <ellipse cx="236" cy="308" rx="196" ry="6" fill="#000" opacity=".4" />

    <g className="tk-body">
      {/* remorque */}
      <rect x="56" y="154" width="244" height="110" rx="6" fill="#F2F3F5" />
      <path d="M70 162V256" stroke="#c4c7cc" strokeWidth="2" />
      <image href={ARROW} x="96" y="179" width="180" height="60" />
      <rect x="56" y="250" width="244" height="8" fill="#F8B80B" />
      <rect x="52" y="262" width="346" height="10" rx="2" fill="#3d4148" />

      {/* tracteur */}
      <rect x="312" y="144" width="7" height="36" rx="3" fill="#9a9ea6" />
      <path d="M306 272V188Q306 178 316 178H354Q366 178 373 188L398 222Q410 230 410 244V262Q410 272 400 272Z" fill="#F8B80B" />
      <path d="M352 188H360Q366 188 370 194L388 222H352Z" fill="#9fc7ea" />
      <path d="M342 196V258" stroke="#c88f00" strokeWidth="2" />
      <rect x="330" y="230" width="8" height="3" rx="1.5" fill="#161616" opacity=".5" />
      <rect x="402" y="236" width="8" height="10" rx="2" fill="#fff" />
      <path d="M410 241L540 206V280Z" fill="url(#tk-beam)" />
      <rect x="396" y="258" width="18" height="14" rx="3" fill="#3d4148" />
    </g>

    {[96, 140, 330, 386].map((x) => (
      <Wheel key={x} x={x} />
    ))}
  </svg>
);

/* ---------- mer ---------- */

/** Hauteur (en conteneurs) de chaque colonne du pont. */
const STACKS = [3, 4, 3, 4, 4, 3, 4, 2, 3, 3];
const BOX_COLORS = ["#F2F3F5", "#3d4148", "#ffffff", "#5c6169", "#161616"];

const ship = (
  <svg viewBox="0 0 480 360">
    <defs>
      <pattern id="sh-ridge" width="4" height="4" patternUnits="userSpaceOnUse">
        <rect width="1.3" height="4" fill="#000" opacity=".16" />
      </pattern>
    </defs>

    <circle cx="364" cy="92" r="86" fill="#fff" opacity=".14" />
    <circle cx="364" cy="92" r="46" fill="#fff" opacity=".4" />

    <g className="sh-birds" fill="none" stroke="#161616" strokeWidth="2" strokeLinecap="round">
      <path d="M86 86q7 -7 14 0q7 -7 14 0" />
      <path d="M126 64q5 -5 10 0q5 -5 10 0" />
    </g>

    {/* grues du port, au loin */}
    <g stroke="#161616" strokeWidth="4" opacity=".16" fill="none">
      <path d="M-70 240V140M-34 240V140M-96 140H30M20 140V190" />
      <path d="M470 240V150M506 240V150M440 150H560M450 150V196" />
    </g>

    <path className="sh-wave-b" d={wave(242, 4, 80)} fill="#E5A800" />

    <g className="sh-ship">
      <g className="sh-smoke" fill="#fff">
        <circle cx="103" cy="112" r="7" />
        <circle cx="112" cy="96" r="9" />
        <circle cx="124" cy="78" r="11" />
      </g>

      {/* conteneurs */}
      {STACKS.map((n, col) => {
        const x = 136 + col * 27;
        return (
          <g key={col}>
            {Array.from({ length: n }, (_, row) => (
              <rect
                key={row}
                x={x}
                y={191 - row * 15}
                width="25"
                height="14"
                fill={BOX_COLORS[(col * 2 + row) % BOX_COLORS.length]}
              />
            ))}
            <rect x={x} y={205 - n * 15} width="25" height={n * 15} fill="url(#sh-ridge)" />
          </g>
        );
      })}

      {/* château */}
      <rect x="94" y="120" width="18" height="30" rx="2" fill="#161616" />
      <rect x="94" y="128" width="18" height="6" fill="#F8B80B" />
      <rect x="78" y="146" width="52" height="7" rx="2" fill="#F2F3F5" />
      <rect x="82" y="152" width="44" height="54" rx="3" fill="#F2F3F5" />
      <rect x="86" y="158" width="36" height="8" rx="2" fill="#161616" />
      <path d="M88 178H120M88 190H120" stroke="#c4c7cc" strokeWidth="2" />
      <path d="M424 206V172" stroke="#161616" strokeWidth="2.5" />

      {/* coque */}
      <path d="M56 204H446Q452 204 450 210L430 256Q427 264 418 264H92Q80 264 75 253Z" fill="#161616" />
      <path d="M62 222H442" stroke="#F2F3F5" strokeWidth="2" opacity=".35" />
      <image href={ARROW} x="318" y="226" width="78" height="26" />
      <path d="M436 252q10 -2 18 4" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".7" />
    </g>

    <path className="sh-wave-f" d={wave(254, 5, 96)} fill="#D29800" />
    <g stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity=".45">
      <path d="M40 290h26M180 304h40M330 286h22M420 314h30" />
    </g>
  </svg>
);

/* ---------- air ---------- */

function Cloud({ x, y, s, className }: { x: number; y: number; s: number; className: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        className={className}
        d="M12 0H112A20 20 0 0 0 102 -36A28 28 0 0 0 52 -48A24 24 0 0 0 14 -26A14 14 0 0 0 12 0Z"
        fill="#fff"
      />
    </g>
  );
}

const ROUTE = "M64 300C150 260 250 120 420 84";

const plane = (
  <svg viewBox="0 0 480 360">
    <Cloud x={-10} y={140} s={1} className="pl-cloud" />
    <Cloud x={340} y={268} s={0.85} className="pl-cloud pl-cloud-2" />
    <Cloud x={300} y={60} s={0.55} className="pl-cloud pl-cloud-3" />

    <path d={ROUTE} fill="none" stroke="#b4b8bf" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" />
    <path className="pl-trail" d={ROUTE} pathLength="100" fill="none" stroke="#F8B80B" strokeWidth="4" strokeLinecap="round" strokeDasharray="55 100" />

    <circle cx="64" cy="300" r="10" fill="#fff" stroke="#161616" strokeWidth="3" />
    <circle cx="64" cy="300" r="3.5" fill="#161616" />
    <circle className="pl-pulse" cx="420" cy="84" r="12" fill="none" stroke="#F8B80B" strokeWidth="3" />
    <Glyph icon={faLocationDot} x={420} y={66} size={36} fill="#161616" />

    {/* ombre portée puis avion */}
    <g transform="translate(246 206) rotate(-37) scale(.46)" fill="#161616" opacity=".06">
      <PlaneSilhouette />
    </g>
    <g transform="translate(228 177)">
      <g className="pl-plane">
        <g transform="rotate(-37) scale(.5)">
          <PlaneShape id="svc-plane" />
        </g>
      </g>
    </g>
  </svg>
);

/* ---------- douane ---------- */

const BARCODE = [3, 1, 2, 1, 4, 1, 1, 3, 2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2];

const customs = (
  <svg viewBox="0 0 480 360">
    <defs>
      <pattern id="cu-ridge" width="10" height="10" patternUnits="userSpaceOnUse">
        <rect width="3" height="10" fill="#fff" opacity=".06" />
      </pattern>
      <clipPath id="cu-sheet">
        <rect x="128" y="58" width="180" height="240" rx="10" />
      </clipPath>
      <linearGradient id="cu-glow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F8B80B" stopOpacity="0" />
        <stop offset="1" stopColor="#F8B80B" stopOpacity=".35" />
      </linearGradient>
    </defs>

    <ellipse cx="230" cy="318" rx="210" ry="10" fill="#161616" opacity=".12" />

    {/* conteneur à l'arrière-plan */}
    <rect x="22" y="112" width="200" height="146" rx="8" fill="#161616" />
    <rect x="22" y="112" width="200" height="146" rx="8" fill="url(#cu-ridge)" />
    <path d="M40 128V242M58 128V242" stroke="#F2F3F5" strokeWidth="3" strokeLinecap="round" opacity=".25" />
    <image href={ARROW} x="66" y="226" width="48" height="16" />

    {/* liasse de documents */}
    <rect x="112" y="70" width="176" height="236" rx="10" fill="#fff" opacity=".5" transform="rotate(-8 200 188)" />
    <rect x="134" y="66" width="180" height="240" rx="10" fill="#161616" opacity=".14" />
    <rect x="128" y="58" width="180" height="240" rx="10" fill="#fff" />
    <rect x="148" y="80" width="56" height="10" rx="3" fill="#161616" />
    <rect x="252" y="78" width="38" height="14" rx="4" fill="#F8B80B" />
    <rect x="148" y="108" width="140" height="6" rx="3" fill="#dfe1e5" />
    <rect x="148" y="122" width="104" height="6" rx="3" fill="#dfe1e5" />
    {[148, 174, 200].map((y) => (
      <g key={y}>
        <rect x="148" y={y} width="16" height="16" rx="4" fill="#161616" />
        <path d={`M152 ${y + 8.5}l3 3l6 -7`} fill="none" stroke="#F8B80B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="174" y={y + 5} width={y === 174 ? 74 : 98} height="6" rx="3" fill="#dfe1e5" />
      </g>
    ))}
    <g fill="#161616">
      {BARCODE.reduce<{ x: number; bars: React.ReactNode[] }>(
        (acc, w, i) => {
          if (i % 2 === 0) acc.bars.push(<rect key={i} x={acc.x} y="238" width={w * 1.6} height="34" />);
          acc.x += w * 1.6 + 1.6;
          return acc;
        },
        { x: 148, bars: [] },
      ).bars}
    </g>

    <g clipPath="url(#cu-sheet)">
      <g className="cu-scan">
        <rect x="128" y="46" width="180" height="26" fill="url(#cu-glow)" />
        <rect x="128" y="71" width="180" height="3" fill="#F8B80B" />
      </g>
    </g>

    {/* tampon « contrôlé » */}
    <g transform="translate(316 232) rotate(-14)">
      <g className="cu-stamp">
        <circle r="48" fill="#F8B80B" opacity=".25" />
        <circle r="46" fill="none" stroke="#161616" strokeWidth="5" />
        <circle r="36" fill="none" stroke="#161616" strokeWidth="1.6" strokeDasharray="3 4" />
        <path d="M-17 1l11 11l23 -25" fill="none" stroke="#161616" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  </svg>
);

/* ---------- logistique ---------- */

const HUB = { x: 240, y: 186 };
const NODES: { x: number; y: number; icon: IconDefinition; route: string }[] = [
  { x: 78, y: 96, icon: faIndustry, route: "M78 96C150 96 170 186 240 186" },
  { x: 78, y: 282, icon: faShip, route: "M78 282C150 282 170 186 240 186" },
  { x: 402, y: 96, icon: faPlane, route: "M240 186C310 186 330 96 402 96" },
  { x: 402, y: 282, icon: faStore, route: "M240 186C310 186 330 282 402 282" },
];

const logistics = (
  <svg viewBox="0 0 480 360">
    {NODES.map((n) => (
      <path key={n.route} d={n.route} fill="none" stroke="#b4b8bf" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" />
    ))}

    {/* colis en circulation (SMIL, mis en pause hors écran par ServiceStack) */}
    {NODES.map((n, i) => (
      <g key={`p-${n.route}`}>
        <rect x="-7" y="-7" width="14" height="14" rx="3" fill="#F8B80B" stroke="#161616" strokeWidth="2">
          <animateMotion dur="3.2s" begin={`-${i * 0.8}s`} repeatCount="indefinite" rotate="auto" path={n.route} />
        </rect>
      </g>
    ))}

    {NODES.map((n) => (
      <g key={`n-${n.route}`}>
        <circle cx={n.x} cy={n.y} r="33" fill="#fff" stroke="#161616" strokeWidth="2.5" />
        <Glyph icon={n.icon} x={n.x} y={n.y} size={28} fill="#161616" />
      </g>
    ))}

    <circle className="lg-pulse" cx={HUB.x} cy={HUB.y} r="52" fill="none" stroke="#F8B80B" strokeWidth="3" />
    <circle cx={HUB.x} cy={HUB.y} r="52" fill="#161616" />
    <circle cx={HUB.x} cy={HUB.y} r="44" fill="none" stroke="#F8B80B" strokeWidth="1.5" strokeDasharray="3 5" opacity=".6" />
    <Glyph icon={faWarehouse} x={HUB.x} y={HUB.y} size={44} fill="#F8B80B" />
  </svg>
);

/* ---------- conseil ---------- */

const BARS = [48, 70, 58, 92, 84, 124];
const TREND = "M92 204L134 182L176 194L218 160L260 168L302 128";

const consulting = (
  <svg viewBox="0 0 480 360">
    <rect x="44" y="58" width="316" height="240" rx="18" fill="#222428" stroke="#34373d" strokeWidth="1.5" />
    <g fill="#3d4148">
      <circle cx="68" cy="82" r="4.5" />
      <circle cx="83" cy="82" r="4.5" />
      <circle cx="98" cy="82" r="4.5" />
    </g>
    <rect x="118" y="78" width="96" height="8" rx="4" fill="#34373d" />
    <path d="M70 140H334M70 180H334M70 220H334M70 266H334" stroke="#2e3136" strokeWidth="1.5" />

    {BARS.map((h, i) => (
      <rect
        key={i}
        className="co-bar"
        style={{ "--d": `${i * 0.08}s` } as React.CSSProperties}
        x={80 + i * 42}
        y={266 - h}
        width="24"
        height={h}
        rx="4"
        fill={i === BARS.length - 1 ? "#F8B80B" : "#3d4148"}
      />
    ))}
    <path className="co-line" d={TREND} pathLength="1" fill="none" stroke="#F8B80B" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    {TREND.slice(1)
      .split("L")
      .map((pt) => {
        const [x, y] = pt.split(" ");
        return <circle key={pt} cx={x} cy={y} r="4.5" fill="#161616" stroke="#F8B80B" strokeWidth="2.5" />;
      })}

    {/* indicateur flottant */}
    <g className="co-kpi">
      <rect x="292" y="140" width="148" height="86" rx="16" fill="#F8B80B" />
      <circle cx="330" cy="183" r="20" fill="none" stroke="#161616" strokeWidth="7" opacity=".2" />
      <circle cx="330" cy="183" r="20" fill="none" stroke="#161616" strokeWidth="7" pathLength="100" strokeDasharray="72 100" strokeLinecap="round" transform="rotate(-90 330 183)" />
      <rect x="362" y="170" width="60" height="9" rx="4.5" fill="#161616" />
      <rect x="362" y="188" width="40" height="7" rx="3.5" fill="#161616" opacity=".45" />
    </g>

    {/* loupe : le diagnostic */}
    <g transform="translate(132 262)">
      <g className="co-mag">
        <circle r="30" fill="#F2F3F5" fillOpacity=".1" stroke="#F2F3F5" strokeWidth="6" />
        <path d="M22 22L46 46" stroke="#F2F3F5" strokeWidth="11" strokeLinecap="round" />
      </g>
    </g>
  </svg>
);

const arts: Record<ServiceArtKind, { scene: React.ReactNode; chips: [string, string] }> = {
  truck: { scene: truck, chips: ["National & international", "Porte-à-porte"] },
  ship: { scene: ship, chips: ["20’ · 40’ · 40’ HC", "Import / Export"] },
  plane: { scene: plane, chips: ["Envois urgents", "Groupage aérien"] },
  customs: { scene: customs, chips: ["Documents contrôlés", "Incoterms"] },
  logistics: { scene: logistics, chips: ["Coordination multimodale", "Flux planifiés"] },
  consulting: { scene: consulting, chips: ["Diagnostic", "Optimisation des coûts"] },
};
