"use client";

import { useEffect, useState } from "react";
import { Check, ShoppingBag, Shirt } from "lucide-react";
import { getProduct } from "@/lib/catalog";
import { GARMENT_SIZES, type SizeLabel } from "@/lib/fitLogic";
import { useGameStore } from "@/lib/game/store";
import { useRecommendedSize } from "@/lib/game/selectors";
import { playClick } from "@/lib/game/audio";

/**
 * Appears when the avatar stands near a podium. Lets the shopper pick a color,
 * try the item on their avatar, choose a size, and drop it in the bag. All
 * state is sourced from / written to the game store.
 */
export function ProductCard() {
  const productId = useGameStore((s) => s.activeProductId);
  const wornIds = useGameStore((s) => s.selectedIds);
  const recommendedSize = useRecommendedSize();
  const tryOn = useGameStore((s) => s.tryOn);
  const removeTryOn = useGameStore((s) => s.removeTryOn);
  const addToBag = useGameStore((s) => s.addToBag);

  const [colorIndex, setColorIndex] = useState(0);
  const [size, setSize] = useState<SizeLabel>(recommendedSize);
  const [added, setAdded] = useState(false);

  // Reset selections whenever a different product comes into reach.
  useEffect(() => {
    setColorIndex(0);
    setSize(recommendedSize);
    setAdded(false);
  }, [productId, recommendedSize]);

  const product = productId ? getProduct(productId) : undefined;
  if (!product) return null;

  const worn = wornIds.includes(product.id);

  const pickColor = (index: number) => {
    setColorIndex(index);
    if (worn) tryOn(product.id, index);
  };

  const handleAddToBag = () => {
    addToBag({ productId: product.id, colorIndex, size });
    playClick();
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="animate-card-rise pointer-events-auto absolute bottom-6 left-1/2 z-10 w-[20rem] max-w-[90vw] -translate-x-1/2 overflow-hidden rounded-2xl border border-white/15 bg-zinc-900/85 text-white shadow-2xl backdrop-blur-md">
      <div
        className="h-24 w-full transition-colors duration-300 ease-out"
        style={{ backgroundColor: product.colors[colorIndex] }}
      />
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold leading-tight">{product.name}</h3>
            <p className="mt-0.5 text-xs text-white/50">
              Recommended size <span className="font-semibold text-white/80">{recommendedSize}</span>
            </p>
          </div>
          <span className="text-lg font-semibold tabular-nums">${product.price}</span>
        </div>

        {/* Colorways */}
        <div className="flex items-center gap-2">
          {product.colors.map((color, i) => (
            <button
              key={color}
              type="button"
              aria-label={`Color ${i + 1}`}
              onClick={() => pickColor(i)}
              style={{ backgroundColor: color }}
              className={`press h-6 w-6 rounded-full transition-all hover:scale-110 ${
                colorIndex === i
                  ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-zinc-900"
                  : "ring-1 ring-white/20 hover:ring-white/60"
              }`}
            />
          ))}
        </div>

        {/* Sizes */}
        <div className="flex flex-wrap gap-1.5">
          {GARMENT_SIZES.map(({ size: s }) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className={`press min-w-9 rounded-md border px-2 py-1 text-xs font-semibold transition-all ${
                size === s
                  ? "border-white bg-white text-zinc-900"
                  : "border-white/20 bg-white/5 text-white hover:border-white/50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-1 flex gap-2">
          {product.tryOnSupported ? (
            <button
              type="button"
              onClick={() => (worn ? removeTryOn(product.id) : tryOn(product.id, colorIndex))}
              className={`press flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                worn
                  ? "bg-white/15 text-white hover:bg-white/25"
                  : "bg-white text-zinc-900 hover:bg-zinc-200"
              }`}
            >
              <Shirt className="h-4 w-4" />
              {worn ? "Remove" : "Try on"}
            </button>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-xl bg-white/5 px-3 py-2.5 text-center text-xs text-white/50">
              Live preview coming soon
            </div>
          )}

          <button
            type="button"
            onClick={handleAddToBag}
            className={`press flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-white transition-all ${
              added
                ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                : "bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400"
            }`}
          >
            <span key={added ? "added" : "idle"} className="animate-pop-in">
              {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
            </span>
            {added ? "Added" : "Add to bag"}
          </button>
        </div>
      </div>
    </div>
  );
}
