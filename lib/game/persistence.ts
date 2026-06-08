import { createJSONStorage, type PersistOptions, type StateStorage } from "zustand/middleware";
import type { GameState } from "@/lib/game/store";

/** The subset of game state we persist across reloads (session-scoped). */
export type PersistedGame = Pick<
  GameState,
  | "measurements"
  | "gender"
  | "skinTone"
  | "selectedIds"
  | "garmentColors"
  | "scanned"
  | "lastMethod"
  | "scanHistory"
  | "bag"
  | "owned"
  | "credits"
  | "visitedZoneIds"
  | "discoveredShopIds"
>;

/**
 * SSR-safe storage: sessionStorage in the browser, an in-memory fallback during
 * server render so store creation never throws.
 */
const memory = new Map<string, string>();
const safeStorage: StateStorage = {
  getItem: (name) =>
    typeof window !== "undefined"
      ? window.sessionStorage.getItem(name)
      : memory.get(name) ?? null,
  setItem: (name, value) => {
    if (typeof window !== "undefined") window.sessionStorage.setItem(name, value);
    else memory.set(name, value);
  },
  removeItem: (name) => {
    if (typeof window !== "undefined") window.sessionStorage.removeItem(name);
    else memory.delete(name);
  },
};

export const persistOptions: PersistOptions<GameState, PersistedGame> = {
  name: "switchfit.world",
  version: 1,
  storage: createJSONStorage(() => safeStorage),
  partialize: (s) => ({
    measurements: s.measurements,
    gender: s.gender,
    skinTone: s.skinTone,
    selectedIds: s.selectedIds,
    garmentColors: s.garmentColors,
    scanned: s.scanned,
    lastMethod: s.lastMethod,
    scanHistory: s.scanHistory,
    bag: s.bag,
    owned: s.owned,
    credits: s.credits,
    visitedZoneIds: s.visitedZoneIds,
    discoveredShopIds: s.discoveredShopIds,
  }),
  // Keep current (transient) state and overlay the persisted slice on top.
  merge: (persisted, current) => ({
    ...current,
    ...(persisted as Partial<GameState>),
  }),
};
