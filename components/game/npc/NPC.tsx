"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";
import type { NpcDef } from "@/lib/game/npc";
import { useGameStore } from "@/lib/game/store";
import { playerPosition } from "@/components/game/playerState";

/**
 * A stylized NPC: a friendly capsule character with a name tag. Idles with a
 * gentle bob, turns to face the player and waves when they're in range.
 */
export function NPC({ def }: { def: NpcDef }) {
  const root = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const near = useGameStore((s) => s.nearbyNpcId === def.id);

  const bodyMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.7 }),
    [def.color],
  );
  const accentMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: def.accent, roughness: 0.6 }),
    [def.accent],
  );
  const skinMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: def.skin, roughness: 0.66 }),
    [def.skin],
  );

  useFrame((state) => {
    const g = root.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.position.y = Math.sin(t * 2 + def.position[0]) * 0.03;

    if (near) {
      const dx = playerPosition.x - def.position[0];
      const dz = playerPosition.z - def.position[1];
      const target = Math.atan2(dx, dz);
      let diff = target - g.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      g.rotation.y += diff * 0.12;
      if (rightArm.current) rightArm.current.rotation.z = -0.5 - Math.abs(Math.sin(t * 6)) * 0.6;
    } else {
      g.rotation.y += (def.facing - g.rotation.y) * 0.05;
      if (rightArm.current) rightArm.current.rotation.z = -0.1;
    }
  });

  return (
    <group position={[def.position[0], 0, def.position[1]]}>
      <group ref={root}>
        {/* Body */}
        <mesh position={[0, 0.95, 0]} castShadow material={bodyMat}>
          <capsuleGeometry args={[0.28, 0.8, 10, 20]} />
        </mesh>
        {/* Neck + head */}
        <mesh position={[0, 1.62, 0]} castShadow material={skinMat}>
          <sphereGeometry args={[0.2, 28, 28]} />
        </mesh>
        {/* Hair / cap */}
        <mesh position={[0, 1.72, -0.01]} scale={[1.05, 0.9, 1.05]} castShadow material={accentMat}>
          <sphereGeometry args={[0.2, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        </mesh>
        {/* Left arm */}
        <group position={[-0.32, 1.2, 0]} rotation={[0, 0, 0.12]}>
          <mesh position={[0, -0.28, 0]} castShadow material={bodyMat}>
            <capsuleGeometry args={[0.09, 0.5, 8, 14]} />
          </mesh>
        </group>
        {/* Right arm (waves) */}
        <group ref={rightArm} position={[0.32, 1.2, 0]} rotation={[0, 0, -0.1]}>
          <mesh position={[0, -0.28, 0]} castShadow material={bodyMat}>
            <capsuleGeometry args={[0.09, 0.5, 8, 14]} />
          </mesh>
        </group>
      </group>

      {/* Name tag */}
      <Billboard position={[0, 2.2, 0]}>
        <Text fontSize={0.2} anchorX="center" anchorY="middle" color="#fafaf9" outlineWidth={0.012} outlineColor="#0c0a09">
          {def.name}
        </Text>
        <Text position={[0, -0.22, 0]} fontSize={0.13} anchorX="center" anchorY="middle" color={def.accent} outlineWidth={0.008} outlineColor="#0c0a09">
          {def.role}
        </Text>
      </Billboard>
    </group>
  );
}
