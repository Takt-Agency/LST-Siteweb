"use client";
/* eslint-disable react-hooks/immutability -- modèle react-three-fiber : uniforms, matériaux et étiquettes
   sont mis à jour impérativement à chaque image dans useFrame, sans re-rendu React. */

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { DESTINATIONS, NABEUL } from "@/data/hero";
import { arcPoints, landDots, latLonToVec } from "./globe-data";

export type GlobeProps = {
  /** Progression du défilement du hero (0 → 1), écrite par la timeline GSAP. */
  progress: { readonly current: number };
  reduced: boolean;
  mobile: boolean;
};

const RAD = Math.PI / 180;
const YELLOW = new THREE.Color("#f8b80b");
const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/* ----------------------------------------------------------------------------- shaders */
const dotsVert = /* glsl */ `
  uniform float uSize; uniform float uPixelRatio; uniform vec3 uHome;
  varying float vFacing; varying float vHome;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vFacing = normalize(normalMatrix * position).z;
    vHome = smoothstep(0.9965, 0.9992, dot(normalize(position), uHome));
    gl_PointSize = uSize * uPixelRatio * clamp(3.0 / -mv.z, 0.6, 1.6);
    gl_Position = projectionMatrix * mv;
  }`;
const dotsFrag = /* glsl */ `
  uniform vec3 uColor; uniform vec3 uYellow; uniform float uOpacity;
  varying float vFacing; varying float vHome;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.32, d) * smoothstep(-0.05, 0.45, vFacing);
    gl_FragColor = vec4(mix(uColor, uYellow, vHome), a * uOpacity * mix(0.85, 1.0, vHome));
  }`;

const glowVert = /* glsl */ `
  varying vec3 vN; varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`;
/** Halo atmosphérique (face arrière d'une sphère plus grande). */
const haloFrag = /* glsl */ `
  uniform vec3 uColor; uniform float uIntensity;
  varying vec3 vN; varying vec3 vView;
  void main() {
    // Face arrière : 1 au bord du globe (|n·v| ≈ 0,58), 0 au bord du halo (n·v = 0).
    float i = pow(clamp(-dot(vN, vView) / 0.58, 0.0, 1.0), 2.6);
    gl_FragColor = vec4(uColor, i * uIntensity);
  }`;
/** Liseré au bord du disque : jaune clair, puis fin filet jaune LST tout au bord. */
const rimFrag = /* glsl */ `
  uniform vec3 uBlue; uniform vec3 uYellow; uniform float uIntensity;
  varying vec3 vN; varying vec3 vView;
  void main() {
    float f = 1.0 - max(0.0, dot(vN, vView));
    vec3 c = uBlue * pow(f, 3.0) * 0.9 + uYellow * pow(f, 9.0) * 1.6;
    gl_FragColor = vec4(c, (pow(f, 3.0) * 0.5 + pow(f, 9.0)) * uIntensity);
  }`;

const arcVert = /* glsl */ `
  varying float vT;
  void main() { vT = uv.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const arcFrag = /* glsl */ `
  uniform float uHead; uniform vec3 uColor; uniform float uOpacity;
  varying float vT;
  void main() {
    float trail = smoothstep(uHead - 0.45, uHead, vT) * step(vT, uHead);
    float base = 0.16 * step(vT, min(uHead, 1.0));
    gl_FragColor = vec4(uColor, max(trail, base) * uOpacity);
  }`;

const starsVert = /* glsl */ `
  attribute float aPhase; attribute float aSize;
  uniform float uTime; uniform float uPixelRatio;
  varying float vTw;
  void main() {
    vTw = 0.55 + 0.45 * sin(uTime * 1.3 + aPhase);
    gl_PointSize = aSize * uPixelRatio;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;
const starsFrag = /* glsl */ `
  uniform float uOpacity; varying float vTw;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(vec3(0.85, 0.9, 1.0), smoothstep(0.5, 0.0, d) * vTw * uOpacity);
  }`;

/* ----------------------------------------------------------------------------- scène */
type LabelRef = { el: HTMLElement | null; pos: THREE.Vector3 };

type Layout = { fx: number };

function Scene({
  progress,
  reduced,
  mobile,
  labels,
  layout,
}: GlobeProps & { labels: React.RefObject<LabelRef[]>; layout: React.RefObject<Layout> }) {
  const { camera, gl, size, invalidate } = useThree();
  const globe = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const stars = useRef<THREE.Points>(null);
  const markers = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0, sx: 0, sy: 0 });
  const [dots, setDots] = useState<Float32Array | null>(null);

  useEffect(() => {
    let alive = true;
    landDots(mobile ? 1.45 : 0.9).then((d) => {
      if (!alive) return;
      setDots(d);
      invalidate();
    });
    return () => {
      alive = false;
    };
  }, [mobile, invalidate]);

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  const pr = gl.getPixelRatio();
  const home = useMemo(() => new THREE.Vector3(...latLonToVec(NABEUL.lat, NABEUL.lon)), []);

  const mats = useMemo(
    () => ({
      dots: new THREE.ShaderMaterial({
        vertexShader: dotsVert,
        fragmentShader: dotsFrag,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uSize: { value: mobile ? 2.6 : 2.2 },
          uPixelRatio: { value: pr },
          uColor: { value: new THREE.Color("#a9bdd2") },
          uYellow: { value: YELLOW },
          uHome: { value: home },
          uOpacity: { value: 1 },
        },
      }),
      halo: new THREE.ShaderMaterial({
        vertexShader: glowVert,
        fragmentShader: haloFrag,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: new THREE.Color("#f8b80b") }, uIntensity: { value: 0.2 } },
      }),
      rim: new THREE.ShaderMaterial({
        vertexShader: glowVert,
        fragmentShader: rimFrag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uBlue: { value: new THREE.Color("#ffd77a") },
          uYellow: { value: YELLOW },
          uIntensity: { value: 0.5 },
        },
      }),
      stars: new THREE.ShaderMaterial({
        vertexShader: starsVert,
        fragmentShader: starsFrag,
        transparent: true,
        depthWrite: false,
        uniforms: { uTime: { value: 0 }, uPixelRatio: { value: pr }, uOpacity: { value: 1 } },
      }),
    }),
    [mobile, pr, home],
  );

  const starGeo = useMemo(() => {
    const n = mobile ? 500 : 1100;
    const pos = new Float32Array(n * 3), phase = new Float32Array(n), sz = new Float32Array(n);
    let seed = 11;
    const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < n; i++) {
      const u = r() * 2 - 1, th = r() * Math.PI * 2, rad = 40 + r() * 20;
      const s = Math.sqrt(1 - u * u);
      pos.set([rad * s * Math.cos(th), rad * u, rad * s * Math.sin(th) - 10], i * 3);
      phase[i] = r() * 10;
      sz[i] = 0.8 + r() * r() * 2.2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    g.setAttribute("aSize", new THREE.BufferAttribute(sz, 1));
    return g;
  }, [mobile]);

  const arcs = useMemo(() => {
    const a = latLonToVec(NABEUL.lat, NABEUL.lon);
    return DESTINATIONS.map((d, i) => {
      const b = latLonToVec(d.lat, d.lon);
      const curve = new THREE.CatmullRomCurve3(arcPoints(a, b).map((p) => new THREE.Vector3(...p)));
      const geo = new THREE.TubeGeometry(curve, 64, mobile ? 0.0042 : 0.0032, 6, false);
      const mat = new THREE.ShaderMaterial({
        vertexShader: arcVert,
        fragmentShader: arcFrag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uHead: { value: reduced ? 1.45 : 0 }, uColor: { value: YELLOW }, uOpacity: { value: 1 } },
      });
      return { geo, mat, delay: i * 0.55, end: new THREE.Vector3(...b) };
    });
  }, [mobile, reduced]);

  const dotsGeo = useMemo(() => {
    if (!dots) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(dots, 3));
    return g;
  }, [dots]);

  useEffect(
    () => () => {
      Object.values(mats).forEach((m) => m.dispose());
      starGeo.dispose();
      arcs.forEach((a) => {
        a.geo.dispose();
        a.mat.dispose();
      });
      dotsGeo?.dispose();
    },
    [mats, starGeo, arcs, dotsGeo],
  );

  // Orientation de base : Tunisie / Méditerranée face à la caméra, un peu au-dessus du centre.
  const baseX = (NABEUL.lat - 8) * RAD, baseY = -(NABEUL.lon + 4) * RAD;
  const v = useMemo(() => new THREE.Vector3(), []);
  const n = useMemo(() => new THREE.Vector3(), []);
  const c = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    const p = progress.current;
    const t = state.clock.elapsedTime;
    const g = globe.current, tl = tilt.current;
    if (!g || !tl) return;

    // Rotation lente (oscillation autour de la Méditerranée) ; elle se fige en entrant dans l'atmosphère.
    const sway = reduced ? 0 : Math.sin(t * 0.07) * 0.22 * (1 - smooth(0.05, 0.5, p));
    const k = smooth(0, 0.8, p);
    g.rotation.set(baseX + (NABEUL.lat * RAD - baseX) * k, baseY + (-NABEUL.lon * RAD - baseY) * k + sway, 0, "XYZ");

    // Parallaxe souris (lissée).
    const pt = pointer.current;
    pt.sx += (pt.x - pt.sx) * Math.min(1, dt * 3);
    pt.sy += (pt.y - pt.sy) * Math.min(1, dt * 3);
    tl.rotation.set(pt.sy * 0.08, pt.sx * 0.12, 0);

    // Position et zoom : globe centré dans la moitié droite du conteneur de la navbar (desktop)
    // ou au-dessus du texte (écran étroit), puis plongée vers Nabeul, recentrée à l'écran.
    const wide = size.width / size.height > 1.1;
    const z = smooth(0.0, 1, p);
    // Globe à 70 % de sa taille initiale (caméra reculée), même plongée finale vers Nabeul.
    const dist = (wide ? 4.85 : 4.4) - (wide ? 3.6 : 3.15) * smooth(0.05, 1, p);
    camera.position.set(0, 0, dist);
    // Demi-largeur visible dans le plan du globe → décalage en unités 3D pour viser layout.fx de l'écran.
    const halfW = Math.tan(((camera as THREE.PerspectiveCamera).fov * RAD) / 2) * dist * (size.width / size.height);
    const x = wide ? (layout.current.fx - 0.5) * 2 * halfW : 0;
    tl.position.set(x * (1 - z), wide ? 0 : 0.62 * (1 - z), 0);
    camera.lookAt(0, tl.position.y * 0.4, 0);

    // Entrée dans l'atmosphère : étoiles puis points s'effacent, le halo s'intensifie.
    mats.stars.uniforms.uTime.value = t;
    mats.stars.uniforms.uOpacity.value = 1 - smooth(0.05, 0.45, p);
    mats.dots.uniforms.uOpacity.value = 1 - smooth(0.55, 0.9, p);
    // Halo jaune volontairement discret (0,2), un peu plus présent pendant la plongée.
    mats.halo.uniforms.uIntensity.value = 0.2 + 0.3 * smooth(0.3, 0.8, p);
    mats.rim.uniforms.uIntensity.value = 0.5 * (1 - smooth(0.6, 0.95, p));
    if (stars.current) stars.current.rotation.set(pt.sy * 0.02, t * 0.004 + pt.sx * 0.03, 0);

    // Marqueurs : taille apparente constante pendant la plongée, puis effacement.
    const camDist = camera.position.z - 1;
    const ms = Math.min(1, Math.max(0.12, camDist / 2.4)) * (1 - smooth(0.45, 0.7, p));
    markers.current?.children.forEach((m) => m.scale.setScalar(Math.max(0.0001, ms)));

    for (const a of arcs) {
      if (!reduced) a.mat.uniforms.uHead.value = ((t * 0.32 + 1.8 - a.delay) % 1.8 + 1.8) % 1.8;
      a.mat.uniforms.uOpacity.value = 1 - smooth(0.25, 0.6, p);
    }

    // Étiquettes HTML calées sur la projection des points.
    const L = labels.current;
    if (L) {
      for (const l of L) {
        if (!l.el) continue;
        v.copy(l.pos).applyMatrix4(g.matrixWorld);
        n.copy(v).sub(tl.position).normalize();
        const facing = n.dot(c.copy(camera.position).sub(v).normalize());
        v.project(camera);
        const x = (v.x * 0.5 + 0.5) * size.width, y = (-v.y * 0.5 + 0.5) * size.height;
        const o = smooth(0.2, 0.45, facing) * (1 - smooth(0.2, 0.5, p));
        l.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        l.el.style.opacity = o.toFixed(3);
      }
    }
  });

  return (
    <group ref={tilt}>
      <group ref={globe}>
        <mesh renderOrder={0}>
          <sphereGeometry args={[0.992, 64, 48]} />
          <meshBasicMaterial color="#0a1730" />
        </mesh>
        {dotsGeo && <points geometry={dotsGeo} material={mats.dots} renderOrder={1} />}
        {arcs.map((a, i) => (
          <mesh key={i} geometry={a.geo} material={a.mat} renderOrder={2} />
        ))}
        <group ref={markers}>
          <mesh position={home.clone().multiplyScalar(1.004)} renderOrder={3}>
            <sphereGeometry args={[0.009, 12, 12]} />
            <meshBasicMaterial color={YELLOW} />
          </mesh>
          {arcs.map((a, i) => (
            <mesh key={`e${i}`} position={a.end.clone().multiplyScalar(1.004)} renderOrder={3}>
              <sphereGeometry args={[0.0055, 8, 8]} />
              <meshBasicMaterial color={YELLOW} />
            </mesh>
          ))}
        </group>
      </group>
      <mesh material={mats.rim} renderOrder={4}>
        <sphereGeometry args={[1.0, 64, 48]} />
      </mesh>
      <mesh material={mats.halo} renderOrder={5}>
        <sphereGeometry args={[1.22, 64, 48]} />
      </mesh>
      <points ref={stars} geometry={starGeo} material={mats.stars} />
    </group>
  );
}

/** Globe en points (décoratif, aria-hidden) : terres Natural Earth, halo, arcs depuis Nabeul, étiquettes. */
export default function Globe({ progress, reduced, mobile }: GlobeProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const points = useMemo(
    () => [NABEUL, ...DESTINATIONS].map((d) => ({ name: d.name, home: d === NABEUL, left: !!d.labelLeft, pos: new THREE.Vector3(...latLonToVec(d.lat, d.lon, 1.01)) })),
    [],
  );
  const labels = useRef<LabelRef[]>([]);
  // Centre visé pour le globe (fraction de la largeur de l'écran) : milieu de la moitié droite du
  // conteneur de la navbar (.hero-frame), pour une composition équilibrée sous la navigation.
  const layout = useRef<Layout>({ fx: 0.7 });
  useEffect(() => {
    const frame = wrap.current?.closest(".hero-stage")?.querySelector<HTMLElement>(".hero-frame");
    if (!frame) return;
    const measure = () => {
      const r = frame.getBoundingClientRect();
      const cs = getComputedStyle(frame);
      const left = r.left + parseFloat(cs.paddingLeft), right = r.right - parseFloat(cs.paddingRight);
      layout.current.fx = (left + 0.75 * (right - left)) / window.innerWidth;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(frame);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="globe" aria-hidden="true">
      <Canvas
        dpr={mobile ? [1, 1.5] : [1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 4.85], fov: 38, near: 0.05, far: 200 }}
        frameloop={reduced ? "demand" : visible ? "always" : "never"}
      >
        <Scene progress={progress} reduced={reduced} mobile={mobile} labels={labels} layout={layout} />
      </Canvas>
      <div className="globe-labels">
        {points.map((p, i) => (
          <span
            key={p.name}
            ref={(el) => {
              labels.current[i] = { el, pos: p.pos };
            }}
            className={`globe-label mono${p.home ? " is-home" : ""}${p.left ? " is-left" : ""}`}
          >
            {p.name}
          </span>
        ))}
      </div>
    </div>
  );
}
