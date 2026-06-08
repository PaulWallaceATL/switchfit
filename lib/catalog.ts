/**
 * Mocked product catalog for the walk-in stores. Each {@link Product} carries
 * the commerce data (price, colors) plus a `garment` descriptor that is
 * compatible with the avatar try-on system ({@link WardrobeItem}), so the same
 * selection mechanism drives both the sidebar wardrobe and in-store try-on.
 *
 * Everything here is mocked for the demo: prices and inventory are not real.
 */

import type { ClothingType, WardrobeItem } from "@/lib/measurements";
import type { SizeLabel } from "@/lib/fitLogic";
import {
  PODIUM_SLOTS_LOCAL,
  STORES,
  getBuildingTransforms,
  localToWorld,
} from "@/lib/stores";

export interface Product {
  id: string;
  storeId: string;
  name: string;
  /** Price in whole USD (mocked). */
  price: number;
  /** Selectable colorways; the first is the default. */
  colors: string[];
  /** Underlying garment for avatar try-on. */
  garment: { type: ClothingType; looseness: number };
  /** False for items the mannequin can't yet render (shown as display-only). */
  tryOnSupported: boolean;
}

/**
 * Three products per store, in podium-slot order. Apparel maps to shirt/pants
 * so it renders on the avatar; non-apparel is flagged display-only.
 */
export const CATALOG: Product[] = [
  // Crowned Tops
  { id: "tshirt", storeId: "tops", name: "Basic T-Shirt", price: 28, colors: ["#3b82f6", "#ef4444", "#111827"], garment: { type: "shirt", looseness: 1.1 }, tryOnSupported: true },
  { id: "hoodie", storeId: "tops", name: "Cozy Hoodie", price: 64, colors: ["#6b7280", "#1e3a8a", "#7c2d12"], garment: { type: "shirt", looseness: 1.22 }, tryOnSupported: true },
  { id: "henley", storeId: "tops", name: "Waffle Henley", price: 42, colors: ["#d6d3d1", "#374151", "#854d0e"], garment: { type: "shirt", looseness: 1.12 }, tryOnSupported: true },

  // Lower East
  { id: "slim-pants", storeId: "bottoms", name: "Slim Fit Pants", price: 72, colors: ["#1f2937", "#0f172a", "#3f3f46"], garment: { type: "pants", looseness: 1.05 }, tryOnSupported: true },
  { id: "cargo-pants", storeId: "bottoms", name: "Cargo Pants", price: 78, colors: ["#4d7c0f", "#44403c", "#1c1917"], garment: { type: "pants", looseness: 1.18 }, tryOnSupported: true },
  { id: "relaxed-denim", storeId: "bottoms", name: "Relaxed Denim", price: 88, colors: ["#1e3a5f", "#312e81", "#27272a"], garment: { type: "pants", looseness: 1.14 }, tryOnSupported: true },

  // The Fitting Room (essentials)
  { id: "crew-tee", storeId: "fitting-room", name: "Everyday Crew", price: 24, colors: ["#fafaf9", "#18181b", "#9ca3af"], garment: { type: "shirt", looseness: 1.08 }, tryOnSupported: true },
  { id: "chino", storeId: "fitting-room", name: "Stretch Chino", price: 68, colors: ["#a8a29e", "#1c1917", "#3f3f46"], garment: { type: "pants", looseness: 1.08 }, tryOnSupported: true },
  { id: "longsleeve", storeId: "fitting-room", name: "Long Sleeve Tee", price: 34, colors: ["#0f766e", "#7c2d12", "#1f2937"], garment: { type: "shirt", looseness: 1.12 }, tryOnSupported: true },

  // Color Studio (statement pieces)
  { id: "neon-tee", storeId: "color-studio", name: "Neon Statement Tee", price: 38, colors: ["#ec4899", "#22d3ee", "#a3e635"], garment: { type: "shirt", looseness: 1.1 }, tryOnSupported: true },
  { id: "color-pants", storeId: "color-studio", name: "Color-Pop Trousers", price: 74, colors: ["#f97316", "#8b5cf6", "#10b981"], garment: { type: "pants", looseness: 1.1 }, tryOnSupported: true },
  { id: "bright-hoodie", storeId: "color-studio", name: "Vivid Hoodie", price: 70, colors: ["#e11d48", "#2563eb", "#facc15"], garment: { type: "shirt", looseness: 1.24 }, tryOnSupported: true },

  // Northwind Outerwear (jackets render as roomy tops)
  { id: "bomber", storeId: "outerwear", name: "Bomber Jacket", price: 128, colors: ["#1c1917", "#365314", "#7f1d1d"], garment: { type: "shirt", looseness: 1.4 }, tryOnSupported: true },
  { id: "parka", storeId: "outerwear", name: "Winter Parka", price: 188, colors: ["#0f3a4d", "#1f2937", "#3f3f46"], garment: { type: "shirt", looseness: 1.5 }, tryOnSupported: true },
  { id: "rain-shell", storeId: "outerwear", name: "Rain Shell", price: 96, colors: ["#0ea5e9", "#facc15", "#111827"], garment: { type: "shirt", looseness: 1.42 }, tryOnSupported: true },

  // Trinket & Co. (accessories — display-only for now)
  { id: "beanie", storeId: "accessories", name: "Ribbed Beanie", price: 22, colors: ["#1c1917", "#7f1d1d", "#1e3a8a"], garment: { type: "shirt", looseness: 1 }, tryOnSupported: false },
  { id: "tote", storeId: "accessories", name: "Canvas Tote", price: 30, colors: ["#d6d3d1", "#44403c", "#365314"], garment: { type: "shirt", looseness: 1 }, tryOnSupported: false },
  { id: "scarf", storeId: "accessories", name: "Wool Scarf", price: 36, colors: ["#9f1239", "#1f2937", "#854d0e"], garment: { type: "shirt", looseness: 1 }, tryOnSupported: false },
];

/** A line item in the shopping bag. */
export interface BagItem {
  productId: string;
  colorIndex: number;
  size: SizeLabel;
}

export function getProduct(id: string): Product | undefined {
  return CATALOG.find((p) => p.id === id);
}

export function productsForStore(storeId: string): Product[] {
  return CATALOG.filter((p) => p.storeId === storeId);
}

/**
 * Resolves a product (optionally a specific colorway) to a {@link WardrobeItem}
 * the avatar can wear. `colorIndex` defaults to the product's primary color.
 */
export function findGarment(id: string, colorIndex = 0): WardrobeItem | undefined {
  const product = getProduct(id);
  if (!product) return undefined;
  return {
    id: product.id,
    name: product.name,
    type: product.garment.type,
    color: product.colors[colorIndex] ?? product.colors[0],
    looseness: product.garment.looseness,
  };
}

export interface Podium {
  product: Product;
  /** World XZ of the podium. */
  world: [number, number];
  /** Y rotation so the display faces the store's doorway. */
  rotationY: number;
}

/**
 * Places each store's products on the local podium slots and converts them to
 * world space using the same building transforms as the colliders.
 */
export function getPodiums(): Podium[] {
  const transforms = getBuildingTransforms();
  const podiums: Podium[] = [];
  for (const store of STORES) {
    const transform = transforms.find((t) => t.store.id === store.id);
    if (!transform) continue;
    const products = productsForStore(store.id);
    products.forEach((product, i) => {
      const slot = PODIUM_SLOTS_LOCAL[i];
      if (!slot) return;
      const world = localToWorld(transform.center, transform.rotationY, slot.x, slot.z);
      podiums.push({ product, world, rotationY: transform.rotationY });
    });
  }
  return podiums;
}

export const PODIUMS: Podium[] = getPodiums();
