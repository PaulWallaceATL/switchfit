"use client";

import { ShopInteriorZone, type ZoneInteriorProps } from "@/components/world/zones/ShopInteriorZone";
import { Hotspot } from "@/components/world/Hotspot";
import { useGameStore } from "@/lib/game/store";

/**
 * The Fitting Room: where avatar customization happens. A trio of mirrors and a
 * raised pedestal frame the player; a hotspot opens the Character panel (the
 * old measurements/wardrobe sidebar, now in-world).
 */
export function FittingRoomZone({ zone }: ZoneInteriorProps) {
  return (
    <ShopInteriorZone zone={zone} floorColor="#26201c" fillColor="#fff4e6" fillIntensity={22}>
      {/* Three-panel mirror at the back. */}
      {[-1.2, 0, 1.2].map((x, i) => (
        <mesh key={x} position={[x, 1.6, -6.5]} rotation={[0, i === 0 ? 0.25 : i === 2 ? -0.25 : 0, 0]} castShadow>
          <boxGeometry args={[1, 2.6, 0.1]} />
          <meshStandardMaterial color="#e8eef4" roughness={0.04} metalness={0.95} />
        </mesh>
      ))}

      {/* Raised pedestal the player stands on to customize. */}
      <mesh position={[0, 0.12, -3.5]} receiveShadow castShadow>
        <cylinderGeometry args={[1.6, 1.7, 0.24, 40]} />
        <meshStandardMaterial color="#3a3330" roughness={0.5} metalness={0.2} />
      </mesh>

      <Hotspot
        position={[0, 0.24, -3.5]}
        label="Customize Your Look"
        color={zone.accent}
        radius={1}
        onActivate={() => useGameStore.getState().setPanel("character")}
      />
    </ShopInteriorZone>
  );
}

export default FittingRoomZone;
