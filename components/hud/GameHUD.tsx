"use client";

import { Backpack, Volume2, VolumeX } from "lucide-react";
import { CreditsDisplay } from "@/components/hud/CreditsDisplay";
import { Minimap } from "@/components/hud/Minimap";
import { ContextualPrompt } from "@/components/hud/ContextualPrompt";
import { ControlsHint } from "@/components/hud/ControlsHint";
import { DialogueBox } from "@/components/hud/DialogueBox";
import { Inventory } from "@/components/hud/Inventory";
import { CharacterPanel } from "@/components/hud/CharacterPanel";
import { ProductCard } from "@/components/ProductCard";
import { StoreBanner } from "@/components/StoreBanner";
import { useGameStore } from "@/lib/game/store";

/** Overlay layer: composes every 2D HUD element above the 3D world. */
export function GameHUD() {
  const bagCount = useGameStore((s) => s.bag.length);
  const togglePanel = useGameStore((s) => s.togglePanel);
  const activeProductId = useGameStore((s) => s.activeProductId);
  const dialogueOpen = useGameStore((s) => s.activeDialogue !== null);
  const soundOn = useGameStore((s) => s.soundOn);
  const toggleSound = useGameStore((s) => s.toggleSound);

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* Top-left: minimap */}
      <div className="absolute left-4 top-4">
        <Minimap />
      </div>

      {/* Top-right: credits + inventory */}
      <div className="absolute right-4 top-4 flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSound}
            aria-label={soundOn ? "Mute sound" : "Unmute sound"}
            className="press pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-zinc-900/80 text-white shadow-lg backdrop-blur-md hover:bg-zinc-800/90"
          >
            {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-white/50" />}
          </button>
          <CreditsDisplay />
        </div>
        <button
          type="button"
          onClick={() => togglePanel("inventory")}
          aria-label="Open inventory"
          className="press pointer-events-auto flex items-center gap-2 rounded-full border border-white/15 bg-zinc-900/80 px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md hover:bg-zinc-800/90"
        >
          <Backpack className="h-4 w-4" />
          Bag
          {bagCount > 0 && (
            <span key={bagCount} className="animate-pop-in flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-500 px-1.5 text-xs font-bold">
              {bagCount}
            </span>
          )}
        </button>
      </div>

      {/* Center / bottom transient elements */}
      <StoreBanner />
      <ContextualPrompt />
      <ControlsHint />
      {!dialogueOpen && <ProductCard key={activeProductId ?? "none"} />}
      <DialogueBox />

      {/* Full overlays */}
      <Inventory />
      <CharacterPanel />
    </div>
  );
}
