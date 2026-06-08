"use client";

import { useMemo, useState } from "react";
import { Backpack, X, Trash2, Coins, Check } from "lucide-react";
import { getProduct, type BagItem } from "@/lib/catalog";
import { useGameStore } from "@/lib/game/store";
import { playChime, playClick } from "@/lib/game/audio";

function group(items: BagItem[]): Record<string, { item: BagItem; index: number }[]> {
  const out: Record<string, { item: BagItem; index: number }[]> = {};
  items.forEach((item, index) => {
    const type = getProduct(item.productId)?.garment.type ?? "other";
    (out[type] ??= []).push({ item, index });
  });
  return out;
}

/**
 * The full inventory drawer (revamped from the old bag): items grouped by
 * category with per-item stats, the owned closet, a running subtotal, and a
 * credit-gated checkout.
 */
export function Inventory() {
  const open = useGameStore((s) => s.openPanel === "inventory");
  const closePanel = useGameStore((s) => s.closePanel);
  const bag = useGameStore((s) => s.bag);
  const owned = useGameStore((s) => s.owned);
  const credits = useGameStore((s) => s.credits);
  const removeFromBag = useGameStore((s) => s.removeFromBag);
  const checkout = useGameStore((s) => s.checkout);
  const [flash, setFlash] = useState<"none" | "ok" | "poor">("none");

  const subtotal = useMemo(
    () => bag.reduce((sum, item) => sum + (getProduct(item.productId)?.price ?? 0), 0),
    [bag],
  );
  const grouped = useMemo(() => group(bag), [bag]);
  const affordable = subtotal <= credits;

  if (!open) return null;

  const onCheckout = () => {
    const ok = checkout();
    if (ok) playChime();
    else playClick();
    setFlash(ok ? "ok" : "poor");
    setTimeout(() => setFlash("none"), 1600);
  };

  return (
    <div className="pointer-events-auto absolute inset-0 z-30">
      <div className="animate-backdrop-in absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={closePanel} />
      <div className="animate-drawer-in absolute right-0 top-0 flex h-full w-[24rem] max-w-[90vw] flex-col bg-zinc-950 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Backpack className="h-5 w-5" />
            Inventory
          </h2>
          <button
            type="button"
            onClick={closePanel}
            aria-label="Close inventory"
            className="press rounded-md p-1 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {bag.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-3 text-center text-white/40">
              <Backpack className="h-10 w-10" />
              <p className="text-sm">Your bag is empty. Walk into a shop and add something.</p>
            </div>
          ) : (
            Object.entries(grouped).map(([type, entries]) => (
              <div key={type} className="mb-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">{type}</p>
                <ul className="stagger flex flex-col gap-2">
                  {entries.map(({ item, index }) => {
                    const product = getProduct(item.productId);
                    if (!product) return null;
                    const color = product.colors[item.colorIndex] ?? product.colors[0];
                    return (
                      <li key={`${item.productId}-${index}`} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                        <span className="h-10 w-10 shrink-0 rounded-lg border border-white/10" style={{ backgroundColor: color }} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-white/50">Size {item.size} · {product.garment.type}</p>
                        </div>
                        <span className="text-sm font-semibold tabular-nums">${product.price}</span>
                        <button
                          type="button"
                          onClick={() => removeFromBag(index)}
                          aria-label={`Remove ${product.name}`}
                          className="press rounded-md p-1.5 text-white/40 hover:bg-white/10 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}

          {owned.length > 0 && (
            <div className="mt-2 border-t border-white/10 pt-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400/70">Owned ({owned.length})</p>
              <div className="flex flex-wrap gap-2">
                {owned.map((item, i) => {
                  const product = getProduct(item.productId);
                  const color = product?.colors[item.colorIndex] ?? product?.colors[0];
                  return (
                    <span
                      key={`${item.productId}-owned-${i}`}
                      title={product?.name}
                      className="h-8 w-8 rounded-lg border border-white/15"
                      style={{ backgroundColor: color }}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 px-5 py-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-white/60">Subtotal</span>
            <span className="text-lg font-semibold tabular-nums">${subtotal}</span>
          </div>
          <div className="mb-3 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-white/40"><Coins className="h-3.5 w-3.5 text-amber-400" /> Balance</span>
            <span className={`tabular-nums ${affordable ? "text-white/60" : "text-red-400"}`}>{credits} credits</span>
          </div>
          <button
            type="button"
            onClick={onCheckout}
            disabled={bag.length === 0 || !affordable}
            className={`press flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
              bag.length === 0 || !affordable
                ? "cursor-not-allowed bg-white/10 text-white/40"
                : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400"
            }`}
          >
            {flash === "ok" ? (
              <><Check className="h-4 w-4" /> Purchased!</>
            ) : flash === "poor" || !affordable ? (
              "Not enough credits"
            ) : (
              `Check out — $${subtotal}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
