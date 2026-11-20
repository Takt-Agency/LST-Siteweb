"use client";
/* eslint-disable react-hooks/immutability -- modèle react-three-fiber : les uniforms sont mis à jour
   impérativement à chaque image dans useFrame, sans re-rendu React. */

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useIsMobile } from "@/lib/motion-prefs";

/** État de la scène, écrit par la timeline du parcours (fractions de l'écran). */
export type OceanState = {
  /** Facteur de zoom (1 = proche ; plus petit = dézoom). */
  zoom: number;
  /** Centre du navire (0 → 1) et longueur (fraction de la largeur de l'écran). */
  shipX: number;
  shipY: number;
  shipLen: number;
  /** Rapport largeur / longueur de la coque (vue du dessus). */
  shipBeam: number;
  /** Vitesse d'avance (unités de texture par seconde). */
  speed: number;
  /** Intensité du sillage et de la vague d'étrave (0 = navire à quai, 1 = en route). */
  wake: number;
};

/* Normal map répétable (somme de vagues à fréquences entières + bruit lissé), générée une fois. */
function makeNormalMap(size = 256) {
  const h = new Float32Array(size * size);
  let seed = 9;
  const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const waves = Array.from({ length: 26 }, () => {
    const kx = Math.round((r() * 2 - 1) * 14), ky = Math.round((r() * 2 - 1) * 14);
    return { kx: kx || 1, ky, a: 1 / Math.sqrt(kx * kx + ky * ky + 1), ph: r() * Math.PI * 2 };
  });
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      let v = 0;
      for (const w of waves) v += w.a * Math.sin(((w.kx * x + w.ky * y) / size) * Math.PI * 2 + w.ph);
      h[y * size + x] = v;
    }
  const data = new Uint8Array(size * size * 4);
  const at = (x: number, y: number) => h[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * 2.2, dy = (at(x, y + 1) - at(x, y - 1)) * 2.2;
      const l = Math.hypot(dx, dy, 1);
      const i = (y * size + x) * 4;
      data[i] = ((-dx / l) * 0.5 + 0.5) * 255;
      data[i + 1] = ((-dy / l) * 0.5 + 0.5) * 255;
      data[i + 2] = ((1 / l) * 0.5 + 0.5) * 255;
      data[i + 3] = 255;
    }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
}

const vert = /* glsl */ `
  void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const frag = /* glsl */ `
  precision highp float;
  uniform sampler2D uNormal;
  uniform vec2 uRes; uniform float uTime; uniform float uZoom; uniform vec2 uOffset;
  uniform vec2 uShip; uniform float uLen; uniform float uBeam; uniform float uWake;

  void main() {
    vec2 p = gl_FragCoord.xy;
    float scale = 1.0 / (uRes.x * 0.42 * uZoom);
    vec2 uv = p * scale + uOffset;
    vec3 n1 = texture2D(uNormal, uv * 1.0 + vec2(uTime * 0.011, uTime * 0.007)).xyz * 2.0 - 1.0;
    vec3 n2 = texture2D(uNormal, uv * 2.7 + vec2(-uTime * 0.017, uTime * 0.013)).xyz * 2.0 - 1.0;
    vec3 n3 = texture2D(uNormal, uv * 7.1 + vec2(uTime * 0.031, -uTime * 0.021)).xyz * 2.0 - 1.0;
    vec3 n = normalize(vec3(n1.xy * 0.55 + n2.xy * 0.35 + n3.xy * 0.18, 1.0));

    vec3 sun = normalize(vec3(-0.35, 0.45, 0.82));
    vec3 view = vec3(0.0, 0.0, 1.0);
    float diff = dot(n, sun);
    float spec = pow(max(dot(reflect(-sun, n), view), 0.0), 140.0);
    float fres = pow(1.0 - max(dot(n, view), 0.0), 3.0);

    vec3 deep = vec3(0.016, 0.105, 0.19);
    vec3 mid = vec3(0.035, 0.22, 0.36);
    vec3 sky = vec3(0.55, 0.72, 0.86);
    vec3 col = mix(deep, mid, smoothstep(0.55, 1.0, diff));
    col += sky * fres * 0.35;
    col += vec3(1.0, 0.96, 0.88) * spec * 0.85;

    // Sillage (navire orienté vers +X) : bras de Kelvin (~19,5°) + remous central + écume de coque.
    vec2 q = p - uShip;
    float stern = -uLen * 0.5;
    float along = stern - q.x;            // > 0 derrière la poupe
    float lat = abs(q.y);
    float brk = n1.x * 0.5 + n2.y * 0.5;  // bruit pour casser l'écume
    float foam = 0.0;
    if (along > 0.0) {
      float arm = abs(lat - along * 0.354);
      foam += smoothstep(uBeam * 0.22, 0.0, arm + brk * uBeam * 0.15) * exp(-along / (uLen * 2.2)) * 0.85;
      float w = uBeam * (0.45 + along / (uLen * 2.5));
      foam += exp(-(lat * lat) / (w * w)) * exp(-along / (uLen * 1.4)) * (0.75 + brk * 0.35);
      foam *= uWake;
    }
    vec2 e = q / vec2(uLen * 0.5, uBeam * 0.5);
    float hull = length(e);
    foam += smoothstep(1.32, 1.02, hull + brk * 0.08) * (0.25 + 0.65 * uWake);
    float bow = smoothstep(uLen * 0.62, uLen * 0.46, q.x) * smoothstep(uLen * 0.38, uLen * 0.5, q.x);
    foam += bow * smoothstep(uBeam * 0.9, 0.0, lat) * 0.6 * uWake;
    foam = clamp(foam, 0.0, 1.0);
    col = mix(col, vec3(0.93, 0.96, 0.98), foam * smoothstep(0.15, 0.6, foam + brk * 0.3));

    gl_FragColor = vec4(col, 1.0);
  }`;

function Water({ state }: { state: { current: OceanState } }) {
  const { size, gl } = useThree();
  const offset = useRef(new THREE.Vector2(0, 0));
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        depthTest: false,
        uniforms: {
          uNormal: { value: makeNormalMap() },
          uRes: { value: new THREE.Vector2(1, 1) },
          uTime: { value: 0 },
          uZoom: { value: 1 },
          uOffset: { value: new THREE.Vector2() },
          uShip: { value: new THREE.Vector2() },
          uLen: { value: 100 },
          uBeam: { value: 20 },
          uWake: { value: 1 },
        },
      }),
    [],
  );
  useEffect(
    () => () => {
      (mat.uniforms.uNormal.value as THREE.Texture).dispose();
      mat.dispose();
    },
    [mat],
  );

  useFrame((s, dt) => {
    const st = state.current;
    const pr = gl.getPixelRatio();
    const w = size.width * pr, h = size.height * pr;
    const u = mat.uniforms;
    u.uRes.value.set(w, h);
    u.uTime.value = s.clock.elapsedTime;
    u.uZoom.value = st.zoom;
    // Le navire avance vers +X : l'eau défile sous lui.
    offset.current.x += dt * st.speed;
    u.uOffset.value.copy(offset.current);
    u.uShip.value.set(st.shipX * w, (1 - st.shipY) * h);
    u.uLen.value = st.shipLen * w * 0.96;
    u.uBeam.value = st.shipLen * w * st.shipBeam;
    u.uWake.value = st.wake;
  });

  return (
    <mesh material={mat} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

/** Océan vu du dessus (WebGL, décoratif) : animé en continu tant qu'il est visible. */
export default function Ocean({ state, active }: { state: { current: OceanState }; active: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  // Shader plein écran : densité de pixels 1 sur mobile (≈ 2× moins de pixels à calculer qu'en 1,5).
  const mobile = useIsMobile();
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={wrap} className="j-ocean-gl" aria-hidden="true">
      <Canvas
        dpr={mobile ? 1 : [1, 1.5]}
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
        frameloop={active && visible ? "always" : "never"}
      >
        <Water state={state} />
      </Canvas>
    </div>
  );
}
