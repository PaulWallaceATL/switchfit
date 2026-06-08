/**
 * Six storefronts arranged in a semicircle in front of the avatar's start.
 *
 * Both the rendered buildings ({@link Storefronts}) and the collision/trigger
 * data ({@link STORE_COLLIDERS}, {@link STORE_TRIGGERS}) are derived from the
 * same per-building transforms, so the walls you see line up with the walls
 * you bump into.
 */

export type StoreCategory =
  | "tops"
  | "bottoms"
  | "fitting-room"
  | "color-studio"
  | "outerwear"
  | "accessories";

export interface Store {
  id: string;
  name: string;
  tagline: string;
  /** Facade color. */
  color: string;
  /** Sign / trim accent color. */
  accent: string;
  category: StoreCategory;
}

export const STORES: Store[] = [
  {
    id: "tops",
    name: "Crowned Tops",
    tagline: "Tees, hoodies & everything up top.",
    color: "#3730a3",
    accent: "#a5b4fc",
    category: "tops",
  },
  {
    id: "bottoms",
    name: "Lower East",
    tagline: "Pants, denim & tailored fits.",
    color: "#3f6212",
    accent: "#bef264",
    category: "bottoms",
  },
  {
    id: "fitting-room",
    name: "The Fitting Room",
    tagline: "Scan your body for a perfect fit.",
    color: "#7c2d12",
    accent: "#fdba74",
    category: "fitting-room",
  },
  {
    id: "color-studio",
    name: "Color Studio",
    tagline: "Find your tone.",
    color: "#831843",
    accent: "#f9a8d4",
    category: "color-studio",
  },
  {
    id: "outerwear",
    name: "Northwind Outerwear",
    tagline: "Coats & jackets — coming soon.",
    color: "#0f3a4d",
    accent: "#7dd3fc",
    category: "outerwear",
  },
  {
    id: "accessories",
    name: "Trinket & Co.",
    tagline: "Accessories — coming soon.",
    color: "#4c1d95",
    accent: "#c4b5fd",
    category: "accessories",
  },
];

/** Arc + building dimensions, in world units. */
export const LAYOUT = {
  /** Distance from the origin to each building center. */
  radius: 22,
  /** Total angular spread of the semicircle, in radians (~160deg). */
  spread: (160 * Math.PI) / 180,
  width: 7,
  depth: 7,
  height: 40,
  wallThickness: 0.3,
  doorWidth: 2.6,
  doorHeight: 3.2,
  /** Spacing between layered floor bands. */
  floorHeight: 3.2,
} as const;

/** A wall footprint in a building's local XZ frame (origin at building center). */
export interface WallRect {
  cx: number;
  cz: number;
  hx: number;
  hz: number;
}

export interface BuildingTransform {
  store: Store;
  /** World-space center of the footprint (y is implied 0). */
  center: [number, number];
  /** Y rotation so the doorway (local +z) faces the origin. */
  rotationY: number;
}

export interface BuildingCollider extends BuildingTransform {
  walls: WallRect[];
}

export interface StoreTrigger extends BuildingTransform {
  storeId: string;
  /** Trigger rectangle in the building's local XZ frame. */
  rect: WallRect;
}

/**
 * Places each store on the arc. Building `i` sits at angle `theta` measured
 * from the -Z axis; its center is `(R sinθ, -R cosθ)` and it is rotated to
 * face the origin so the doorway opens toward the avatar's start.
 */
export function getBuildingTransforms(): BuildingTransform[] {
  const { radius, spread } = LAYOUT;
  const n = STORES.length;
  return STORES.map((store, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const theta = -spread / 2 + t * spread;
    const cx = radius * Math.sin(theta);
    const cz = -radius * Math.cos(theta);
    // Door (local +z) should point back toward the origin.
    const rotationY = Math.atan2(-cx, -cz);
    return { store, center: [cx, cz], rotationY };
  });
}

/** Builds the four perimeter walls with a gap in the front for the doorway. */
function buildWalls(): WallRect[] {
  const { width: W, depth: D, wallThickness: t, doorWidth: dw } = LAYOUT;
  const hw = W / 2;
  const hd = D / 2;
  const ht = t / 2;
  const segHx = (W - dw) / 4;
  const segCx = (W + dw) / 4;
  return [
    // Back wall (local -z).
    { cx: 0, cz: -hd + ht, hx: hw, hz: ht },
    // Left wall.
    { cx: -hw + ht, cz: 0, hx: ht, hz: hd },
    // Right wall.
    { cx: hw - ht, cz: 0, hx: ht, hz: hd },
    // Front wall, split by the doorway gap.
    { cx: -segCx, cz: hd - ht, hx: segHx, hz: ht },
    { cx: segCx, cz: hd - ht, hx: segHx, hz: ht },
  ];
}

const WALLS = buildWalls();

export const STORE_COLLIDERS: BuildingCollider[] = getBuildingTransforms().map((b) => ({
  ...b,
  walls: WALLS,
}));

export const STORE_TRIGGERS: StoreTrigger[] = getBuildingTransforms().map((b) => {
  const { depth: D, doorWidth: dw } = LAYOUT;
  const hd = D / 2;
  return {
    ...b,
    storeId: b.store.id,
    // A box just inside the doorway.
    rect: { cx: 0, cz: hd - 1.4, hx: dw / 2, hz: 1.2 },
  };
});
