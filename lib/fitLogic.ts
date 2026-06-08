import type { Measurements } from "@/lib/measurements";

export type SizeLabel = "XS" | "S" | "M" | "L" | "XL";

type Range = readonly [min: number, max: number];

export interface GarmentSize {
  size: SizeLabel;
  chest: Range;
  waist: Range;
  hips: Range;
}

/** Hardcoded size chart, all values in inches. */
export const GARMENT_SIZES: GarmentSize[] = [
  { size: "XS", chest: [32, 35], waist: [25, 28], hips: [33, 36] },
  { size: "S", chest: [35, 38], waist: [28, 31], hips: [36, 38] },
  { size: "M", chest: [38, 41], waist: [31, 34], hips: [38, 41] },
  { size: "L", chest: [41, 45], waist: [34, 38], hips: [41, 44] },
  { size: "XL", chest: [45, 49], waist: [38, 42], hips: [44, 48] },
];

/** Measured parts the fit engine evaluates. */
const FIT_PARTS = ["chest", "waist", "hips"] as const;
type FitPart = (typeof FIT_PARTS)[number];

/** Inches of leeway outside a range that still counts as a tolerable fit. */
const TOLERANCE = 4;

export type FitTone = "great" | "good" | "fair";

export interface FitNote {
  part: FitPart | "overall";
  direction: "tight" | "loose" | "neutral";
  text: string;
}

export interface FitResult {
  recommendedSize: SizeLabel;
  /** 0-100 closeness of the body to the recommended size. */
  matchPercentage: number;
  notes: FitNote[];
  tone: FitTone;
}

/** Score a single part against a range: 1.0 inside, falling off to 0 past TOLERANCE. */
function scorePart(value: number, [min, max]: Range): number {
  if (value >= min && value <= max) return 1;
  const distance = value < min ? min - value : value - max;
  return Math.max(0, 1 - distance / TOLERANCE);
}

function sizeScore(m: Measurements, size: GarmentSize): number {
  const total = FIT_PARTS.reduce((sum, part) => sum + scorePart(m[part], size[part]), 0);
  return total / FIT_PARTS.length;
}

function buildNotes(m: Measurements, size: GarmentSize): FitNote[] {
  const notes: FitNote[] = [];
  for (const part of FIT_PARTS) {
    const [min, max] = size[part];
    const value = m[part];
    if (value > max) {
      const far = value - max > TOLERANCE / 2;
      notes.push({
        part,
        direction: "tight",
        text: `${far ? "Tight" : "Slightly tight"} in the ${part}`,
      });
    } else if (value < min) {
      const far = min - value > TOLERANCE / 2;
      notes.push({
        part,
        direction: "loose",
        text: `${far ? "Loose" : "Slightly loose"} in the ${part}`,
      });
    }
  }
  return notes;
}

function toneFromMatch(match: number): FitTone {
  if (match >= 90) return "great";
  if (match >= 75) return "good";
  return "fair";
}

/**
 * Compares scanned measurements against the size chart and returns the best
 * matching size, a match percentage, and human-readable fit notes.
 */
export function getFitScore(m: Measurements): FitResult {
  let best = GARMENT_SIZES[0];
  let bestScore = -1;

  for (const size of GARMENT_SIZES) {
    const score = sizeScore(m, size);
    if (score > bestScore) {
      bestScore = score;
      best = size;
    }
  }

  const matchPercentage = Math.round(bestScore * 100);
  const notes = buildNotes(m, best);

  return {
    recommendedSize: best.size,
    matchPercentage,
    notes:
      notes.length > 0
        ? notes
        : [{ part: "overall", direction: "neutral", text: "Great all-around fit" }],
    tone: toneFromMatch(matchPercentage),
  };
}
