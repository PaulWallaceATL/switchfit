import { useMemo } from "react";
import { useGameStore } from "@/lib/game/store";
import { findGarment } from "@/lib/catalog";
import { getFitScore, type SizeLabel } from "@/lib/fitLogic";
import type { WardrobeItem } from "@/lib/measurements";

/** Resolves the worn garment ids + colorways into renderable wardrobe items. */
export function useSelectedItems(): WardrobeItem[] {
  const selectedIds = useGameStore((s) => s.selectedIds);
  const garmentColors = useGameStore((s) => s.garmentColors);
  return useMemo(
    () =>
      selectedIds
        .map((id) => findGarment(id, garmentColors[id] ?? 0))
        .filter((item): item is WardrobeItem => Boolean(item)),
    [selectedIds, garmentColors],
  );
}

/** The size recommended for the current body measurements. */
export function useRecommendedSize(): SizeLabel {
  const measurements = useGameStore((s) => s.measurements);
  return useMemo(() => getFitScore(measurements).recommendedSize, [measurements]);
}
