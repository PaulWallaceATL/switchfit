import type { GameSliceCreator } from "@/lib/game/store";
import {
  DEFAULT_MEASUREMENTS,
  type MeasurementKey,
  type Measurements,
  type WardrobeItem,
} from "@/lib/measurements";
import { DEFAULT_GENDER, DEFAULT_SKIN_TONE, type Gender } from "@/lib/body";
import { findGarment, getProduct } from "@/lib/catalog";
import { appendScan, type ScanMethod, type ScanRecord } from "@/lib/session";

/**
 * Everything that defines the avatar's body + outfit. This migrates the cluster
 * of `useState` + `handle*` callbacks that used to live in `app/page.tsx`.
 */
export interface AvatarSlice {
  measurements: Measurements;
  gender: Gender;
  skinTone: string;
  /** Worn garment ids (one per garment type at a time). */
  selectedIds: string[];
  /** Chosen colorway index per product id. */
  garmentColors: Record<string, number>;
  scanned: boolean;
  lastMethod: ScanMethod | null;
  scanHistory: ScanRecord[];

  setMeasurement: (key: MeasurementKey, value: number) => void;
  setGender: (gender: Gender) => void;
  setSkinTone: (color: string) => void;
  toggleItem: (item: WardrobeItem) => void;
  tryOn: (productId: string, colorIndex: number) => void;
  removeTryOn: (productId: string) => void;
  applyScan: (
    measurements: Measurements,
    meta: { method: ScanMethod; weightLb?: number },
  ) => void;
  resetAvatar: () => void;
}

export const createAvatarSlice: GameSliceCreator<AvatarSlice> = (set) => ({
  measurements: DEFAULT_MEASUREMENTS,
  gender: DEFAULT_GENDER,
  skinTone: DEFAULT_SKIN_TONE,
  selectedIds: [],
  garmentColors: {},
  scanned: false,
  lastMethod: null,
  scanHistory: [],

  setMeasurement: (key, value) =>
    set((s) => ({
      measurements: { ...s.measurements, [key]: value },
      scanned: false,
    })),

  setGender: (gender) => set({ gender }),
  setSkinTone: (skinTone) => set({ skinTone }),

  toggleItem: (item) =>
    set((s) => {
      if (s.selectedIds.includes(item.id)) {
        return { selectedIds: s.selectedIds.filter((id) => id !== item.id) };
      }
      // Only one garment per type may be worn at a time.
      const withoutSameType = s.selectedIds.filter(
        (id) => findGarment(id)?.type !== item.type,
      );
      return { selectedIds: [...withoutSameType, item.id] };
    }),

  tryOn: (productId, colorIndex) =>
    set((s) => {
      const type = getProduct(productId)?.garment.type;
      const withoutSameType = s.selectedIds.filter(
        (id) => id !== productId && findGarment(id)?.type !== type,
      );
      return {
        garmentColors: { ...s.garmentColors, [productId]: colorIndex },
        selectedIds: [...withoutSameType, productId],
      };
    }),

  removeTryOn: (productId) =>
    set((s) => ({
      selectedIds: s.selectedIds.filter((id) => id !== productId),
    })),

  applyScan: (measurements, meta) =>
    set((s) => ({
      measurements,
      scanned: true,
      lastMethod: meta.method,
      scanHistory: appendScan(s.scanHistory, {
        method: meta.method,
        measurements,
        weightLb: meta.weightLb,
        at: new Date().toISOString(),
      }),
    })),

  resetAvatar: () =>
    set({
      measurements: DEFAULT_MEASUREMENTS,
      selectedIds: [],
      scanned: false,
      lastMethod: null,
    }),
});
