import * as THREE from "three";

/**
 * Live, per-frame player transform shared between the Player controller (writer)
 * and systems that need high-frequency reads (WorldSync, NPCManager) without
 * paying for 60fps React re-renders. The Zustand store only receives a
 * throttled snapshot for the minimap.
 */
export const playerPosition = new THREE.Vector3(0, 0, 0);
export const playerHeading = { value: Math.PI };
