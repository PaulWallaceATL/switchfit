"use client";

import { useMemo } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { LAYOUT, STORE_COLLIDERS, type BuildingCollider } from "@/lib/stores";

const { width: W, depth: D, height: H, wallThickness: T, doorWidth: DW, doorHeight: DH, floorHeight: FH } = LAYOUT;

const hd = D / 2;
const hw = W / 2;
const segCx = (W + DW) / 4;
const segHx = (W - DW) / 4;

const glassMat = new THREE.MeshStandardMaterial({
  color: "#bcd4e6",
  roughness: 0.08,
  metalness: 0.6,
  transparent: true,
  opacity: 0.55,
  emissive: "#dff0ff",
  emissiveIntensity: 0.18,
});
const frameMat = new THREE.MeshStandardMaterial({ color: "#1c1917", roughness: 0.5, metalness: 0.3 });
const plinthMat = new THREE.MeshStandardMaterial({ color: "#27211c", roughness: 0.9 });
const leafMat = new THREE.MeshStandardMaterial({ color: "#3f7d3a", roughness: 0.85 });

/** A framed display window set into a front-wall segment. */
function DisplayWindow({ cx }: { cx: number }) {
  const w = segHx * 2 - 0.7;
  const h = 2.4;
  const y = 1.7;
  const z = hd + 0.01;
  return (
    <group position={[cx, y, z]}>
      <mesh material={glassMat}>
        <boxGeometry args={[w, h, 0.06]} />
      </mesh>
      {/* Frame: top, bottom, two sides + a mullion. */}
      <mesh material={frameMat} position={[0, h / 2, 0.02]}>
        <boxGeometry args={[w + 0.18, 0.16, 0.12]} />
      </mesh>
      <mesh material={frameMat} position={[0, -h / 2, 0.02]}>
        <boxGeometry args={[w + 0.18, 0.16, 0.12]} />
      </mesh>
      <mesh material={frameMat} position={[-w / 2, 0, 0.02]}>
        <boxGeometry args={[0.14, h, 0.12]} />
      </mesh>
      <mesh material={frameMat} position={[w / 2, 0, 0.02]}>
        <boxGeometry args={[0.14, h, 0.12]} />
      </mesh>
      <mesh material={frameMat} position={[0, 0, 0.02]}>
        <boxGeometry args={[0.08, h, 0.1]} />
      </mesh>
    </group>
  );
}

/** A small planter with a shrub, to flank the entrance. */
function Planter({ x, accent }: { x: number; accent: string }) {
  const shrubMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: accent, roughness: 0.7, emissive: accent, emissiveIntensity: 0.12 }),
    [accent],
  );
  return (
    <group position={[x, 0, hd + 0.7]}>
      <mesh material={plinthMat} castShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[0.7, 0.6, 0.7]} />
      </mesh>
      <mesh material={leafMat} castShadow position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.42, 16, 16]} />
      </mesh>
      <mesh material={shrubMat} position={[0.12, 0.95, 0.1]}>
        <sphereGeometry args={[0.18, 12, 12]} />
      </mesh>
    </group>
  );
}

/** Y positions of the layered floor bands, skipping the ground/door area. */
function floorBands(): number[] {
  const bands: number[] = [];
  for (let y = FH; y < H - FH * 0.5; y += FH) {
    if (y > DH + 0.4) bands.push(y);
  }
  return bands;
}

function Building({ building }: { building: BuildingCollider }) {
  const { store, center, rotationY, walls } = building;
  const bands = useMemo(floorBands, []);
  const lintelHeight = H - DH;

  return (
    <group position={[center[0], 0, center[1]]} rotation={[0, rotationY, 0]}>
      {/* Perimeter walls (these match the colliders exactly). */}
      {walls.map((w, i) => (
        <mesh key={i} position={[w.cx, H / 2, w.cz]} castShadow receiveShadow>
          <boxGeometry args={[w.hx * 2, H, w.hz * 2]} />
          <meshStandardMaterial color={store.color} roughness={0.85} />
        </mesh>
      ))}

      {/* Lintel above the doorway so the gap reads as a real entrance. */}
      <mesh position={[0, DH + lintelHeight / 2, hd - T / 2]} castShadow>
        <boxGeometry args={[DW, lintelHeight, T]} />
        <meshStandardMaterial color={store.color} roughness={0.85} />
      </mesh>

      {/* Roof cap. */}
      <mesh position={[0, H, 0]} castShadow>
        <boxGeometry args={[W + 0.2, T * 1.5, D + 0.2]} />
        <meshStandardMaterial color="#1c1917" roughness={0.7} />
      </mesh>

      {/* Cornice trim above the ground-floor shopfront. */}
      <mesh position={[0, DH + 1.7, hd + 0.05]} castShadow>
        <boxGeometry args={[W + 0.3, 0.4, 0.5]} />
        <meshStandardMaterial color={store.accent} roughness={0.5} metalness={0.2} />
      </mesh>

      {/* Stone plinth running along the base of the facade. */}
      <mesh position={[0, 0.35, hd + 0.04]} castShadow receiveShadow>
        <boxGeometry args={[W + 0.18, 0.7, 0.22]} />
        <meshStandardMaterial color="#27211c" roughness={0.9} />
      </mesh>

      {/* Display windows flanking the entrance. */}
      <DisplayWindow cx={-segCx} />
      <DisplayWindow cx={segCx} />

      {/* Striped awning over the doorway. */}
      <group position={[0, DH + 0.55, hd + 0.55]} rotation={[0.42, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[DW + 1.4, 0.08, 1.1]} />
          <meshStandardMaterial color={store.accent} roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.02, 0.5]}>
          <boxGeometry args={[DW + 1.4, 0.04, 0.18]} />
          <meshStandardMaterial color="#f5f1ea" roughness={0.7} />
        </mesh>
      </group>

      {/* Entrance threshold mat / step. */}
      <mesh position={[0, 0.03, hd + 0.55]} receiveShadow>
        <boxGeometry args={[DW + 0.6, 0.06, 1.0]} />
        <meshStandardMaterial color="#3a322b" roughness={0.95} />
      </mesh>

      {/* Planters flanking the doorway. */}
      <Planter x={-(DW / 2 + 0.9)} accent={store.accent} />
      <Planter x={DW / 2 + 0.9} accent={store.accent} />

      {/* Evenly layered floor bands wrapping the facade. */}
      {bands.map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <boxGeometry args={[W + 0.12, 0.16, D + 0.12]} />
          <meshStandardMaterial
            color={store.accent}
            emissive={store.accent}
            emissiveIntensity={0.35}
            roughness={0.4}
          />
        </mesh>
      ))}

      {/* Interior floor pad to ground the store. */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[W - T * 2, 0.04, D - T * 2]} />
        <meshStandardMaterial color="#292524" roughness={1} />
      </mesh>

      {/* Storefront sign above the doorway. */}
      <Text
        position={[0, DH + 0.95, hd + 0.06]}
        fontSize={0.78}
        maxWidth={W - 0.6}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        color={store.accent}
        outlineWidth={0.02}
        outlineColor="#1c1917"
      >
        {store.name}
      </Text>
    </group>
  );
}

/** The six tall storefronts arranged in a semicircle around the avatar's start. */
export function Storefronts() {
  return (
    <group>
      {STORE_COLLIDERS.map((building) => (
        <Building key={building.store.id} building={building} />
      ))}
    </group>
  );
}
