"use client";

import { useMemo } from "react";
import { Instances, Instance } from "@react-three/drei";
import * as THREE from "three";

/** Small deterministic PRNG so the skyline is stable across reloads / SSR. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Tower {
  pos: [number, number, number];
  scale: [number, number, number];
  color: string;
}

const RING_MIN = 68;
const RING_MAX = 150;
const COUNT = 130;

const TOWERS: Tower[] = (() => {
  const rng = mulberry32(20260608);
  const out: Tower[] = [];
  for (let i = 0; i < COUNT; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = RING_MIN + rng() * (RING_MAX - RING_MIN);
    const x = Math.sin(angle) * dist;
    const z = -Math.cos(angle) * dist;
    const w = 7 + rng() * 12;
    const d = 7 + rng() * 12;
    // Farther towers trend taller, for a believable downtown core.
    const tall = (dist - RING_MIN) / (RING_MAX - RING_MIN);
    const h = 16 + rng() * 40 + tall * 55;
    const light = 0.32 + rng() * 0.22;
    const hue = 0.58 + (rng() - 0.5) * 0.06;
    const color = new THREE.Color().setHSL(hue, 0.12, light).getStyle();
    out.push({ pos: [x, h / 2, z], scale: [w, h, d], color });
  }
  return out;
})();

/** Builds a tileable window-grid facade texture (client only). */
function makeWindowTexture(): THREE.Texture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 128;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#20242e";
  ctx.fillRect(0, 0, 64, 128);
  const cols = 6;
  const rows = 14;
  const pad = 2;
  const cw = (64 - pad * (cols + 1)) / cols;
  const rh = (128 - pad * (rows + 1)) / rows;
  const rng = mulberry32(99173);
  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      const lit = rng();
      const x = pad + col * (cw + pad);
      const y = pad + r * (rh + pad);
      if (lit > 0.78) ctx.fillStyle = "#ffe7b0"; // warm lit window
      else if (lit > 0.5) ctx.fillStyle = "#9fb4d6"; // cool glass
      else ctx.fillStyle = "#2b3140"; // dark
      ctx.fillRect(x, y, cw, rh);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 5);
  return tex;
}

/**
 * A distant downtown skyline ringing the mall plaza. Instanced boxes with a
 * shared window-grid facade fade into the horizon haze for a real-city feel.
 */
export function CityScape() {
  const texture = useMemo(() => makeWindowTexture(), []);

  return (
    <Instances limit={COUNT} range={COUNT} castShadow={false} receiveShadow={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        map={texture ?? undefined}
        emissiveMap={texture ?? undefined}
        emissive="#fff0cf"
        emissiveIntensity={0.35}
        roughness={0.8}
        metalness={0.1}
      />
      {TOWERS.map((t, i) => (
        <Instance key={i} position={t.pos} scale={t.scale} color={t.color} />
      ))}
    </Instances>
  );
}
