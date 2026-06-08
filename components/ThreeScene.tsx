"use client";

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Grid, Sky } from "@react-three/drei";
import { Player } from "@/components/game/Player";
import { WorldSync } from "@/components/game/WorldSync";
import { ZoneManager } from "@/components/world/ZoneManager";
import { AmbientParticles } from "@/components/world/AmbientParticles";
import { CityScape } from "@/components/world/CityScape";
import { PlazaProps } from "@/components/world/PlazaProps";
import { NPCManager } from "@/components/game/npc/NPCManager";
import { MobileControls } from "@/components/game/MobileControls";
import { createInputState, useCoarsePointer, useKeyboardControls } from "@/components/game/input";

/** Shared sun direction so the procedural sky and the key light agree. */
const SUN: [number, number, number] = [60, 38, 48];

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
        {/* Procedural late-afternoon sky dome. */}
        <Sky distance={4500} sunPosition={SUN} turbidity={6} rayleigh={1.4} mieCoefficient={0.006} mieDirectionalG={0.85} />
        {/* Atmospheric haze so the distant skyline melts into the horizon. */}
        <fog attach="fog" args={["#cfd9e6", 60, 190]} />

        <ambientLight intensity={0.6} color="#eaf0ff" />
        {/* Warm sun key light, aligned with the sky's sun, the main shadow caster. */}
        <directionalLight
          position={SUN}
          intensity={2.1}
          color="#fff1da"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0004}
          shadow-camera-near={0.5}
          shadow-camera-far={120}
          shadow-camera-left={-26}
          shadow-camera-right={26}
          shadow-camera-top={26}
          shadow-camera-bottom={-26}
        />
        {/* Soft fill from the opposite side to lift the shadows. */}
        <directionalLight position={[-5, 4, -3]} intensity={0.4} color="#dfe7f5" />
        {/* Sky / ground bounce for natural, rounded shading. */}
        <hemisphereLight args={["#cfe0ff", "#9c9384", 0.7]} />

        <Player inputRef={inputRef} />
        <WorldSync />
        <ZoneManager />
        <NPCManager inputRef={inputRef} />
        <CityScape />
        <PlazaProps />
        <AmbientParticles />

        {/* Surrounding city ground (asphalt/streets) under the skyline. */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
          <planeGeometry args={[600, 600]} />
          <meshStandardMaterial color="#6e6a66" roughness={0.95} />
        </mesh>
        {/* Polished circular plaza pad: a smooth, lightly reflective stone tone. */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <circleGeometry args={[34, 64]} />
          <meshStandardMaterial color="#cfc9c1" roughness={0.5} metalness={0.14} />
        </mesh>
        {/* Decorative inlay ring around the fountain plaza. */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 11]}>
          <ringGeometry args={[3.0, 3.4, 48]} />
          <meshStandardMaterial color="#a39b90" roughness={0.6} />
        </mesh>
        {/* Faint large-format tile seams — reads as a real floor, not a game grid. */}
        <Grid
          position={[0, 0.002, 0]}
          args={[80, 80]}
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
