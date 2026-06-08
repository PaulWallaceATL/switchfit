"use client";

import { Coins } from "lucide-react";
import { useGameStore } from "@/lib/game/store";

/** Top HUD pill showing the player's virtual credit balance. */
export function CreditsDisplay() {
  const credits = useGameStore((s) => s.credits);
  return (
    <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/15 bg-zinc-900/80 px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md">
      <Coins className="h-4 w-4 text-amber-400" />
      <span className="tabular-nums">{credits.toLocaleString()}</span>
      <span className="text-xs font-normal text-white/40">credits</span>
    </div>
  );
}
