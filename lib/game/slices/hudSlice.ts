import type { GameSliceCreator } from "@/lib/game/store";
import type { ContextualPrompt, HudPanel } from "@/lib/game/types";

/**
 * Transient HUD/interaction state: the contextual action prompt, which overlay
 * panel is open, minimap visibility, and the product currently in reach.
 */
export interface HudSlice {
  contextualPrompt: ContextualPrompt | null;
  openPanel: HudPanel;
  minimapVisible: boolean;
  /** Whether the AI body-scan modal is open. */
  scannerOpen: boolean;
  /** Master sound toggle. */
  soundOn: boolean;
  /** Product whose card is shown when standing near a podium. */
  activeProductId: string | null;
  setPrompt: (prompt: ContextualPrompt | null) => void;
  setPanel: (panel: HudPanel) => void;
  togglePanel: (panel: HudPanel) => void;
  closePanel: () => void;
  toggleMinimap: () => void;
  setScanner: (open: boolean) => void;
  toggleSound: () => void;
  setActiveProduct: (id: string | null) => void;
}

export const createHudSlice: GameSliceCreator<HudSlice> = (set) => ({
  contextualPrompt: null,
  openPanel: "none",
  minimapVisible: true,
  scannerOpen: false,
  soundOn: true,
  activeProductId: null,

  setPrompt: (prompt) =>
    set((s) => {
      // Avoid churn: only update when the text/key actually changes.
      const a = s.contextualPrompt;
      if (a === prompt) return s;
      if (a && prompt && a.text === prompt.text && a.key === prompt.key) return s;
      return { contextualPrompt: prompt };
    }),

  setPanel: (panel) => set({ openPanel: panel }),
  togglePanel: (panel) =>
    set((s) => ({ openPanel: s.openPanel === panel ? "none" : panel })),
  closePanel: () => set({ openPanel: "none" }),
  toggleMinimap: () => set((s) => ({ minimapVisible: !s.minimapVisible })),
  setScanner: (scannerOpen) => set({ scannerOpen }),
  toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
  setActiveProduct: (id) =>
    set((s) => (s.activeProductId === id ? s : { activeProductId: id })),
});
