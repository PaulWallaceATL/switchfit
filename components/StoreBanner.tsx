"use client";

import { useEffect, useState } from "react";
import { STORES } from "@/lib/stores";

/**
 * A brief "Welcome to ..." ribbon that animates in whenever the avatar enters a
 * new store, then fades out on its own.
 */
export function StoreBanner({ storeId }: { storeId: string | null }) {
  const [shown, setShown] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!storeId) return;
    setShown(storeId);
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 2600);
    return () => clearTimeout(timer);
  }, [storeId]);

  const store = STORES.find((s) => s.id === shown);
  if (!store) return null;

  return (
    <div
      className={`pointer-events-none absolute left-1/2 top-8 z-10 -translate-x-1/2 transition-all duration-500 ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
      }`}
    >
      <div
        className="flex flex-col items-center gap-1 rounded-2xl border border-white/15 bg-zinc-900/80 px-8 py-4 text-center shadow-xl backdrop-blur-md"
        style={{ boxShadow: `0 0 40px -8px ${store.accent}` }}
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/50">
          Now entering
        </span>
        <span className="text-2xl font-semibold tracking-tight text-white">{store.name}</span>
        <span className="text-xs text-white/60">{store.tagline}</span>
        <span
          className="mt-1 h-0.5 w-16 rounded-full"
          style={{ backgroundColor: store.accent }}
        />
      </div>
    </div>
  );
}
