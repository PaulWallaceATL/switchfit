"use client";

import { useRef } from "react";
import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Mannequin } from "@/components/Mannequin";
import type { InputState } from "@/components/game/input";
import { interiorZoneAt, resolveColliders } from "@/components/game/collision";
import { playerHeading, playerPosition } from "@/components/game/playerState";
import { useGameStore } from "@/lib/game/store";
import { useSelectedItems } from "@/lib/game/selectors";

const PLAYER_RADIUS = 0.35;

const WALK_SPEED = 4.4;
const RUN_SPEED = 9;
const ACCEL = 14;
const GRAVITY = 18;
const JUMP_VELOCITY = 6.2;
const TURN_RATE = 13;

const CAM_DISTANCE = 3.6;
const CAM_DISTANCE_INDOOR = 2.6;
const CAM_TARGET_Y = 1.35;
const CAM_LERP = 6;
const CAM_DIST_LERP = 3;
// Look controls (WASD): how fast the camera yaws/pitches, in rad/sec.
const LOOK_YAW_RATE = 2.3;
const LOOK_PITCH_RATE = 1.9;
const PITCH_MIN = -0.5;
const PITCH_MAX = 1.0;

export interface PlayerMotion {
  moving: boolean;
  speed: number;
}

interface PlayerProps {
  inputRef: MutableRefObject<InputState>;
}

/** Returns `a` rotated toward `b` by fraction `t`, taking the shortest path. */
function lerpAngle(a: number, b: number, t: number): number {
  let diff = b - a;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}

/**
 * Third-person character controller. Integrates movement, jumping and a
 * camera-relative heading every frame, drives a trailing follow camera, and
 * publishes the player's live transform to {@link playerPosition} for other
 * systems (WorldSync, NPCManager). Avatar appearance is read from the store.
 */
export function Player({ inputRef }: PlayerProps) {
  const measurements = useGameStore((s) => s.measurements);
  const gender = useGameStore((s) => s.gender);
  const skinTone = useGameStore((s) => s.skinTone);
  const selectedItems = useSelectedItems();

  const group = useRef<THREE.Group>(null);
  const pos = useRef(new THREE.Vector3(0, 0, 0));
  const heading = useRef(Math.PI);
  const camYaw = useRef(Math.PI);
  const camPitch = useRef(0.08);
  const vy = useRef(0);
  const speed = useRef(0);
  const motion = useRef<PlayerMotion>({ moving: false, speed: 0 });
  const scratch = useRef(new THREE.Vector3());
  const camDistance = useRef(CAM_DISTANCE);

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const input = inputRef.current;

    // WASD aims the camera (yaw + pitch); arrows move the avatar.
    camYaw.current += input.lookYaw * LOOK_YAW_RATE * dt;
    camPitch.current = Math.max(
      PITCH_MIN,
      Math.min(PITCH_MAX, camPitch.current + input.lookPitch * LOOK_PITCH_RATE * dt),
    );

    let fwd = input.forward;
    let strafe = input.right;
    const mag = Math.hypot(fwd, strafe);
    const moving = mag > 0.08;
    if (mag > 1) {
      fwd /= mag;
      strafe /= mag;
    }

    // Build a movement direction relative to where the camera is pointing.
    // Strafe uses the left-hand perpendicular so pressing left actually goes left.
    const cy = camYaw.current;
    const moveX = Math.sin(cy) * fwd - Math.cos(cy) * strafe;
    const moveZ = Math.cos(cy) * fwd + Math.sin(cy) * strafe;

    let targetSpeed = 0;
    if (moving) {
      const len = Math.hypot(moveX, moveZ) || 1;
      const targetHeading = Math.atan2(moveX / len, moveZ / len);
      heading.current = lerpAngle(heading.current, targetHeading, Math.min(1, dt * TURN_RATE));
      targetSpeed = (input.run ? RUN_SPEED : WALK_SPEED) * Math.min(1, mag);
    }

    speed.current += (targetSpeed - speed.current) * Math.min(1, dt * ACCEL);
    if (speed.current < 0.01) speed.current = 0;

    pos.current.x += Math.sin(heading.current) * speed.current * dt;
    pos.current.z += Math.cos(heading.current) * speed.current * dt;

    // Jump + gravity.
    const grounded = pos.current.y <= 1e-4 && vy.current <= 0;
    if (input.jumpQueued) {
      if (grounded) vy.current = JUMP_VELOCITY;
      input.jumpQueued = false;
    }
    vy.current -= GRAVITY * dt;
    pos.current.y += vy.current * dt;
    if (pos.current.y < 0) {
      pos.current.y = 0;
      vy.current = 0;
    }

    // Block the avatar against the storefront walls (doorways stay open).
    resolveColliders(pos.current, PLAYER_RADIUS);

    if (group.current) {
      group.current.position.copy(pos.current);
      group.current.rotation.y = heading.current;
    }

    motion.current.moving = speed.current > 0.05;
    motion.current.speed = speed.current;

    // Publish the live transform for other game systems.
    playerPosition.copy(pos.current);
    playerHeading.value = heading.current;

    // Orbit follow camera driven by the manual yaw/pitch from WASD. Pitch lowers
    // the camera so the view tilts up toward the ceiling / sky.
    const inside = interiorZoneAt(pos.current) !== null;
    const targetDist = inside ? CAM_DISTANCE_INDOOR : CAM_DISTANCE;
    camDistance.current += (targetDist - camDistance.current) * Math.min(1, dt * CAM_DIST_LERP);
    const ccy = camYaw.current;
    const cp = camPitch.current;
    const horiz = camDistance.current * Math.cos(cp);
    const vert = camDistance.current * Math.sin(cp);
    const targetY = pos.current.y + CAM_TARGET_Y;
    const desired = scratch.current.set(
      pos.current.x - Math.sin(ccy) * horiz,
      Math.max(0.35, targetY - vert),
      pos.current.z - Math.cos(ccy) * horiz,
    );
    state.camera.position.lerp(desired, Math.min(1, dt * CAM_LERP));
    state.camera.lookAt(pos.current.x, targetY, pos.current.z);
  });

  return (
    <group ref={group}>
      <Mannequin
        measurements={measurements}
        selectedItems={selectedItems}
        gender={gender}
        skinTone={skinTone}
        motionRef={motion}
      />
    </group>
  );
}
