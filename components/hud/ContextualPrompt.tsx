"use client";

import { useGameStore } from "@/lib/game/store";

/**
 * The bottom-center action hint, e.g. "[E] Talk to Fiona". Driven by the HUD
 * slice's `contextualPrompt`, set by the NPCManager / interaction systems.
 */
export function ContextualPrompt() {
  const prompt = useGameStore((s) => s.contextualPrompt);
  const dialogueOpen = useGameStore((s) => s.activeDialogue !== null);
  if (!prompt || dialogueOpen) return null;

  return (
    <div className="animate-pop-in pointer-events-none absolute bottom-28 left-1/2 z-10 -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-full border border-white/15 bg-zinc-900/80 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-md">
        {prompt.key && (
          <kbd className="flex h-6 min-w-6 items-center justify-center rounded-md border border-white/25 bg-white/10 px-1.5 text-xs font-bold">
            {prompt.key}
          </kbd>
        )}
        <span>{prompt.text}</span>
      </div>
    </div>
  );
}
