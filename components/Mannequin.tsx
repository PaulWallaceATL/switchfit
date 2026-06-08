"use client";

import { useMemo } from "react";
import {
  BODY_LAYOUT,
  getBodyScale,
  type Measurements,
  type WardrobeItem,
} from "@/lib/measurements";
import { Clothing } from "@/components/Clothing";

const SKIN_COLOR = "#d6c3b0";

interface MannequinProps {
  measurements: Measurements;
  selectedItems: WardrobeItem[];
}

export function Mannequin({ measurements, selectedItems }: MannequinProps) {
  const scale = useMemo(() => getBodyScale(measurements), [measurements]);

  // The pelvis blends waist and hips so both measurements shape the lower torso.
  const lowerTorsoScale = scale.waist * 0.6 + scale.hips * 0.4;

  return (
    <group scale={[1, scale.height, 1]} position={[0, 0, 0]}>
      {/* Head */}
      <mesh position={[0, BODY_LAYOUT.head.y, 0]} castShadow>
        <sphereGeometry args={[BODY_LAYOUT.head.radius, 32, 32]} />
        <meshStandardMaterial color={SKIN_COLOR} roughness={0.7} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, BODY_LAYOUT.neck.y, 0]} castShadow>
        <cylinderGeometry
          args={[BODY_LAYOUT.neck.radius, BODY_LAYOUT.neck.radius, BODY_LAYOUT.neck.length, 24]}
        />
        <meshStandardMaterial color={SKIN_COLOR} roughness={0.7} />
      </mesh>

      {/* Upper torso (chest) */}
      <mesh position={[0, BODY_LAYOUT.upperTorso.y, 0]} scale={[scale.chest, 1, scale.chest]} castShadow>
        <capsuleGeometry args={[BODY_LAYOUT.upperTorso.radius, BODY_LAYOUT.upperTorso.length, 8, 24]} />
        <meshStandardMaterial color={SKIN_COLOR} roughness={0.7} />
      </mesh>

      {/* Lower torso (waist / hips) */}
      <mesh position={[0, BODY_LAYOUT.lowerTorso.y, 0]} scale={[lowerTorsoScale, 1, lowerTorsoScale]} castShadow>
        <capsuleGeometry args={[BODY_LAYOUT.lowerTorso.radius, BODY_LAYOUT.lowerTorso.length, 8, 24]} />
        <meshStandardMaterial color={SKIN_COLOR} roughness={0.7} />
      </mesh>

      {/* Arms */}
      {[-1, 1].map((side) => (
        <mesh
          key={`arm-${side}`}
          position={[side * BODY_LAYOUT.arm.offsetX, BODY_LAYOUT.arm.y, 0]}
          scale={[scale.limb, 1, scale.limb]}
          castShadow
        >
          <capsuleGeometry args={[BODY_LAYOUT.arm.radius, BODY_LAYOUT.arm.length, 8, 16]} />
          <meshStandardMaterial color={SKIN_COLOR} roughness={0.7} />
        </mesh>
      ))}

      {/* Legs (driven by hips) */}
      {[-1, 1].map((side) => (
        <mesh
          key={`leg-${side}`}
          position={[side * BODY_LAYOUT.leg.offsetX, BODY_LAYOUT.leg.y, 0]}
          scale={[scale.hips, 1, scale.hips]}
          castShadow
        >
          <capsuleGeometry args={[BODY_LAYOUT.leg.radius, BODY_LAYOUT.leg.length, 8, 16]} />
          <meshStandardMaterial color={SKIN_COLOR} roughness={0.7} />
        </mesh>
      ))}

      {/* Clothing overlays */}
      {selectedItems.map((item) => (
        <Clothing key={item.id} item={item} scale={scale} />
      ))}
    </group>
  );
}
