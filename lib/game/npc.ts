/**
 * NPC roster for the mall. Positions are resolved to world space from their
 * home zone so characters stand inside the right shop (or out in the plaza).
 */

import type { NpcArchetype } from "@/lib/game/types";
import { PLAZA_ZONE_ID, getZone } from "@/lib/world/zones";
import { localToWorld } from "@/lib/stores";

export interface NpcDef {
  id: string;
  name: string;
  role: string;
  archetype: NpcArchetype;
  /** Zone the NPC lives in; only spawned while the player is in that zone. */
  zoneId: string;
  /** World position on the floor (XZ). */
  position: [number, number];
  /** Resting facing (radians). */
  facing: number;
  /** Body color. */
  color: string;
  /** Accent (hat / trim) color. */
  accent: string;
  /** Skin tone. */
  skin: string;
  dialogueId: string;
}

/** Places an NPC at a local offset inside its shop zone. */
function inZone(zoneId: string, lx: number, lz: number): [number, number] {
  const zone = getZone(zoneId);
  if (!zone) return [0, 0];
  return localToWorld(zone.center, zone.rotationY, lx, lz);
}

function facingZone(zoneId: string): number {
  return (getZone(zoneId)?.rotationY ?? 0) + Math.PI;
}

export const NPCS: NpcDef[] = [
  {
    id: "fiona",
    name: "Fashionista Fiona",
    role: "Stylist",
    archetype: "stylist",
    zoneId: "fitting-room",
    position: inZone("fitting-room", 2.4, -2),
    facing: facingZone("fitting-room"),
    color: "#db2777",
    accent: "#f9a8d4",
    skin: "#e7b48f",
    dialogueId: "fiona",
  },
  {
    id: "security",
    name: "Mall Security",
    role: "Navigation",
    archetype: "security",
    zoneId: PLAZA_ZONE_ID,
    position: [3, 5.5],
    facing: Math.PI,
    color: "#1e3a8a",
    accent: "#bfdbfe",
    skin: "#8a5a37",
    dialogueId: "security",
  },
  {
    id: "alex",
    name: "Arcade Alex",
    role: "Tech & Games",
    archetype: "tech",
    zoneId: PLAZA_ZONE_ID,
    position: [-4, 6.5],
    facing: Math.PI * 0.85,
    color: "#0f766e",
    accent: "#5eead4",
    skin: "#cf9367",
    dialogueId: "alex",
  },
];

export function getNpc(id: string): NpcDef | undefined {
  return NPCS.find((n) => n.id === id);
}
