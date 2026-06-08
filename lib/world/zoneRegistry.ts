import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { ZoneKind } from "@/lib/game/types";
import type { ZoneInteriorProps } from "@/components/world/zones/ShopInteriorZone";

/**
 * Dynamic-loading registry: maps a zone's theme onto a lazily imported interior
 * component, so a shop's geometry/textures are only fetched when the player
 * actually enters that kind of zone. The plaza has no interior (it's the open
 * concourse rendered by the storefront exteriors).
 */
export const ZONE_INTERIOR_BY_KIND: Partial<
  Record<ZoneKind, LazyExoticComponent<ComponentType<ZoneInteriorProps>>>
> = {
  boutique: lazy(() => import("@/components/world/zones/BoutiqueZone")),
  streetwear: lazy(() => import("@/components/world/zones/StreetwearZone")),
  "fitting-room": lazy(() => import("@/components/world/zones/FittingRoomZone")),
  generic: lazy(() => import("@/components/world/zones/ShopInteriorZone")),
  "food-court": lazy(() => import("@/components/world/zones/ShopInteriorZone")),
};
