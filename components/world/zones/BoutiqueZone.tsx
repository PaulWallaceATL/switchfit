"use client";

import { ShopInteriorZone, type ZoneInteriorProps } from "@/components/world/zones/ShopInteriorZone";
import { Hotspot } from "@/components/world/Hotspot";
import { productsForStore } from "@/lib/catalog";
import { useGameStore } from "@/lib/game/store";

/** A simple wall-mounted clothing rack with hanging garments. */
function Rack({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.4, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 2.2, 12]} />
        <meshStandardMaterial color="#a8a29e" metalness={0.6} roughness={0.3} />
      </mesh>
      {[-0.7, -0.35, 0, 0.35, 0.7].map((x, i) => (
        <mesh key={x} position={[x, 0.95, 0]} castShadow>
          <boxGeometry args={[0.22, 0.7, 0.12]} />
          <meshStandardMaterial color={i % 2 ? color : "#e7e5e4"} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

/** Warm, upscale boutique: soft lighting, racks, and a try-on mirror hotspot. */
export function BoutiqueZone({ zone }: ZoneInteriorProps) {
  const products = productsForStore(zone.id);

  return (
    <ShopInteriorZone zone={zone} floorColor="#2a2422" fillColor="#fff1df" fillIntensity={20}>
      <Rack position={[-5.2, 0, -4]} color={zone.accent} />
      <Rack position={[5.2, 0, -4]} color={zone.color} />

      {/* Full-length try-on mirror hotspot. */}
      <group position={[0, 0, -6.6]}>
        <mesh position={[0, 1.6, 0]} castShadow>
          <boxGeometry args={[1.1, 2.6, 0.12]} />
          <meshStandardMaterial color="#dfe7ef" roughness={0.05} metalness={0.9} />
        </mesh>
      </group>
      <Hotspot
        position={[0, 0, -5.3]}
        label="Try On at Mirror"
        color={zone.accent}
        onActivate={() => {
          const ap = useGameStore.getState().activeProductId ?? products[0]?.id;
          if (ap) useGameStore.getState().tryOn(ap, 0);
        }}
      />
    </ShopInteriorZone>
  );
}

export default BoutiqueZone;
