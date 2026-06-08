"use client";

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import { Player } from "@/components/game/Player";
import { Storefronts } from "@/components/game/Storefronts";
import { MobileControls } from "@/components/game/MobileControls";
import { createInputState, useCoarsePointer, useKeyboardControls } from "@/components/game/input";
import type { Measurements, WardrobeItem } from "@/lib/measurements";
import type { Gender } from "@/lib/body";

interface ThreeSceneProps {
  measurements: Measurements;
  selectedItems: WardrobeItem[];
  gender: Gender;
  skinTone: string;
  onEnterStore?: (storeId: string) => void;
}

export default function ThreeScene({
  measurements,
  selectedItems,
  gender,
  skinTone,
  onEnterStore,
}: ThreeSceneProps) {
  const inputRef = useRef(createInputState());
  const coarse = useCoarsePointer();
  useKeyboardControls(inputRef);

  return (
    <div className="relative h-full w-full">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 1.85, 3.4], fov: 50 }}
        className="h-full w-full"
      >
        <color attach="background" args={["#e7e5e4"]} />

        <ambientLight intensity={0.6} />
        <directionalLight
          position={[3, 6, 4]}
          intensity={2}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-near={0.5}
          shadow-camera-far={40}
          shadow-camera-left={-12}
          shadow-camera-right={12}
          shadow-camera-top={12}
          shadow-camera-bottom={-12}
        />
        <directionalLight position={[-4, 3, -3]} intensity={0.5} />
        <hemisphereLight args={["#fdf7f0", "#9b8c7a", 0.5]} />
        <directionalLight position={[0, 4, -6]} intensity={0.6} color="#cdd6ff" />

        <Player
          inputRef={inputRef}
          measurements={measurements}
          selectedItems={selectedItems}
          gender={gender}
          skinTone={skinTone}
          onEnterStore={onEnterStore}
        />

        <Storefronts />

        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[400, 400]} />
          <meshStandardMaterial color="#d6d3d1" roughness={1} />
        </mesh>
        <Grid
          position={[0, 0.001, 0]}
          args={[400, 400]}
          cellSize={0.5}
          cellThickness={0.6}
          cellColor="#a8a29e"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#78716c"
          fadeDistance={40}
          infiniteGrid
        />
      </Canvas>

      {/* Desktop control hint */}
      {!coarse && (
        <div className="pointer-events-none absolute left-4 top-4 rounded-lg bg-black/55 px-3 py-2 text-xs font-medium text-white shadow-sm backdrop-blur-sm">
          <span className="font-semibold">WASD / Arrows</span> move ·{" "}
          <span className="font-semibold">Shift</span> run ·{" "}
          <span className="font-semibold">Space</span> jump
        </div>
      )}

      {/* Touch controls */}
      {coarse && <MobileControls inputRef={inputRef} />}
    </div>
  );
}
