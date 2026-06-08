import * as THREE from "three";
import type { BodyScale } from "@/lib/measurements";

export type Gender = "male" | "female";

export interface SkinTone {
  id: string;
  label: string;
  color: string;
}

/** A spread of skin tones from light to deep. */
export const SKIN_TONES: SkinTone[] = [
  { id: "porcelain", label: "Porcelain", color: "#f0d3bd" },
  { id: "fair", label: "Fair", color: "#e7b48f" },
  { id: "tan", label: "Tan", color: "#cf9367" },
  { id: "olive", label: "Olive", color: "#b07a4e" },
  { id: "brown", label: "Brown", color: "#8a5a37" },
  { id: "deep", label: "Deep", color: "#5c3a26" },
];

export const DEFAULT_SKIN_TONE = SKIN_TONES[1].color;
export const DEFAULT_GENDER: Gender = "male";

/** Hair color, paired loosely with skin tone for a believable look. */
export const HAIR_COLOR = "#2a2320";

/**
 * Silhouette multipliers that differentiate the body shapes. These reshape the
 * torso profile on top of the user's raw measurements: men read broader at the
 * shoulders and flatter through the hips; women read narrower at the waist with
 * wider hips and a bust.
 */
interface GenderShape {
  shoulder: number;
  chest: number;
  waist: number;
  hips: number;
}

const SHAPE: Record<Gender, GenderShape> = {
  male: { shoulder: 1.16, chest: 1.06, waist: 1.0, hips: 0.92 },
  female: { shoulder: 0.9, chest: 0.98, waist: 0.84, hips: 1.13 },
};

type Region = "hips" | "waist" | "chest" | "shoulder" | "neck";

/** Profile control points (height, base radius, driving region), bottom → top. */
interface ProfileNode {
  y: number;
  r: number;
  k: Region;
}

const TORSO_NODES: ProfileNode[] = [
  { y: 0.82, r: 0.108, k: "hips" },
  { y: 0.88, r: 0.158, k: "hips" },
  { y: 0.95, r: 0.173, k: "hips" },
  { y: 1.02, r: 0.15, k: "waist" },
  { y: 1.08, r: 0.133, k: "waist" },
  { y: 1.16, r: 0.15, k: "chest" },
  { y: 1.26, r: 0.169, k: "chest" },
  { y: 1.34, r: 0.177, k: "chest" },
  { y: 1.43, r: 0.164, k: "chest" },
  { y: 1.49, r: 0.149, k: "shoulder" },
  { y: 1.53, r: 0.104, k: "neck" },
  { y: 1.56, r: 0.062, k: "neck" },
];

function regionMultiplier(k: Region, scale: BodyScale, s: GenderShape): number {
  switch (k) {
    case "hips":
      return scale.hips * s.hips;
    case "waist":
      return scale.waist * s.waist;
    case "chest":
      return scale.chest * s.chest;
    case "shoulder":
      return scale.chest * s.shoulder;
    case "neck":
      return 1;
  }
}

/**
 * Builds the revolved torso silhouette for LatheGeometry. The points define a
 * smooth curve from pelvis to neck so chest/waist/hips blend continuously
 * instead of reading as stacked cylinders.
 */
export function buildTorsoProfile(scale: BodyScale, gender: Gender): THREE.Vector2[] {
  const s = SHAPE[gender];
  return TORSO_NODES.map(
    (n) => new THREE.Vector2(Math.max(0.001, n.r * regionMultiplier(n.k, scale, s)), n.y),
  );
}

export interface BodyDims {
  /** Half-distance between the two shoulder joints. */
  shoulderHalf: number;
  /** Half-distance between the two hip joints. */
  hipHalf: number;
  /** Arm thickness factor. */
  armRadius: number;
  /** Leg thickness factor. */
  legRadius: number;
  /** Front-to-back flattening of the torso (a real torso isn't a cylinder). */
  depth: number;
  /** How pronounced the bust is (0 = none). */
  bust: number;
  /** How pronounced the seat/glutes are. */
  seat: number;
}

export function getBodyDims(scale: BodyScale, gender: Gender): BodyDims {
  const s = SHAPE[gender];
  const shoulderLatheR = 0.149 * scale.chest * s.shoulder;
  return {
    shoulderHalf: shoulderLatheR + 0.04,
    hipHalf: 0.098 * (0.88 + 0.12 * scale.hips),
    armRadius: 0.062 * scale.limb,
    legRadius: 0.1 * scale.hips,
    depth: 0.76,
    bust: gender === "female" ? 1 : 0,
    seat: gender === "female" ? 1.12 : 0.95,
  };
}
