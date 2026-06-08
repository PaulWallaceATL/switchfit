"use client";

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import { Player } from "@/components/game/Player";
import { WorldSync } from "@/components/game/WorldSync";
import { ZoneManager } from "@/components/world/ZoneManager";
import { AmbientParticles } from "@/components/world/AmbientParticles";
import { NPCManager } from "@/components/game/npc/NPCManager";
import { MobileControls } from "@/components/game/MobileControls";
import { createInputState, useCoarsePointer, useKeyboardControls } from "@/components/game/input";

/**
 * The 3D world. Self-contained: avatar appearance, zone state, and interactions
 * all flow through the game store, so this component takes no props. Movement
 * input is shared via a mutable ref to avoid per-frame re-renders.
 */
export default function ThreeScene() {
  const inputRef = useRef(createInputState());
  const coarse = useCoarsePointer();
  useKeyboardControls(inputRef);

  return (
    <div className="relative h-full w-full">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 1.85, 3.4], fov: 50 }} className="h-full w-full">
        <color attach="background" args={["#ece8e2"]} />
        {/* Atmospheric haze gives the long mall arcade a sense of depth. */}
        <fog attach="fog" args={["#e6e1d9", 48, 135]} />

        <ambientLight intensity={0.72} color="#fff6ea" />
        {/* Warm key light (skylight from above), the main shadow caster. */}
        <directionalLight
          position={[4, 8, 5]}
          intensity={1.9}
          color="#fff3e2"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0004}
          shadow-camera-near={0.5}
          shadow-camera-far={40}
          shadow-camera-left={-12}
          shadow-camera-right={12}
          shadow-camera-top={12}
          shadow-camera-bottom={-12}
        />
        {/* Soft fill from the opposite side to lift the shadows. */}
        <directionalLight position={[-5, 4, -3]} intensity={0.45} color="#fbe9d6" />
        {/* Sky / floor bounce for natural, rounded shading. */}
        <hemisphereLight args={["#fff7ec", "#b3a692", 0.65]} />
        {/* Cool ambient skylight from behind for separation. */}
        <directionalLight position={[0, 5, -7]} intensity={0.4} color="#d6dcf2" />

        <Player inputRef={inputRef} />
        <WorldSync />
        <ZoneManager />
        <NPCManager inputRef={inputRef} />
        <AmbientParticles />

        {/* Polished mall floor: a smooth, lightly reflective stone tone. */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[400, 400]} />
          <meshStandardMaterial color="#cfc9c1" roughness={0.55} metalness={0.12} />
        </mesh>
        {/* Faint large-format tile seams — reads as a real floor, not a game grid. */}
        <Grid
          position={[0, 0.002, 0]}
          args={[400, 400]}
          cellSize={1}
          cellThickness={0.4}
          cellColor="#b8b1a8"
          sectionSize={4}
          sectionThickness={0.8}
          sectionColor="#a39b90"
          fadeDistance={42}
          fadeStrength={2}
          infiniteGrid
        />
      </Canvas>

      {/* Touch controls */}
      {coarse && <MobileControls inputRef={inputRef} />}
    </div>
  );
}
