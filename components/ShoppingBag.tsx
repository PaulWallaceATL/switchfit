"use client";

import { useState } from "react";
import { ShoppingBag as BagIcon, X, Trash2 } from "lucide-react";
import { getProduct, type BagItem } from "@/lib/catalog";

interface ShoppingBagProps {
  items: BagItem[];
  onRemove: (index: number) => void;
}

/**
 * Floating bag button with a slide-over drawer. Subtotal is display-only;
 * checkout (pickup vs ship) is a later pass.
 */
export function ShoppingBag({ items, onRemove }: ShoppingBagProps) {
  const [open, setOpen] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + (getProduct(item.productId)?.price ?? 0), 0);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open shopping bag"
        className="pointer-events-auto absolute right-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/15 bg-zinc-900/80 px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-colors hover:bg-zinc-800/90"
      >
        <BagIcon className="h-4 w-4" />
        Bag
        {items.length > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-500 px-1.5 text-xs font-bold text-white">
            {items.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute inset-0 z-20">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-[22rem] max-w-[88vw] flex-col bg-zinc-950 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2 className="text-lg font-semibold">Your Bag</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close bag"
                className="rounded-md p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-white/40">
                  <BagIcon className="h-10 w-10" />
                  <p className="text-sm">Your bag is empty. Walk into a store and add something.</p>
                </div>
              ) : (
                <ul className="flex flex-col gap-3">
                  {items.map((item, index) => {
                    const product = getProduct(item.productId);
                    if (!product) return null;
                    const color = product.colors[item.colorIndex] ?? product.colors[0];
                    return (
                      <li
                        key={`${item.productId}-${index}`}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                      >
                        <span
                          className="h-10 w-10 shrink-0 rounded-lg border border-white/10"
                          style={{ backgroundColor: color }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-white/50">Size {item.size}</p>
                        </div>
                        <span className="text-sm font-semibold tabular-nums">${product.price}</span>
                        <button
                          type="button"
                          onClick={() => onRemove(index)}
                          aria-label={`Remove ${product.name}`}
                          className="rounded-md p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="border-t border-white/10 px-5 py-4">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-white/60">Subtotal</span>
                <span className="text-lg font-semibold tabular-nums">${subtotal}</span>
              </div>
              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white/50"
              >
                Checkout — coming soon
              </button>
              <p className="mt-2 text-center text-[11px] text-white/30">
                Pickup &amp; shipping arrive in a future update.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
