import type { GameSliceCreator } from "@/lib/game/store";
import type { DialogueNodeId, NpcId } from "@/lib/game/types";

/** Tracks the active branching conversation, if any. */
export interface DialogueSlice {
  activeDialogue: { npcId: NpcId; nodeId: DialogueNodeId } | null;
  startDialogue: (npcId: NpcId, nodeId: DialogueNodeId) => void;
  gotoNode: (nodeId: DialogueNodeId) => void;
  endDialogue: () => void;
}

export const createDialogueSlice: GameSliceCreator<DialogueSlice> = (set) => ({
  activeDialogue: null,

  startDialogue: (npcId, nodeId) => set({ activeDialogue: { npcId, nodeId } }),

  gotoNode: (nodeId) =>
    set((s) =>
      s.activeDialogue
        ? { activeDialogue: { ...s.activeDialogue, nodeId } }
        : s,
    ),

  endDialogue: () => set({ activeDialogue: null }),
});
