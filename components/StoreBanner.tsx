"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/lib/game/store";
import { PLAZA_ZONE_ID, getZone } from "@/lib/world/zones";

/**
 * A brief "Now entering ..." ribbon that animates in whenever the avatar enters
 * a new shop zone, then fades out on its own.
 */
export function StoreBanner() {
  const currentZoneId = useGameStore((s) => s.currentZoneId);
  const storeId = currentZoneId === PLAZA_ZONE_ID ? null : currentZoneId;

  const [shown, setShown] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!storeId) {
      setVisible(false);
      return;
    }
    setShown(storeId);
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 2600);
    return () => clearTimeout(timer);
  }, [storeId]);

  const zone = shown ? getZone(shown) : undefined;
  if (!zone) return null;

  return (
    <div
      className={`pointer-events-none absolute left-1/2 top-8 z-10 -translate-x-1/2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        visible ? "translate-y-0 scale-100 opacity-100" : "-translate-y-5 scale-95 opacity-0"
      }`}
    >
      <div
        className="flex flex-col items-center gap-1 rounded-2xl border border-white/15 bg-zinc-900/80 px-8 py-4 text-center shadow-xl backdrop-blur-md"
        style={{ boxShadow: `0 0 40px -8px ${zone.accent}` }}
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/50">
          Now entering
        </span>
        <span className="text-2xl font-semibold tracking-tight text-white">{zone.label}</span>
        <span className="text-xs text-white/60">{zone.tagline}</span>
        <span className="mt-1 h-0.5 w-16 rounded-full" style={{ backgroundColor: zone.accent }} />
      </div>
    </div>
  );
}
