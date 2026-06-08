"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { GameHUD } from "@/components/hud/GameHUD";
import { Onboarding } from "@/components/Scanner/Onboarding";
import { useGameStore } from "@/lib/game/store";
import { setMuted, startAmbient } from "@/lib/game/audio";

const ThreeScene = dynamic(() => import("@/components/ThreeScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-stone-200 text-sm text-zinc-500">
      Loading the mall…
    </div>
  ),
});

/**
 * Top-level game container: the 3D world, the HUD overlay, and the AI body-scan
 * modal. All gameplay state flows through the Zustand store.
 */
export function GameShell() {
  const scannerOpen = useGameStore((s) => s.scannerOpen);
  const setScanner = useGameStore((s) => s.setScanner);
  const applyScan = useGameStore((s) => s.applyScan);
  const soundOn = useGameStore((s) => s.soundOn);

  // Start the ambient audio bed on the first user gesture (autoplay policy).
  useEffect(() => {
    const onGesture = () => {
      if (useGameStore.getState().soundOn) startAmbient();
    };
    window.addEventListener("pointerdown", onGesture, { once: true });
    window.addEventListener("keydown", onGesture, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
  }, []);

  useEffect(() => {
    setMuted(!soundOn);
  }, [soundOn]);

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* Absolute fill gives the canvas a definite height (percentage heights
          don't resolve against a block-level flex item in all browsers). */}
      <div className="absolute inset-0">
        <ThreeScene />
      </div>
      <GameHUD />
      <Onboarding
        open={scannerOpen}
        onClose={() => setScanner(false)}
        onComplete={(measurements, meta) => {
          applyScan(measurements, meta);
          setScanner(false);
        }}
      />
    </div>
  );
}
