"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 150;
const SPREAD = 70;
const CEIL = 9;

// Built once at module load (outside render) so the random layout is stable and
// doesn't trip the "no impurity during render" rule.
const BASE = (() => {
  const positions = new Float32Array(COUNT * 3);
  const speeds = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * SPREAD;
    positions[i * 3 + 1] = Math.random() * CEIL;
    positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD;
    speeds[i] = 0.12 + Math.random() * 0.22;
  }
  return { positions, speeds };
})();

/** Slow-drifting dust motes that catch the skylight, adding depth to the air. */
export function AmbientParticles() {
  const points = useRef<THREE.Points>(null);
  // Clone (pure) so this instance owns a mutable copy for the drift animation.
  const positions = useMemo(() => BASE.positions.slice(), []);
  const speeds = BASE.speeds;

  useFrame((_, delta) => {
    const p = points.current;
    if (!p) return;
    const attr = p.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      let y = arr[i * 3 + 1] + speeds[i] * delta;
      if (y > CEIL) y = 0;
      arr[i * 3 + 1] = y;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#fff4e0"
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
