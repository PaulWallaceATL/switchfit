/**
 * Zone definitions for the modular world. Each shop {@link Zone} is derived from
 * the existing {@link STORES} + their building transforms, so the zone system
 * stays in lockstep with the rendered storefronts and colliders.
 */

import {
  STORES,
  getBuildingTransforms,
  type StoreCategory,
} from "@/lib/stores";
import type { Zone, ZoneKind } from "@/lib/game/types";

export const PLAZA_ZONE_ID = "plaza";

/** Maps a store's catalog category onto a themed zone template. */
const KIND_BY_CATEGORY: Record<StoreCategory, ZoneKind> = {
  tops: "boutique",
  "color-studio": "boutique",
  bottoms: "streetwear",
  outerwear: "streetwear",
  "fitting-room": "fitting-room",
  accessories: "generic",
};

export const PLAZA_ZONE: Zone = {
  id: PLAZA_ZONE_ID,
  kind: "plaza",
  label: "Central Plaza",
  tagline: "The heart of the mall.",
  color: "#e7e3dd",
  accent: "#a8a29e",
  center: [0, 0],
  rotationY: 0,
};

export const ZONES: Zone[] = (() => {
  const transforms = getBuildingTransforms();
  const shopZones: Zone[] = STORES.map((store) => {
    const transform = transforms.find((t) => t.store.id === store.id);
    const center = transform?.center ?? [0, 0];
    const rotationY = transform?.rotationY ?? 0;
    return {
      id: store.id,
      kind: KIND_BY_CATEGORY[store.category],
      label: store.name,
      tagline: store.tagline,
      color: store.color,
      accent: store.accent,
      center,
      rotationY,
    };
  });
  return [PLAZA_ZONE, ...shopZones];
})();

export const ZONE_BY_ID: Record<string, Zone> = Object.fromEntries(
  ZONES.map((z) => [z.id, z]),
);

export function getZone(id: string): Zone | undefined {
  return ZONE_BY_ID[id];
}

/** Shop zones only (excludes the plaza), in arc order — handy for the minimap. */
export const SHOP_ZONES: Zone[] = ZONES.filter((z) => z.id !== PLAZA_ZONE_ID);
