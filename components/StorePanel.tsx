"use client";

import { Check, ScanLine, X } from "lucide-react";
import { STORES } from "@/lib/stores";
import { WARDROBE, type WardrobeItem } from "@/lib/measurements";
import { SKIN_TONES } from "@/lib/body";

interface StorePanelProps {
  storeId: string | null;
  selectedIds: string[];
  skinTone: string;
  onToggleItem: (item: WardrobeItem) => void;
  onStartScan: () => void;
  onSkinToneChange: (color: string) => void;
  onClose: () => void;
}

/**
 * Overlay that appears when the avatar walks into a storefront. Each store maps
 * to a category and surfaces the relevant existing controls.
 */
export function StorePanel({
  storeId,
  selectedIds,
  skinTone,
  onToggleItem,
  onStartScan,
  onSkinToneChange,
  onClose,
}: StorePanelProps) {
  const store = STORES.find((s) => s.id === storeId);
  if (!store) return null;

  const shirtItems = WARDROBE.filter((w) => w.type === "shirt");
  const pantsItems = WARDROBE.filter((w) => w.type === "pants");

  return (
    <div className="pointer-events-auto absolute right-4 top-4 z-10 w-72 overflow-hidden rounded-2xl border border-white/15 bg-zinc-900/85 text-white shadow-xl backdrop-blur-md">
      <div className="h-1.5 w-full" style={{ backgroundColor: store.accent }} />
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold leading-tight">{store.name}</h2>
            <p className="mt-0.5 text-xs text-white/60">{store.tagline}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close store"
            className="rounded-md p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {(store.category === "tops" || store.category === "bottoms") && (
          <div className="grid grid-cols-2 gap-2.5">
            {(store.category === "tops" ? shirtItems : pantsItems).map((item) => {
              const active = selectedIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onToggleItem(item)}
                  className={`relative flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all ${
                    active
                      ? "border-white bg-white text-zinc-900"
                      : "border-white/20 bg-white/5 text-white hover:border-white/50"
                  }`}
                >
                  <span
                    className="h-7 w-7 rounded-full border border-black/10"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium leading-tight">{item.name}</span>
                  {active && (
                    <span className="absolute right-2 top-2 rounded-full bg-zinc-900 p-0.5 text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {store.category === "fitting-room" && (
          <button
            type="button"
            onClick={onStartScan}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:from-indigo-400 hover:to-violet-400"
          >
            <ScanLine className="h-4 w-4" />
            Start AI Scan
          </button>
        )}

        {store.category === "color-studio" && (
          <div className="flex flex-wrap gap-2">
            {SKIN_TONES.map((tone) => {
              const active = skinTone === tone.color;
              return (
                <button
                  key={tone.id}
                  type="button"
                  title={tone.label}
                  aria-label={tone.label}
                  onClick={() => onSkinToneChange(tone.color)}
                  style={{ backgroundColor: tone.color }}
                  className={`h-8 w-8 rounded-full transition-all ${
                    active
                      ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900"
                      : "ring-1 ring-white/20 hover:ring-white/60"
                  }`}
                />
              );
            })}
          </div>
        )}

        {(store.category === "outerwear" || store.category === "accessories") && (
          <div className="rounded-xl border border-dashed border-white/20 bg-white/5 px-4 py-6 text-center text-sm text-white/60">
            Coming soon
          </div>
        )}
      </div>
    </div>
  );
}
