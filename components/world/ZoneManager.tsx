"use client";

import { Suspense } from "react";
import { Storefronts } from "@/components/game/Storefronts";
import { useGameStore } from "@/lib/game/store";
import { PLAZA_ZONE_ID, getZone } from "@/lib/world/zones";
import { ZONE_INTERIOR_BY_KIND } from "@/lib/world/zoneRegistry";

/**
 * Modular zone loader. The storefront exteriors (the plaza concourse) are always
 * mounted; the interior of the zone the player currently occupies is loaded on
 * demand via a lazy chunk and unmounted when they leave.
 */
export function ZoneManager() {
  const currentZoneId = useGameStore((s) => s.currentZoneId);
  const zone = getZone(currentZoneId);
  const Interior =
    zone && zone.id !== PLAZA_ZONE_ID ? ZONE_INTERIOR_BY_KIND[zone.kind] : undefined;

  return (
    <group>
      <Storefronts />
      {zone && Interior && (
        <Suspense fallback={null}>
          <Interior zone={zone} />
        </Suspense>
      )}
    </group>
  );
}
