export interface Measurements {
  /** Body height in inches. */
  height: number;
  /** Waist circumference in inches. */
  waist: number;
  /** Chest circumference in inches. */
  chest: number;
  /** Hip circumference in inches. */
  hips: number;
}

export type MeasurementKey = keyof Measurements;

export const DEFAULT_MEASUREMENTS: Measurements = {
  height: 69,
  waist: 32,
  chest: 40,
  hips: 39,
};

export interface MeasurementRange {
  key: MeasurementKey;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
}

export const MEASUREMENT_RANGES: MeasurementRange[] = [
  { key: "height", label: "Height", unit: "in", min: 59, max: 79, step: 1 },
  { key: "chest", label: "Chest", unit: "in", min: 30, max: 54, step: 1 },
  { key: "waist", label: "Waist", unit: "in", min: 24, max: 48, step: 1 },
  { key: "hips", label: "Hips", unit: "in", min: 30, max: 54, step: 1 },
];

/**
 * Scale factors derived from raw measurements. A value of 1 corresponds to the
 * default measurements, so the mannequin and clothing meshes can multiply their
 * base geometry by these factors and stay in proportion as sliders change.
 */
export interface BodyScale {
  /** Overall vertical scale (drives height). */
  height: number;
  /** Width/depth of the upper torso (chest). */
  chest: number;
  /** Width/depth of the mid torso (waist). */
  waist: number;
  /** Width/depth of the pelvis and legs (hips). */
  hips: number;
  /** Thickness of arms, derived from overall girth. */
  limb: number;
}

export function getBodyScale(m: Measurements): BodyScale {
  const chest = m.chest / DEFAULT_MEASUREMENTS.chest;
  const waist = m.waist / DEFAULT_MEASUREMENTS.waist;
  const hips = m.hips / DEFAULT_MEASUREMENTS.hips;
  return {
    height: m.height / DEFAULT_MEASUREMENTS.height,
    chest,
    waist,
    hips,
    limb: 0.8 + 0.4 * ((chest + waist + hips) / 3),
  };
}

/**
 * Geometric layout of the mannequin in world units, with the feet near y = 0.
 * Shared between the body meshes and the clothing meshes so garments line up
 * with the correct body regions.
 */
export const BODY_LAYOUT = {
  leg: { y: 0.45, radius: 0.1, length: 0.62, offsetX: 0.12 },
  lowerTorso: { y: 1.02, radius: 0.15, length: 0.18 },
  upperTorso: { y: 1.34, radius: 0.17, length: 0.22 },
  arm: { y: 1.3, radius: 0.06, length: 0.5, offsetX: 0.27 },
  neck: { y: 1.66, radius: 0.05, length: 0.08 },
  head: { y: 1.8, radius: 0.13 },
} as const;

export type ClothingType = "shirt" | "pants";

export interface WardrobeItem {
  id: string;
  name: string;
  type: ClothingType;
  color: string;
  /** How loosely the garment sits on the body (1 = skin-tight). */
  looseness: number;
}

export const WARDROBE: WardrobeItem[] = [
  { id: "tshirt", name: "Basic T-Shirt", type: "shirt", color: "#3b82f6", looseness: 1.1 },
  { id: "hoodie", name: "Cozy Hoodie", type: "shirt", color: "#6b7280", looseness: 1.22 },
  { id: "slim-pants", name: "Slim Fit Pants", type: "pants", color: "#1f2937", looseness: 1.05 },
  { id: "cargo-pants", name: "Cargo Pants", type: "pants", color: "#4d7c0f", looseness: 1.18 },
];
