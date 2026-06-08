import { create, type StateCreator } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";

import { createWorldSlice, type WorldSlice } from "@/lib/game/slices/worldSlice";
import { createPlayerSlice, type PlayerSlice } from "@/lib/game/slices/playerSlice";
import { createAvatarSlice, type AvatarSlice } from "@/lib/game/slices/avatarSlice";
import { createInventorySlice, type InventorySlice } from "@/lib/game/slices/inventorySlice";
import { createHudSlice, type HudSlice } from "@/lib/game/slices/hudSlice";
import { createNpcSlice, type NpcSlice } from "@/lib/game/slices/npcSlice";
import { createDialogueSlice, type DialogueSlice } from "@/lib/game/slices/dialogueSlice";
import { persistOptions } from "@/lib/game/persistence";

/** The full game state: every slice merged into one store. */
export type GameState = WorldSlice &
  PlayerSlice &
  AvatarSlice &
  InventorySlice &
  HudSlice &
  NpcSlice &
  DialogueSlice;

/**
 * Shared slice-creator type. We keep the mutator list empty here (`[]`) — the
 * middleware wrapping happens in {@link useGameStore} and slices remain simple,
 * which is the pattern recommended in the Zustand slices docs.
 */
export type GameSliceCreator<T> = StateCreator<GameState, [], [], T>;

export const useGameStore = create<GameState>()(
  subscribeWithSelector(
    persist(
      (...a) => ({
        ...createWorldSlice(...a),
        ...createPlayerSlice(...a),
        ...createAvatarSlice(...a),
        ...createInventorySlice(...a),
        ...createHudSlice(...a),
        ...createNpcSlice(...a),
        ...createDialogueSlice(...a),
      }),
      persistOptions,
    ),
  ),
);
