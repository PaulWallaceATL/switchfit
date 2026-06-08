import type * as THREE from "three";
import {
  STORE_COLLIDERS,
  STORE_TRIGGERS,
  type WallRect,
} from "@/lib/stores";
import { PODIUMS } from "@/lib/catalog";

/** How close (world units) the avatar must be to a podium to inspect a product. */
const PRODUCT_REACH = 2.4;

/**
 * Transforms a world XZ point into a building's local frame (inverse of the
 * group's Y rotation about its center).
 */
function toLocal(
  px: number,
  pz: number,
  cx: number,
  cz: number,
  ry: number,
): [number, number] {
  const dx = px - cx;
  const dz = pz - cz;
  const cos = Math.cos(ry);
  const sin = Math.sin(ry);
  const lx = dx * cos - dz * sin;
  const lz = dx * sin + dz * cos;
  return [lx, lz];
}

/** Rotates a local XZ displacement back into world space. */
function toWorldDelta(lx: number, lz: number, ry: number): [number, number] {
  const cos = Math.cos(ry);
  const sin = Math.sin(ry);
  const wx = lx * cos + lz * sin;
  const wz = -lx * sin + lz * cos;
  return [wx, wz];
}

/**
 * Pushes the player's circle out of a single wall rectangle (axis-aligned in
 * the building's local frame). Returns the corrected local position, or null
 * if there was no overlap.
 */
function resolveRect(
  lx: number,
  lz: number,
  radius: number,
  rect: WallRect,
): [number, number] | null {
  const minX = rect.cx - rect.hx - radius;
  const maxX = rect.cx + rect.hx + radius;
  const minZ = rect.cz - rect.hz - radius;
  const maxZ = rect.cz + rect.hz + radius;

  if (lx <= minX || lx >= maxX || lz <= minZ || lz >= maxZ) return null;

  // Inside the inflated rect: push out along the axis of least penetration.
  const penLeft = lx - minX;
  const penRight = maxX - lx;
  const penDown = lz - minZ;
  const penUp = maxZ - lz;
  const minPen = Math.min(penLeft, penRight, penDown, penUp);

  if (minPen === penLeft) return [minX, lz];
  if (minPen === penRight) return [maxX, lz];
  if (minPen === penDown) return [lx, minZ];
  return [lx, maxZ];
}

/**
 * Resolves the player position against every building wall, mutating `pos`
 * in place. The player is treated as a vertical cylinder of the given radius.
 */
export function resolveColliders(pos: THREE.Vector3, radius: number): void {
  for (const building of STORE_COLLIDERS) {
    const [cx, cz] = building.center;
    const ry = building.rotationY;
    let [lx, lz] = toLocal(pos.x, pos.z, cx, cz, ry);

    for (const wall of building.walls) {
      const corrected = resolveRect(lx, lz, radius, wall);
      if (corrected) {
        [lx, lz] = corrected;
      }
    }

    const [wx, wz] = toWorldDelta(lx, lz, ry);
    pos.x = cx + wx;
    pos.z = cz + wz;
  }
}

/** Returns the id of the closest product podium within reach, or null. */
export function nearestProduct(pos: THREE.Vector3): string | null {
  let closest: string | null = null;
  let bestDist = PRODUCT_REACH * PRODUCT_REACH;
  for (const podium of PODIUMS) {
    const dx = pos.x - podium.world[0];
    const dz = pos.z - podium.world[1];
    const distSq = dx * dx + dz * dz;
    if (distSq < bestDist) {
      bestDist = distSq;
      closest = podium.product.id;
    }
  }
  return closest;
}

/** Returns the id of the store whose doorway trigger contains the point, if any. */
export function storeAtPoint(pos: THREE.Vector3): string | null {
  for (const trigger of STORE_TRIGGERS) {
    const [cx, cz] = trigger.center;
    const [lx, lz] = toLocal(pos.x, pos.z, cx, cz, trigger.rotationY);
    const { rect } = trigger;
    if (
      lx >= rect.cx - rect.hx &&
      lx <= rect.cx + rect.hx &&
      lz >= rect.cz - rect.hz &&
      lz <= rect.cz + rect.hz
    ) {
      return trigger.storeId;
    }
  }
  return null;
}
