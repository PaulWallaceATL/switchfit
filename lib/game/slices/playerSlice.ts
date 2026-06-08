import type { GameSliceCreator } from "@/lib/game/store";
import type { Vec2 } from "@/lib/game/types";

export const STARTING_CREDITS = 500;

/**
 * Player wallet + a throttled snapshot of their world position. The 60fps
 * position lives in a ref inside the Player controller; only a low-frequency
 * snapshot is published here so the minimap can subscribe cheaply.
 */
export interface PlayerSlice {
  credits: number;
  playerPos: Vec2;
  /** Heading in radians, for the minimap arrow. */
  facing: number;
  setPlayerPos: (pos: Vec2, facing: number) => void;
  addCredits: (amount: number) => void;
  /** Spend credits if affordable; returns whether the spend succeeded. */
  spendCredits: (amount: number) => boolean;
}

export const createPlayerSlice: GameSliceCreator<PlayerSlice> = (set, get) => ({
  credits: STARTING_CREDITS,
  playerPos: { x: 0, z: 0 },
  facing: Math.PI,

  setPlayerPos: (pos, facing) => set({ playerPos: pos, facing }),

  addCredits: (amount) => set((s) => ({ credits: s.credits + amount })),

  spendCredits: (amount) => {
    if (get().credits < amount) return false;
    set((s) => ({ credits: s.credits - amount }));
    return true;
  },
});
