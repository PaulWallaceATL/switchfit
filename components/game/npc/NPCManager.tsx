"use client";

import { useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { NPC } from "@/components/game/npc/NPC";
import { NPCS, type NpcDef } from "@/lib/game/npc";
import { getDialogueTree } from "@/lib/game/dialogue";
import { playerPosition } from "@/components/game/playerState";
import { useGameStore } from "@/lib/game/store";
import type { InputState } from "@/components/game/input";

/** How close (world units) the player must be to talk to an NPC. */
const TALK_RADIUS = 2.6;

/**
 * Spawns the NPCs that belong to the player's current zone, runs proximity
 * detection + the Idle/Greet/Interact state machine, and starts a conversation
 * when the player presses E next to someone.
 */
export function NPCManager({ inputRef }: { inputRef: MutableRefObject<InputState> }) {
  const currentZoneId = useGameStore((s) => s.currentZoneId);
  const active = NPCS.filter((n) => n.zoneId === currentZoneId);
  const lastNearby = useRef<string | null>(null);

  useFrame(() => {
    const store = useGameStore.getState();

    // Nearest in-range NPC among those currently spawned.
    let nearest: NpcDef | null = null;
    let bestDist = TALK_RADIUS * TALK_RADIUS;
    for (const npc of active) {
      const dx = playerPosition.x - npc.position[0];
      const dz = playerPosition.z - npc.position[1];
      const d = dx * dx + dz * dz;
      if (d < bestDist) {
        bestDist = d;
        nearest = npc;
      }
    }

    const nearbyId = nearest?.id ?? null;
    if (nearbyId !== lastNearby.current) {
      const prev = lastNearby.current;
      lastNearby.current = nearbyId;
      store.setNearbyNpc(nearbyId);
      if (prev) store.setNpcState(prev, "idle");
      if (nearbyId) store.setNpcState(nearbyId, "greet");
    }

    // Contextual prompt (suppressed while a conversation is open).
    if (nearest && !store.activeDialogue) {
      store.setPrompt({ text: `Talk to ${nearest.name.split(" ").slice(-1)[0]}`, key: "E" });
    } else if (!nearest && store.contextualPrompt?.key === "E") {
      store.setPrompt(null);
    }

    // Interact (E) opens dialogue with the nearby NPC.
    if (inputRef.current.interactQueued) {
      inputRef.current.interactQueued = false;
      if (nearest && !store.activeDialogue) {
        const tree = getDialogueTree(nearest.dialogueId);
        if (tree) {
          store.startDialogue(nearest.id, tree.start);
          store.setNpcState(nearest.id, "interact");
          store.setPrompt(null);
        }
      }
    }
  });

  return (
    <group>
      {active.map((npc) => (
        <NPC key={npc.id} def={npc} />
      ))}
    </group>
  );
}
