import type { GameSliceCreator } from "@/lib/game/store";
import type { NpcId, NpcState } from "@/lib/game/types";

/**
 * Lightweight NPC runtime state. Per-character behaviour (Idle/Greet/Interact)
 * is tracked here; the spawning + proximity logic lives in the NPCManager.
 */
export interface NpcSlice {
  npcStates: Record<NpcId, NpcState>;
  /** The NPC currently in interaction range, if any. */
  nearbyNpcId: NpcId | null;
  setNpcState: (id: NpcId, state: NpcState) => void;
  setNearbyNpc: (id: NpcId | null) => void;
}

export const createNpcSlice: GameSliceCreator<NpcSlice> = (set) => ({
  npcStates: {},
  nearbyNpcId: null,

  setNpcState: (id, state) =>
    set((s) =>
      s.npcStates[id] === state
        ? s
        : { npcStates: { ...s.npcStates, [id]: state } },
    ),

  setNearbyNpc: (id) =>
    set((s) => (s.nearbyNpcId === id ? s : { nearbyNpcId: id })),
});
