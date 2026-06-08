"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { LAYOUT, PODIUM_SLOTS_LOCAL } from "@/lib/stores";
import { productsForStore, type Product } from "@/lib/catalog";
import { useGameStore } from "@/lib/game/store";
import type { Zone } from "@/lib/game/types";
import {
  ClothingRack,
  ShelfUnit,
  Counter,
  Rug,
  PottedPlant,
} from "@/components/world/StoreFixtures";

const { width: W, depth: D, wallThickness: T } = LAYOUT;
const CEILING_Y = 4.8;
const iw = W - T * 2;
const id = D - T * 2;
const hx = iw / 2;
const hz = id / 2;

export interface ZoneInteriorProps {
  zone: Zone;
}

/**
 * A single product podium. Floats + rotates its garment, glows when it's the
 * active product, and acts as a click "hotspot" that surfaces the product card.
 */
function PodiumDisplay({
  product,
  slot,
  accent,
}: {
  product: Product;
  slot: { x: number; z: number };
  accent: string;
}) {
  const garmentRef = useRef<THREE.Group>(null);
  const active = useGameStore((s) => s.activeProductId === product.id);
  const isPants = product.garment.type === "pants";
  const color = product.colors[0];

  useFrame((state) => {
    const g = garmentRef.current;
    if (!g) return;
    g.rotation.y += 0.012;
    g.position.y = 1.7 + Math.sin(state.clock.elapsedTime * 1.4) * 0.06;
  });

  return (
    <group position={[slot.x, 0, slot.z]}>
      {/* Pedestal — clickable hotspot. */}
      <mesh
        position={[0, 0.4, 0]}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          useGameStore.getState().setActiveProduct(product.id);
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
      >
        <cylinderGeometry args={[0.62, 0.7, 0.8, 32]} />
        <meshStandardMaterial color="#0c0a09" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* Glowing accent ring on top of the pedestal. */}
      <mesh position={[0, 0.82, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.66, 48]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={active ? 2.4 : 1}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* Floating, rotating garment representation. */}
      <group ref={garmentRef} position={[0, 1.7, 0]}>
        {isPants ? (
          <>
            <mesh castShadow position={[0, 0.18, 0]}>
              <boxGeometry args={[0.5, 0.28, 0.28]} />
              <meshStandardMaterial color={color} roughness={0.75} />
            </mesh>
            {[-1, 1].map((s) => (
              <mesh key={s} castShadow position={[s * 0.13, -0.28, 0]}>
                <boxGeometry args={[0.2, 0.62, 0.22]} />
                <meshStandardMaterial color={color} roughness={0.75} />
              </mesh>
            ))}
          </>
        ) : (
          <>
            <mesh castShadow>
              <capsuleGeometry args={[0.34, 0.5, 8, 20]} />
              <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>
            {[-1, 1].map((s) => (
              <mesh
                key={s}
                castShadow
                position={[s * 0.4, 0.12, 0]}
                rotation={[0, 0, (s * Math.PI) / 5]}
              >
                <capsuleGeometry args={[0.13, 0.34, 8, 16]} />
                <meshStandardMaterial color={color} roughness={0.8} />
              </mesh>
            ))}
          </>
        )}
      </group>

      {/* Floating name + price. */}
      <Text
        position={[0, 2.85, 0]}
        fontSize={0.26}
        maxWidth={2.4}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        color="#fafaf9"
        outlineWidth={0.012}
        outlineColor="#0c0a09"
      >
        {product.name}
      </Text>
      <Text
        position={[0, 2.55, 0]}
        fontSize={0.22}
        anchorX="center"
        anchorY="middle"
        color={accent}
        outlineWidth={0.01}
        outlineColor="#0c0a09"
      >
        {`$${product.price}`}
      </Text>
    </group>
  );
}

/**
 * Generic, themeable shop interior anchored at the zone's building footprint.
 * Specialized zones (Boutique, Streetwear, Fitting Room) compose this and layer
 * their own props/lighting on top.
 */
export function ShopInteriorZone({
  zone,
  floorColor = "#1c1917",
  fillColor = "#fff5e8",
  fillIntensity = 18,
  children,
}: ZoneInteriorProps & {
  floorColor?: string;
  fillColor?: string;
  fillIntensity?: number;
  children?: React.ReactNode;
}) {
  const products = productsForStore(zone.id);

  return (
    <group position={[zone.center[0], 0, zone.center[1]]} rotation={[0, zone.rotationY, 0]}>
      {/* Interior floor pad. */}
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <boxGeometry args={[iw, 0.06, id]} />
        <meshStandardMaterial color={floorColor} roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Lowered showroom ceiling. */}
      <mesh position={[0, CEILING_Y, 0]}>
        <boxGeometry args={[iw, 0.2, id]} />
        <meshStandardMaterial color="#0c0a09" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Accent ceiling light strips. */}
      {[-id / 4, id / 4].map((z) => (
        <mesh key={z} position={[0, CEILING_Y - 0.12, z]}>
          <boxGeometry args={[iw * 0.7, 0.06, 0.3]} />
          <meshStandardMaterial
            color={zone.accent}
            emissive={zone.accent}
            emissiveIntensity={1.4}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Warm fill light for the showroom (no shadows, for perf). */}
      <pointLight position={[0, CEILING_Y - 0.4, 0]} intensity={fillIntensity} distance={22} color={fillColor} />
      <pointLight position={[0, 2.2, -D / 4]} intensity={8} distance={14} color={zone.accent} />

      {products.map((product, i) => {
        const slot = PODIUM_SLOTS_LOCAL[i];
        if (!slot) return null;
        return <PodiumDisplay key={product.id} product={product} slot={slot} accent={zone.accent} />;
      })}

      {/* --- Furnishings: racks, shelving, counter, rug & greenery --- */}

      {/* A warm rug to ground the central display cluster. */}
      <Rug position={[0, 0.04, -3]} size={[7.5, 8]} accent={zone.accent} />

      {/* Long clothing racks running along each side wall. */}
      <ClothingRack position={[-hx + 0.7, 0.04, -1.5]} rotation={Math.PI / 2} length={6.5} count={11} seed={1} />
      <ClothingRack position={[hx - 0.7, 0.04, -1.5]} rotation={Math.PI / 2} length={6.5} count={11} seed={6} />
      {/* Shorter racks closer to the entrance. */}
      <ClothingRack position={[-hx + 0.7, 0.04, 4.4]} rotation={Math.PI / 2} length={2.8} count={5} seed={3} />
      <ClothingRack position={[hx - 0.7, 0.04, 4.4]} rotation={Math.PI / 2} length={2.8} count={5} seed={8} />

      {/* Stocked shelving along the back wall, flanking the centre podium. */}
      <ShelfUnit position={[-3.4, 0.04, -hz + 0.5]} seed={2} />
      <ShelfUnit position={[3.4, 0.04, -hz + 0.5]} seed={7} />

      {/* Cashier counter in the front corner. */}
      <Counter position={[hx - 1.3, 0.04, hz - 1.6]} rotation={Math.PI} accent={zone.accent} />

      {/* Greenery in the corners for warmth. */}
      <PottedPlant position={[-hx + 0.9, 0.04, hz - 1.2]} scale={0.95} />
      <PottedPlant position={[-hx + 0.9, 0.04, -hz + 1.1]} scale={0.85} />
      <PottedPlant position={[hx - 0.9, 0.04, -hz + 1.1]} scale={0.9} />

      {/* Brand sign on the back wall. */}
      <Text
        position={[0, 3.5, -hz + 0.2]}
        fontSize={0.6}
        maxWidth={iw - 1}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        color={zone.accent}
        outlineWidth={0.015}
        outlineColor="#0c0a09"
      >
        {zone.label.toUpperCase()}
      </Text>

      {children}
    </group>
  );
}

export default ShopInteriorZone;
