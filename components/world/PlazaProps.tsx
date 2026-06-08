"use client";

import { useMemo } from "react";
import * as THREE from "three";

const stoneMat = new THREE.MeshStandardMaterial({ color: "#8d8378", roughness: 0.9 });
const darkMetal = new THREE.MeshStandardMaterial({ color: "#2a2a2e", roughness: 0.5, metalness: 0.6 });
const woodMat = new THREE.MeshStandardMaterial({ color: "#6b4a2b", roughness: 0.8 });
const trunkMat = new THREE.MeshStandardMaterial({ color: "#5a3d28", roughness: 0.95 });
const leafMat = new THREE.MeshStandardMaterial({ color: "#3f7d3a", roughness: 0.85 });
const leafMat2 = new THREE.MeshStandardMaterial({ color: "#4f9046", roughness: 0.85 });
const waterMat = new THREE.MeshStandardMaterial({
  color: "#5fb6d9",
  roughness: 0.15,
  metalness: 0.2,
  transparent: true,
  opacity: 0.78,
  emissive: "#1f6f8f",
  emissiveIntensity: 0.25,
});
const lampGlow = new THREE.MeshStandardMaterial({
  color: "#fff2cc",
  emissive: "#ffd98a",
  emissiveIntensity: 1.6,
  roughness: 0.3,
});

/** A two-tier stone fountain with a glassy water surface. */
function Fountain({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Outer basin wall */}
      <mesh material={stoneMat} castShadow receiveShadow position={[0, 0.3, 0]}>
        <cylinderGeometry args={[2.4, 2.6, 0.6, 40]} />
      </mesh>
      {/* Lower water */}
      <mesh material={waterMat} position={[0, 0.5, 0]}>
        <cylinderGeometry args={[2.25, 2.25, 0.12, 40]} />
      </mesh>
      {/* Center column */}
      <mesh material={stoneMat} castShadow position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.45, 0.6, 1.1, 24]} />
      </mesh>
      {/* Upper bowl */}
      <mesh material={stoneMat} castShadow position={[0, 1.45, 0]}>
        <cylinderGeometry args={[1.05, 0.5, 0.32, 32]} />
      </mesh>
      {/* Upper water */}
      <mesh material={waterMat} position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.95, 0.95, 0.08, 32]} />
      </mesh>
      {/* Finial */}
      <mesh material={stoneMat} castShadow position={[0, 1.85, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
      </mesh>
    </group>
  );
}

/** Street lamp: a tapered post with a glowing head and a real point light. */
function LampPost({ position, light }: { position: [number, number, number]; light?: boolean }) {
  return (
    <group position={position}>
      <mesh material={darkMetal} castShadow position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.07, 0.12, 3.6, 16]} />
      </mesh>
      <mesh material={darkMetal} castShadow position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.28, 0.32, 0.16, 16]} />
      </mesh>
      <mesh material={darkMetal} position={[0, 3.7, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
      </mesh>
      <mesh material={lampGlow} position={[0, 3.55, 0]}>
        <sphereGeometry args={[0.22, 18, 18]} />
      </mesh>
      {light && (
        <pointLight position={[0, 3.5, 0]} intensity={6} distance={11} decay={2} color="#ffe2a8" />
      )}
    </group>
  );
}

/** Park bench made of wood slats on metal legs. */
function Bench({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh material={woodMat} castShadow receiveShadow position={[0, 0.45, 0]}>
        <boxGeometry args={[1.7, 0.1, 0.5]} />
      </mesh>
      <mesh material={woodMat} castShadow position={[0, 0.75, -0.22]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[1.7, 0.5, 0.08]} />
      </mesh>
      {[-0.7, 0.7].map((x) => (
        <mesh key={x} material={darkMetal} castShadow position={[x, 0.22, 0]}>
          <boxGeometry args={[0.08, 0.45, 0.46]} />
        </mesh>
      ))}
    </group>
  );
}

/** Leafy tree in a square planter. */
function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {/* Planter */}
      <mesh material={stoneMat} castShadow receiveShadow position={[0, 0.25, 0]}>
        <boxGeometry args={[1.2, 0.5, 1.2]} />
      </mesh>
      <mesh material={trunkMat} castShadow position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.13, 0.2, 1.9, 12]} />
      </mesh>
      <mesh material={leafMat} castShadow position={[0, 2.4, 0]}>
        <sphereGeometry args={[0.95, 20, 20]} />
      </mesh>
      <mesh material={leafMat2} castShadow position={[0.5, 2.85, 0.2]}>
        <sphereGeometry args={[0.6, 18, 18]} />
      </mesh>
      <mesh material={leafMat} castShadow position={[-0.45, 2.7, -0.25]}>
        <sphereGeometry args={[0.66, 18, 18]} />
      </mesh>
    </group>
  );
}

/**
 * Decorative plaza furnishings around the avatar's start: a central fountain,
 * a ring of lamp posts, benches and trees. Placed inside the storefront arc so
 * they never block doorways.
 */
export function PlazaProps() {
  const lamps = useMemo(() => {
    const r = 17;
    return Array.from({ length: 7 }, (_, i) => {
      const a = (i / 7) * Math.PI * 2;
      return [Math.sin(a) * r, 0, -Math.cos(a) * r] as [number, number, number];
    });
  }, []);

  const trees = useMemo(() => {
    const r = 19.5;
    return Array.from({ length: 6 }, (_, i) => {
      const a = ((i + 0.5) / 6) * Math.PI * 2;
      return [Math.sin(a) * r, 0, -Math.cos(a) * r] as [number, number, number];
    });
  }, []);

  return (
    <group>
      <Fountain position={[0, 0, 11]} />

      {lamps.map((p, i) => (
        <LampPost key={`lamp-${i}`} position={p} light={i % 2 === 0} />
      ))}

      {trees.map((p, i) => (
        <Tree key={`tree-${i}`} position={p} scale={0.9 + (i % 3) * 0.12} />
      ))}

      <Bench position={[6.5, 0, 9]} rotation={-0.8} />
      <Bench position={[-6.5, 0, 9]} rotation={0.8} />
      <Bench position={[0, 0, 18]} rotation={Math.PI} />
    </group>
  );
}
