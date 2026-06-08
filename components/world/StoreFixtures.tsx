"use client";

import { useMemo } from "react";
import * as THREE from "three";

/** Shared, reusable materials so the fixtures stay cheap to render. */
const metalMat = new THREE.MeshStandardMaterial({ color: "#3a3a40", roughness: 0.4, metalness: 0.8 });
const woodMat = new THREE.MeshStandardMaterial({ color: "#6b4a2e", roughness: 0.75 });
const woodDarkMat = new THREE.MeshStandardMaterial({ color: "#4a3320", roughness: 0.8 });
const potMat = new THREE.MeshStandardMaterial({ color: "#2b2521", roughness: 0.9 });
const leafMat = new THREE.MeshStandardMaterial({ color: "#3f7d3a", roughness: 0.85 });
const leafMat2 = new THREE.MeshStandardMaterial({ color: "#4f9046", roughness: 0.85 });

/** A muted-but-varied apparel palette, shared across every hung/folded garment. */
const CLOTH_COLORS = [
  "#b23b3b",
  "#d98b4a",
  "#e3c34a",
  "#3f7d5a",
  "#3a6ea5",
  "#5a4a8a",
  "#c25b8a",
  "#d6d2c8",
  "#2f2f33",
  "#8a6a4a",
];
const clothMats = CLOTH_COLORS.map(
  (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.82, metalness: 0.02 }),
);
const clothMat = (i: number) => clothMats[((i % clothMats.length) + clothMats.length) % clothMats.length];

/** A single garment on a hanger: shoulders bar + a draped body panel. */
function HungGarment({ x, colorIndex, drop = 0.72 }: { x: number; colorIndex: number; drop?: number }) {
  const mat = clothMat(colorIndex);
  return (
    <group position={[x, 0, 0]}>
      {/* Hook */}
      <mesh material={metalMat} position={[0, 1.72, 0]}>
        <torusGeometry args={[0.03, 0.008, 8, 16]} />
      </mesh>
      {/* Shoulders */}
      <mesh material={mat} position={[0, 1.55, 0]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.34, 0.06, 0.16]} />
      </mesh>
      {/* Draped body */}
      <mesh material={mat} position={[0, 1.55 - drop / 2, 0]} castShadow>
        <boxGeometry args={[0.32, drop, 0.1]} />
      </mesh>
    </group>
  );
}

/**
 * A free-standing clothing rack: two posts, a rail, and a row of hung garments.
 * The rail runs along local X; rotate the group to line it against a wall.
 */
export function ClothingRack({
  position,
  rotation = 0,
  length = 3,
  count = 7,
  seed = 0,
}: {
  position: [number, number, number];
  rotation?: number;
  length?: number;
  count?: number;
  seed?: number;
}) {
  const half = length / 2;
  const garments = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const x = -half + ((i + 0.5) / count) * length;
        return { x, colorIndex: seed + i * 3 };
      }),
    [count, half, length, seed],
  );

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Posts + feet */}
      {[-half, half].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh material={metalMat} position={[0, 0.9, 0]} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 1.8, 12]} />
          </mesh>
          <mesh material={metalMat} position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.22, 0.26, 0.08, 16]} />
          </mesh>
        </group>
      ))}
      {/* Rail */}
      <mesh material={metalMat} position={[0, 1.78, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, length + 0.1, 12]} />
      </mesh>
      {garments.map((g, i) => (
        <HungGarment key={i} x={g.x} colorIndex={g.colorIndex} drop={0.62 + ((i * 7) % 5) * 0.04} />
      ))}
    </group>
  );
}

/** A stack of folded clothes. */
function FoldedStack({ position, colorIndex, count = 3 }: { position: [number, number, number]; colorIndex: number; count?: number }) {
  return (
    <group position={position}>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} material={clothMat(colorIndex + i)} position={[0, 0.07 + i * 0.13, 0]} castShadow>
          <boxGeometry args={[0.46, 0.12, 0.36]} />
        </mesh>
      ))}
    </group>
  );
}

/** Wall shelving stocked with folded apparel, set flush against a wall. */
export function ShelfUnit({
  position,
  rotation = 0,
  seed = 0,
}: {
  position: [number, number, number];
  rotation?: number;
  seed?: number;
}) {
  const shelfYs = [0.5, 1.3, 2.1];
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Back panel */}
      <mesh material={woodDarkMat} position={[0, 1.4, -0.16]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 2.8, 0.08]} />
      </mesh>
      {/* Side returns */}
      {[-1.28, 1.28].map((x) => (
        <mesh key={x} material={woodDarkMat} position={[x, 1.4, 0.05]}>
          <boxGeometry args={[0.08, 2.8, 0.5]} />
        </mesh>
      ))}
      {shelfYs.map((y, s) => (
        <group key={y}>
          <mesh material={woodMat} position={[0, y, 0.05]} castShadow receiveShadow>
            <boxGeometry args={[2.5, 0.07, 0.5]} />
          </mesh>
          {[-0.8, 0, 0.8].map((x, j) => (
            <FoldedStack key={x} position={[x, y, 0.05]} colorIndex={seed + s * 4 + j * 2} />
          ))}
        </group>
      ))}
    </group>
  );
}

/** A cashier counter with a register and an accent kick panel. */
export function Counter({
  position,
  rotation = 0,
  accent = "#a5b4fc",
}: {
  position: [number, number, number];
  rotation?: number;
  accent?: string;
}) {
  const accentMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: accent, roughness: 0.5, emissive: accent, emissiveIntensity: 0.25 }),
    [accent],
  );
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh material={woodDarkMat} position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 1, 0.7]} />
      </mesh>
      {/* Countertop overhang */}
      <mesh material={woodMat} position={[0, 1.03, 0.04]} castShadow>
        <boxGeometry args={[2.2, 0.08, 0.86]} />
      </mesh>
      {/* Accent kick strip */}
      <mesh material={accentMat} position={[0, 0.12, 0.36]}>
        <boxGeometry args={[2.0, 0.16, 0.02]} />
      </mesh>
      {/* Register */}
      <mesh material={metalMat} position={[0.5, 1.18, 0]} castShadow>
        <boxGeometry args={[0.4, 0.22, 0.34]} />
      </mesh>
      <mesh material={accentMat} position={[0.5, 1.31, 0.1]}>
        <boxGeometry args={[0.3, 0.14, 0.02]} />
      </mesh>
    </group>
  );
}

/** A soft area rug to warm up the showroom floor. */
export function Rug({
  position,
  size = [6, 6],
  color = "#2a2622",
  accent = "#a5b4fc",
}: {
  position: [number, number, number];
  size?: [number, number];
  color?: string;
  accent?: string;
}) {
  const [w, d] = size;
  const baseMat = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 0.95 }), [color]);
  const borderMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: accent, roughness: 0.9, emissive: accent, emissiveIntensity: 0.08 }),
    [accent],
  );
  return (
    <group position={position}>
      <mesh material={borderMat} position={[0, 0.062, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
      </mesh>
      <mesh material={baseMat} position={[0, 0.064, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w - 0.5, d - 0.5]} />
      </mesh>
    </group>
  );
}

/** A potted ornamental plant for corners. */
export function PottedPlant({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh material={potMat} position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.24, 0.56, 16]} />
      </mesh>
      <mesh material={leafMat} position={[0, 0.95, 0]} castShadow>
        <sphereGeometry args={[0.5, 16, 16]} />
      </mesh>
      <mesh material={leafMat2} position={[0.22, 1.2, 0.1]} castShadow>
        <sphereGeometry args={[0.32, 14, 14]} />
      </mesh>
      <mesh material={leafMat} position={[-0.2, 1.1, -0.12]} castShadow>
        <sphereGeometry args={[0.34, 14, 14]} />
      </mesh>
    </group>
  );
}
