"use client";

import { ShopInteriorZone, type ZoneInteriorProps } from "@/components/world/zones/ShopInteriorZone";
import { Hotspot } from "@/components/world/Hotspot";
import { productsForStore } from "@/lib/catalog";
import { useGameStore } from "@/lib/game/store";

/** A graphic crate-stack display, evoking a streetwear drop. */
function CrateStack({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      {[
        [0, 0.3, 0],
        [0.55, 0.3, 0],
        [0.27, 0.9, 0],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} castShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color={i === 2 ? color : "#1c1917"} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/** Urban streetwear: dark floor, neon accents, crate displays, browse hotspot. */
export function StreetwearZone({ zone }: ZoneInteriorProps) {
  return (
    <ShopInteriorZone zone={zone} floorColor="#101010" fillColor="#dfe7ff" fillIntensity={14}>
      {/* Neon under-glow strip along the back wall. */}
      <mesh position={[0, 0.1, -6.7]}>
        <boxGeometry args={[10, 0.08, 0.08]} />
        <meshStandardMaterial color={zone.accent} emissive={zone.accent} emissiveIntensity={2} toneMapped={false} />
      </mesh>

      <CrateStack position={[-5, 0, -3.5]} color={zone.accent} />
      <CrateStack position={[5, 0, -3.5]} color={zone.color} />

      <Hotspot
        position={[0, 0, -5.3]}
        label="Browse the Drop"
        color={zone.accent}
        onActivate={() => {
          const id = productsForStore(zone.id)[0]?.id;
          if (id) useGameStore.getState().setActiveProduct(id);
        }}
      />
    </ShopInteriorZone>
  );
}

export default StreetwearZone;
