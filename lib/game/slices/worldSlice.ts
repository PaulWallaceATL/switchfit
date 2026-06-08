import type { GameSliceCreator } from "@/lib/game/store";
import { PLAZA_ZONE_ID } from "@/lib/world/zones";

/**
 * The WorldStateManager: tracks which zone the player occupies and the history
 * of places they have visited / shops they have discovered.
 */
export interface WorldSlice {
  currentZoneId: string;
  previousZoneId: string | null;
  visitedZoneIds: string[];
  discoveredShopIds: string[];
  enterZone: (id: string) => void;
  leaveZone: () => void;
  markDiscovered: (id: string) => void;
}

export const createWorldSlice: GameSliceCreator<WorldSlice> = (set) => ({
  currentZoneId: PLAZA_ZONE_ID,
  previousZoneId: null,
  visitedZoneIds: [PLAZA_ZONE_ID],
  discoveredShopIds: [],

  enterZone: (id) =>
    set((s) => {
      if (s.currentZoneId === id) return s;
      const visited = s.visitedZoneIds.includes(id)
        ? s.visitedZoneIds
        : [...s.visitedZoneIds, id];
      const discovered =
        id !== PLAZA_ZONE_ID && !s.discoveredShopIds.includes(id)
          ? [...s.discoveredShopIds, id]
          : s.discoveredShopIds;
      return {
        previousZoneId: s.currentZoneId,
        currentZoneId: id,
        visitedZoneIds: visited,
        discoveredShopIds: discovered,
      };
    }),

  leaveZone: () =>
    set((s) =>
      s.currentZoneId === PLAZA_ZONE_ID
        ? s
        : { previousZoneId: s.currentZoneId, currentZoneId: PLAZA_ZONE_ID },
    ),

  markDiscovered: (id) =>
    set((s) =>
      s.discoveredShopIds.includes(id)
        ? s
        : { discoveredShopIds: [...s.discoveredShopIds, id] },
    ),
});
