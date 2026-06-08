"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Grid } from "@react-three/drei";
import { Mannequin } from "@/components/Mannequin";
import type { Measurements, WardrobeItem } from "@/lib/measurements";

interface ThreeSceneProps {
  measurements: Measurements;
  selectedItems: WardrobeItem[];
}

export default function ThreeScene({ measurements, selectedItems }: ThreeSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 1.1, 4], fov: 45 }}
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
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <directionalLight position={[-4, 3, -3]} intensity={0.5} />

      <Mannequin measurements={measurements} selectedItems={selectedItems} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#d6d3d1" roughness={1} />
      </mesh>
      <Grid
        position={[0, 0.001, 0]}
        args={[40, 40]}
        cellSize={0.5}
        cellThickness={0.6}
        cellColor="#a8a29e"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#78716c"
        fadeDistance={18}
        infiniteGrid
      />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.45} scale={8} blur={2.4} far={4} />

      <OrbitControls
        target={[0, 1, 0]}
        enablePan={false}
        minDistance={2}
        maxDistance={8}
        maxPolarAngle={Math.PI / 1.9}
      />
    </Canvas>
  );
}
