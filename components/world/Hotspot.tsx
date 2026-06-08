"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";

interface HotspotProps {
  position: [number, number, number];
  label: string;
  color?: string;
  /** Radius of the floor marker. */
  radius?: number;
  onActivate: () => void;
}

/**
 * A clickable in-world interaction marker: a pulsing floor ring with a
 * billboarded label. Used for shop "actions" like trying on at a mirror or
 * browsing a clothing rack.
 */
export function Hotspot({ position, label, color = "#fafaf9", radius = 0.7, onActivate }: HotspotProps) {
  const ring = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const m = ring.current;
    if (!m) return;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.08;
    m.scale.setScalar((hovered ? 1.15 : 1) * pulse);
  });

  return (
    <group position={position}>
      <mesh
        ref={ring}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.06, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onActivate();
        }}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <ringGeometry args={[radius * 0.62, radius, 40]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 2.2 : 1.2}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <Billboard position={[0, 1.2, 0]}>
        <Text fontSize={0.22} anchorX="center" anchorY="middle" color={color} outlineWidth={0.012} outlineColor="#0c0a09">
          {label}
        </Text>
      </Billboard>
    </group>
  );
}
