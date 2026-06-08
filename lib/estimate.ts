import {
  DEFAULT_MEASUREMENTS,
  MEASUREMENT_RANGES,
  type MeasurementKey,
  type Measurements,
} from "@/lib/measurements";

export type BuildType = "slim" | "average" | "athletic" | "full";

export interface BuildOption {
  id: BuildType;
  label: string;
}

export const BUILD_OPTIONS: BuildOption[] = [
  { id: "slim", label: "Slim" },
  { id: "average", label: "Average" },
  { id: "athletic", label: "Athletic" },
  { id: "full", label: "Full" },
];

export interface PhotoInputs {
  /** Height in inches. */
  heightIn: number;
  /** Weight in pounds. */
  weightLb: number;
  build: BuildType;
}

/** Per-build tweaks (inches) applied on top of the BMI-derived estimate. */
const BUILD_DELTAS: Record<BuildType, { chest: number; waist: number; hips: number }> = {
  slim: { chest: -1, waist: -1.5, hips: -1 },
  average: { chest: 0, waist: 0, hips: 0 },
  athletic: { chest: 1.5, waist: -1, hips: 0.5 },
  full: { chest: 1, waist: 2, hips: 1.5 },
};

function clamp(key: MeasurementKey, value: number): number {
  const range = MEASUREMENT_RANGES.find((r) => r.key === key);
  if (!range) return Math.round(value);
  return Math.min(range.max, Math.max(range.min, Math.round(value)));
}

/**
 * Estimates body circumferences from height + weight (+ build). This is the
 * lower-accuracy fallback used when a guided 3D scan isn't available: it derives
 * waist/chest/hips from BMI, anchored so an average 69in / 165lb frame maps to
 * roughly the app's default measurements.
 */
export function estimateMeasurements(inputs: PhotoInputs): Measurements {
  const heightIn = inputs.heightIn || DEFAULT_MEASUREMENTS.height;
  const weightLb = inputs.weightLb || 165;
  const bmi = (weightLb * 703) / (heightIn * heightIn);
  const delta = BUILD_DELTAS[inputs.build] ?? BUILD_DELTAS.average;

  const waist = 0.9 * bmi + 0.15 * (heightIn - 69) + 10 + delta.waist;
  const chest = waist + 7.5 + 0.3 * (bmi - 22) + delta.chest;
  const hips = waist + 6.5 + 0.25 * (bmi - 22) + delta.hips;

  return {
    height: clamp("height", heightIn),
    chest: clamp("chest", chest),
    waist: clamp("waist", waist),
    hips: clamp("hips", hips),
  };
}
