"use client";

import { BODY_LAYOUT, type BodyScale, type WardrobeItem } from "@/lib/measurements";

interface ClothingProps {
  item: WardrobeItem;
  scale: BodyScale;
}

/**
 * Overlays simple garment meshes on top of the mannequin. Each garment is built
 * from primitives that are slightly larger than the body region they cover; the
 * extra size comes from the body scale factors (so clothes track measurements)
 * and the item's looseness (so baggy items read as baggy).
 */
export function Clothing({ item, scale }: ClothingProps) {
  const material = (
    <meshStandardMaterial color={item.color} roughness={0.85} transparent opacity={0.96} />
  );

  if (item.type === "shirt") {
    const torsoRadius = BODY_LAYOUT.upperTorso.radius * scale.chest * item.looseness;
    const sleeveRadius = BODY_LAYOUT.arm.radius * scale.limb * item.looseness;

    return (
      <group>
        {/* Torso panel covering chest down to the waist */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <capsuleGeometry args={[torsoRadius, 0.46, 8, 24]} />
          {material}
        </mesh>

        {/* Short sleeves over the upper arms */}
        {[-1, 1].map((side) => (
          <mesh key={`sleeve-${side}`} position={[side * BODY_LAYOUT.arm.offsetX, 1.42, 0]} castShadow>
            <capsuleGeometry args={[sleeveRadius, 0.24, 8, 16]} />
            {material}
          </mesh>
        ))}
      </group>
    );
  }

  // Pants
  const hipRadius = BODY_LAYOUT.lowerTorso.radius * scale.hips * item.looseness;
  const legRadius = BODY_LAYOUT.leg.radius * scale.hips * item.looseness;

  return (
    <group>
      {/* Hip band */}
      <mesh position={[0, BODY_LAYOUT.lowerTorso.y - 0.02, 0]} castShadow>
        <capsuleGeometry args={[hipRadius, 0.16, 8, 24]} />
        {material}
      </mesh>

      {/* Trouser legs */}
      {[-1, 1].map((side) => (
        <mesh
          key={`trouser-${side}`}
          position={[side * BODY_LAYOUT.leg.offsetX, BODY_LAYOUT.leg.y - 0.02, 0]}
          castShadow
        >
          <capsuleGeometry args={[legRadius, BODY_LAYOUT.leg.length, 8, 16]} />
          {material}
        </mesh>
      ))}
    </group>
  );
}
