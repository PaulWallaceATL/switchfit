"use client";

import { useMemo } from "react";
import { Text } from "@react-three/drei";
import { LAYOUT, STORE_COLLIDERS, type BuildingCollider } from "@/lib/stores";

const { width: W, depth: D, height: H, wallThickness: T, doorWidth: DW, doorHeight: DH, floorHeight: FH } = LAYOUT;

const hd = D / 2;

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
