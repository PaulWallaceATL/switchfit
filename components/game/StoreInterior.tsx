"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import {
  LAYOUT,
  PODIUM_SLOTS_LOCAL,
  getBuildingTransforms,
  type Store,
} from "@/lib/stores";
import { productsForStore, type Product } from "@/lib/catalog";

const { width: W, depth: D, wallThickness: T } = LAYOUT;
const CEILING_Y = 4.8;
const iw = W - T * 2;
const id = D - T * 2;

function PodiumDisplay({
  product,
  slot,
  accent,
  active,
}: {
  product: Product;
  slot: { x: number; z: number };
  accent: string;
  active: boolean;
}) {
  const garmentRef = useRef<THREE.Group>(null);
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
      {/* Pedestal */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.62, 0.7, 0.8, 32]} />
        <meshStandardMaterial color="#0c0a09" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* Glowing accent ring on top of the pedestal. */}
      <mesh position={[0, 0.82, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.66, 48]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={active ? 2.2 : 1}
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
              <mesh key={s} castShadow position={[s * 0.4, 0.12, 0]} rotation={[0, 0, (s * Math.PI) / 5]}>
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

function Interior({
  store,
  center,
  rotationY,
  activeProductId,
}: {
  store: Store;
  center: [number, number];
  rotationY: number;
  activeProductId: string | null;
}) {
  const products = productsForStore(store.id);

  return (
    <group position={[center[0], 0, center[1]]} rotation={[0, rotationY, 0]}>
      {/* Interior floor pad. */}
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <boxGeometry args={[iw, 0.06, id]} />
        <meshStandardMaterial color="#1c1917" roughness={0.6} metalness={0.2} />
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
            color={store.accent}
            emissive={store.accent}
            emissiveIntensity={1.4}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Warm fill light for the showroom (no shadows, for perf). */}
      <pointLight position={[0, CEILING_Y - 0.4, 0]} intensity={18} distance={22} color="#fff5e8" />
      <pointLight position={[0, 2.2, -D / 4]} intensity={8} distance={14} color={store.accent} />

      {products.map((product, i) => {
        const slot = PODIUM_SLOTS_LOCAL[i];
        if (!slot) return null;
        return (
          <PodiumDisplay
            key={product.id}
            product={product}
            slot={slot}
            accent={store.accent}
            active={activeProductId === product.id}
          />
        );
      })}
    </group>
  );
}

/** Furnishes each store's interior with lit product podiums. */
export function StoreInterior({ activeProductId }: { activeProductId: string | null }) {
  const transforms = getBuildingTransforms();
  return (
    <group>
      {transforms.map((t) => (
        <Interior
          key={t.store.id}
          store={t.store}
          center={t.center}
          rotationY={t.rotationY}
          activeProductId={activeProductId}
        />
      ))}
    </group>
  );
}
