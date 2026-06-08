"use client";

import { useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getBodyScale, type Measurements, type WardrobeItem } from "@/lib/measurements";
import { buildTorsoProfile, getBodyDims, HAIR_COLOR, type Gender } from "@/lib/body";
import { Clothing } from "@/components/Clothing";
import type { PlayerMotion } from "@/components/game/Player";

interface MannequinProps {
  measurements: Measurements;
  selectedItems: WardrobeItem[];
  gender: Gender;
  skinTone: string;
  /** Locomotion data driving the walk/run animation (optional for static use). */
  motionRef?: MutableRefObject<PlayerMotion>;
}

/** Arm geometry built around the shoulder joint at the local origin. */
function ArmContent({ radius, mat }: { radius: number; mat: THREE.Material }) {
  return (
    <>
      <mesh material={mat} castShadow>
        <sphereGeometry args={[radius * 1.1, 20, 20]} />
      </mesh>
      <mesh position={[0, -0.17, 0]} material={mat} castShadow>
        <cylinderGeometry args={[radius * 0.96, radius * 0.82, 0.32, 20]} />
      </mesh>
      <mesh position={[0, -0.33, 0]} material={mat} castShadow>
        <sphereGeometry args={[radius * 0.82, 16, 16]} />
      </mesh>
      <mesh position={[0, -0.47, 0]} material={mat} castShadow>
        <cylinderGeometry args={[radius * 0.8, radius * 0.6, 0.28, 20]} />
      </mesh>
      <mesh position={[0, -0.65, 0]} scale={[1, 1.35, 0.5]} material={mat} castShadow>
        <sphereGeometry args={[radius * 0.92, 16, 16]} />
      </mesh>
    </>
  );
}

/** Leg geometry built around the hip joint at the local origin. */
function LegContent({ radius, mat }: { radius: number; mat: THREE.Material }) {
  return (
    <>
      <mesh position={[0, -0.21, 0]} material={mat} castShadow>
        <cylinderGeometry args={[radius * 1.06, radius * 0.78, 0.44, 22]} />
      </mesh>
      <mesh position={[0, -0.44, 0]} material={mat} castShadow>
        <sphereGeometry args={[radius * 0.72, 18, 18]} />
      </mesh>
      <mesh position={[0, -0.64, 0]} material={mat} castShadow>
        <cylinderGeometry args={[radius * 0.78, radius * 0.5, 0.4, 22]} />
      </mesh>
      <mesh position={[0, -0.85, 0]} material={mat} castShadow>
        <sphereGeometry args={[radius * 0.44, 14, 14]} />
      </mesh>
      <mesh position={[0, -0.88, 0.07]} material={mat} castShadow>
        <boxGeometry args={[radius * 1.15, 0.06, 0.24]} />
      </mesh>
    </>
  );
}

export function Mannequin({
  measurements,
  selectedItems,
  gender,
  skinTone,
  motionRef,
}: MannequinProps) {
  const scale = useMemo(() => getBodyScale(measurements), [measurements]);
  const dims = useMemo(() => getBodyDims(scale, gender), [scale, gender]);
  const profile = useMemo(() => buildTorsoProfile(scale, gender), [scale, gender]);

  const skinMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: skinTone, roughness: 0.62, metalness: 0 }),
    [skinTone],
  );
  const hairMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: HAIR_COLOR, roughness: 0.9, metalness: 0 }),
    [],
  );

  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const phase = useRef(0);
  const amplitude = useRef(0);

  // Procedural gait: swing arms/legs in opposition, scaled by current speed.
  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const m = motionRef?.current;
    const moving = !!m?.moving;
    const speed = m?.speed ?? 0;

    phase.current += dt * (moving ? 5 + speed * 1.7 : 0);
    const target = moving ? Math.min(0.62, 0.2 + speed * 0.13) : 0;
    amplitude.current += (target - amplitude.current) * Math.min(1, dt * 8);

    const swing = Math.sin(phase.current) * amplitude.current;
    if (leftArm.current) leftArm.current.rotation.x = swing;
    if (rightArm.current) rightArm.current.rotation.x = -swing;
    if (leftLeg.current) leftLeg.current.rotation.x = -swing;
    if (rightLeg.current) rightLeg.current.rotation.x = swing;
  });

  return (
    <group scale={[1, scale.height, 1]} position={[0, 0, 0]}>
      {/* Torso: a smooth revolved silhouette, flattened front-to-back. */}
      <mesh scale={[1, 1, dims.depth]} material={skinMat} castShadow receiveShadow>
        <latheGeometry args={[profile, 48]} />
      </mesh>

      {/* Bust (female) */}
      {dims.bust > 0 &&
        [-1, 1].map((side) => (
          <mesh
            key={`bust-${side}`}
            position={[side * 0.062, 1.31, 0.082]}
            scale={[1.15, 0.95, 0.78]}
            material={skinMat}
            castShadow
          >
            <sphereGeometry args={[0.057 * scale.chest, 18, 18]} />
          </mesh>
        ))}

      {/* Seat / glutes */}
      {[-1, 1].map((side) => (
        <mesh
          key={`seat-${side}`}
          position={[side * 0.07, 0.93, -0.088]}
          scale={[1.1, 1, 0.92]}
          material={skinMat}
          castShadow
        >
          <sphereGeometry args={[0.072 * scale.hips * dims.seat, 18, 18]} />
        </mesh>
      ))}

      {/* Arms (pivot at the shoulder so they swing while walking) */}
      <group ref={leftArm} position={[-dims.shoulderHalf, 1.47, 0]} rotation={[0, 0, 0.07]}>
        <ArmContent radius={dims.armRadius} mat={skinMat} />
      </group>
      <group ref={rightArm} position={[dims.shoulderHalf, 1.47, 0]} rotation={[0, 0, -0.07]}>
        <ArmContent radius={dims.armRadius} mat={skinMat} />
      </group>

      {/* Legs (pivot at the hip) */}
      <group ref={leftLeg} position={[-dims.hipHalf, 0.92, 0]} rotation={[0, 0, -0.02]}>
        <LegContent radius={dims.legRadius} mat={skinMat} />
      </group>
      <group ref={rightLeg} position={[dims.hipHalf, 0.92, 0]} rotation={[0, 0, 0.02]}>
        <LegContent radius={dims.legRadius} mat={skinMat} />
      </group>

      {/* Neck */}
      <mesh position={[0, 1.61, 0]} material={skinMat} castShadow>
        <cylinderGeometry args={[0.05, 0.062, 0.09, 20]} />
      </mesh>

      {/* Head */}
      <group position={[0, 1.73, 0.004]}>
        <mesh material={skinMat} castShadow scale={[0.92, 1.08, 1]}>
          <sphereGeometry args={[0.112, 32, 32]} />
        </mesh>
        {/* Jaw / chin */}
        <mesh position={[0, -0.062, 0.012]} scale={[0.82, 0.74, 0.86]} material={skinMat} castShadow>
          <sphereGeometry args={[0.1, 24, 24]} />
        </mesh>
        {/* Hair cap — sits above the forehead so the face stays clear */}
        <mesh position={[0, 0.03, -0.02]} scale={[1.03, 1, 1.07]} material={hairMat} castShadow>
          <sphereGeometry args={[0.118, 28, 28, 0, Math.PI * 2, 0, Math.PI * 0.46]} />
        </mesh>
        {/* Longer hair mass falling behind the head for the female silhouette */}
        {gender === "female" && (
          <mesh position={[0, -0.07, -0.055]} scale={[0.86, 1.3, 0.62]} material={hairMat} castShadow>
            <sphereGeometry args={[0.108, 24, 24]} />
          </mesh>
        )}
      </group>

      {/* Clothing overlays */}
      {selectedItems.map((item) => (
        <Clothing key={item.id} item={item} scale={scale} />
      ))}
    </group>
  );
}
