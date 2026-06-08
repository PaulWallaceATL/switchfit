"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { interiorZoneAt, nearestProduct } from "@/components/game/collision";
import { playerHeading, playerPosition } from "@/components/game/playerState";
import { useGameStore } from "@/lib/game/store";

/**
 * Headless bridge between the live (per-frame) player transform and the Zustand
 * store. Drives zone enter/leave, the active product near a podium, and a
 * throttled position snapshot for the minimap. Reads happen every frame but
 * writes are edge-triggered, so HUD subscribers re-render rarely.
 */
export function WorldSync() {
  const frame = useRef(0);
  const lastZone = useRef<string | null>(null);
  const lastProduct = useRef<string | null>(null);

  useFrame(() => {
    const store = useGameStore.getState();
    frame.current += 1;

    const zoneId = interiorZoneAt(playerPosition);
    if (zoneId !== lastZone.current) {
      lastZone.current = zoneId;
      if (zoneId) store.enterZone(zoneId);
      else store.leaveZone();
    }

    const product = nearestProduct(playerPosition);
    if (product !== lastProduct.current) {
      lastProduct.current = product;
      store.setActiveProduct(product);
    }

    // Low-frequency position snapshot for the minimap.
    if (frame.current % 6 === 0) {
      store.setPlayerPos(
        { x: playerPosition.x, z: playerPosition.z },
        playerHeading.value,
      );
    }
  });

  return null;
}
