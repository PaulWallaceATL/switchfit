"use client";

import { useMemo, useRef } from "react";
import type { MutableRefObject, ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getBodyScale, type Measurements, type WardrobeItem } from "@/lib/measurements";
import { buildTorsoProfile, getBodyDims, HAIR_COLOR, type Gender } from "@/lib/body";
import type { PlayerMotion } from "@/components/game/Player";

interface MannequinProps {
  measurements: Measurements;
  selectedItems: WardrobeItem[];
  gender: Gender;
  skinTone: string;
  /** Locomotion data driving the walk/run animation (optional for static use). */
  motionRef?: MutableRefObject<PlayerMotion>;
}

/**
 * Upper-arm segment, pivoting at the shoulder (local origin). A nested forearm
 * group pivots at the elbow so the arm can bend naturally while walking.
 * Garment sleeves are passed in as children so they swing with the limb.
 */
function Arm({
  radius,
  mat,
  forearmRef,
  sleeve,
  longSleeve,
}: {
  radius: number;
  mat: THREE.Material;
  forearmRef: React.Ref<THREE.Group>;
  sleeve?: ReactNode;
  longSleeve?: ReactNode;
}) {
  return (
    <>
      {/* Deltoid / shoulder cap */}
      <mesh material={mat} castShadow>
        <sphereGeometry args={[radius * 1.12, 24, 24]} />
      </mesh>
      {/* Upper arm */}
      <mesh position={[0, -0.16, 0]} material={mat} castShadow>
        <cylinderGeometry args={[radius * 0.95, radius * 0.84, 0.3, 24]} />
      </mesh>
      {sleeve}

      {/* Forearm + hand, hinged at the elbow */}
      <group ref={forearmRef} position={[0, -0.32, 0]}>
        {/* Elbow */}
        <mesh material={mat} castShadow>
          <sphereGeometry args={[radius * 0.82, 20, 20]} />
        </mesh>
        {/* Forearm taper */}
        <mesh position={[0, -0.15, 0]} material={mat} castShadow>
          <cylinderGeometry args={[radius * 0.8, radius * 0.58, 0.3, 24]} />
        </mesh>
        {/* Wrist */}
        <mesh position={[0, -0.31, 0]} material={mat} castShadow>
          <sphereGeometry args={[radius * 0.52, 16, 16]} />
        </mesh>
        {/* Hand — a softly flattened, slightly forward-tilted mass */}
        <mesh
          position={[0, -0.4, 0.015]}
          rotation={[0.15, 0, 0]}
          scale={[0.92, 1.5, 0.62]}
          material={mat}
          castShadow
        >
          <sphereGeometry args={[radius * 0.74, 18, 18]} />
        </mesh>
        {longSleeve}
      </group>
    </>
  );
}

/**
 * Thigh segment pivoting at the hip (local origin), with a shin group hinged at
 * the knee and a rounded shoe at the ankle. Trouser pieces are passed as
 * children so they track the leg's motion.
 */
function Leg({
  radius,
  mat,
  shoeMat,
  shinRef,
  thighCover,
  shinCover,
}: {
  radius: number;
  mat: THREE.Material;
  shoeMat: THREE.Material;
  shinRef: React.Ref<THREE.Group>;
  thighCover?: ReactNode;
  shinCover?: ReactNode;
}) {
  return (
    <>
      {/* Thigh */}
      <mesh position={[0, -0.2, 0]} material={mat} castShadow>
        <cylinderGeometry args={[radius * 1.04, radius * 0.82, 0.42, 24]} />
      </mesh>
      {thighCover}

      {/* Knee + shin + foot, hinged at the knee */}
      <group ref={shinRef} position={[0, -0.42, 0]}>
        {/* Knee */}
        <mesh material={mat} castShadow>
          <sphereGeometry args={[radius * 0.72, 20, 20]} />
        </mesh>
        {/* Calf → ankle */}
        <mesh position={[0, -0.2, 0]} material={mat} castShadow>
          <cylinderGeometry args={[radius * 0.82, radius * 0.5, 0.4, 24]} />
        </mesh>
        {/* Ankle */}
        <mesh position={[0, -0.4, 0]} material={mat} castShadow>
          <sphereGeometry args={[radius * 0.4, 16, 16]} />
        </mesh>
        {/* Rounded shoe: heel + toe instead of a flat box */}
        <group position={[0, -0.45, 0.03]}>
          <mesh position={[0, 0, 0.05]} scale={[1, 0.55, 1.7]} material={shoeMat} castShadow>
            <sphereGeometry args={[radius * 0.92, 20, 16]} />
          </mesh>
          <mesh position={[0, 0.02, -0.06]} scale={[0.92, 0.7, 0.8]} material={shoeMat} castShadow>
            <sphereGeometry args={[radius * 0.78, 16, 14]} />
          </mesh>
        </group>
        {shinCover}
      </group>
    </>
  );
}

export function Mannequin({
  measurements,
  selectedItems,
  gender,
  skinTone,
  motionRef,
}: MannequinProps) {
  const scale = useMemo(() => getBodyScale(measurements), [measurements]);
  const dims = useMemo(() => getBodyDims(scale, gender), [scale, gender]);
  const profile = useMemo(() => buildTorsoProfile(scale, gender), [scale, gender]);

  // Only one garment of each type is ever worn at once.
  const shirt = useMemo(() => selectedItems.find((i) => i.type === "shirt"), [selectedItems]);
  const pants = useMemo(() => selectedItems.find((i) => i.type === "pants"), [selectedItems]);

  const skinMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: skinTone,
        roughness: 0.62,
        metalness: 0,
        // A soft sheen + faint clearcoat reads as living skin, not matte clay.
        sheen: 0.4,
        sheenColor: new THREE.Color("#ff9d7a"),
        sheenRoughness: 0.7,
        clearcoat: 0.12,
        clearcoatRoughness: 0.55,
      }),
    [skinTone],
  );
  const lipMat = useMemo(() => {
    const base = new THREE.Color(skinTone);
    const hsl = { h: 0, s: 0, l: 0 };
    base.getHSL(hsl);
    const lip = new THREE.Color().setHSL(0.02, Math.min(0.55, hsl.s + 0.3), Math.max(0.32, hsl.l - 0.12));
    return new THREE.MeshStandardMaterial({ color: lip, roughness: 0.45 });
  }, [skinTone]);
  const hairMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: HAIR_COLOR, roughness: 0.78, metalness: 0.08 }),
    [],
  );
  const eyeWhiteMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#f6f3ee", roughness: 0.25 }),
    [],
  );
  const irisMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#4a342a", roughness: 0.3, metalness: 0.1 }),
    [],
  );
  const pupilMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#120b08", roughness: 0.2 }),
    [],
  );
  const shoeMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#2b2722", roughness: 0.55, metalness: 0.1 }),
    [],
  );
  const shirtMat = useMemo(
    () =>
      shirt
        ? new THREE.MeshStandardMaterial({ color: shirt.color, roughness: 0.78, metalness: 0.02 })
        : null,
    [shirt?.color],
  );
  const pantsMat = useMemo(
    () =>
      pants
        ? new THREE.MeshStandardMaterial({ color: pants.color, roughness: 0.8, metalness: 0.02 })
        : null,
    [pants?.color],
  );

  const body = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const leftForearm = useRef<THREE.Group>(null);
  const rightForearm = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const leftShin = useRef<THREE.Group>(null);
  const rightShin = useRef<THREE.Group>(null);
  const phase = useRef(0);
  const amplitude = useRef(0);
  const lean = useRef(0);

  // Procedural gait + idle motion. Limbs swing in opposition; the body bobs and
  // leans with speed; at rest the chest breathes and the avatar shifts weight.
  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const t = state.clock.elapsedTime;
    const m = motionRef?.current;
    const moving = !!m?.moving;
    const speed = m?.speed ?? 0;

    phase.current += dt * (moving ? 4 + speed * 0.9 : 0);
    const target = moving ? Math.min(0.62, 0.2 + speed * 0.05) : 0;
    amplitude.current += (target - amplitude.current) * Math.min(1, dt * 8);
    const amp = amplitude.current;
    const targetLean = moving ? Math.min(speed / 9, 1) * 0.09 : 0;
    lean.current += (targetLean - lean.current) * Math.min(1, dt * 6);

    const swing = Math.sin(phase.current) * amp;
    // A little idle sway so a standing avatar never reads as frozen.
    const idle = (1 - Math.min(amp / 0.18, 1)) * Math.sin(t * 1.1) * 0.04;

    if (leftArm.current) leftArm.current.rotation.x = swing + idle;
    if (rightArm.current) rightArm.current.rotation.x = -swing - idle;
    // Forearms keep a relaxed bend and tuck a touch more on the forward swing.
    const elbow = 0.22 + amp * 0.25;
    if (leftForearm.current) leftForearm.current.rotation.x = elbow + Math.max(0, swing) * 0.5;
    if (rightForearm.current) rightForearm.current.rotation.x = elbow + Math.max(0, -swing) * 0.5;

    if (leftLeg.current) leftLeg.current.rotation.x = -swing;
    if (rightLeg.current) rightLeg.current.rotation.x = swing;
    // Knees bend through the swing-forward phase so feet lift instead of sliding.
    const kneeAmt = amp * 1.5;
    if (leftShin.current) leftShin.current.rotation.x = Math.max(0, -Math.sin(phase.current)) * kneeAmt;
    if (rightShin.current) rightShin.current.rotation.x = Math.max(0, Math.sin(phase.current)) * kneeAmt;

    if (body.current) {
      body.current.position.y = Math.abs(Math.sin(phase.current)) * amp * 0.06;
      body.current.rotation.x = lean.current;
      body.current.rotation.z = Math.sin(phase.current) * amp * 0.03 + idle * 0.4;
    }
    if (torso.current) {
      const breathe = 1 + (1 - Math.min(amp / 0.2, 1)) * Math.sin(t * 1.6) * 0.012;
      torso.current.scale.y = breathe;
    }
    if (head.current) {
      head.current.rotation.z = -Math.sin(phase.current) * amp * 0.03;
      head.current.rotation.y = idle * 0.6;
    }
  });

  return (
    <group scale={[1, scale.height, 1]} position={[0, 0, 0]}>
      <group ref={body}>
        {/* Torso: a smooth revolved silhouette, flattened front-to-back. */}
        <group ref={torso}>
          <mesh scale={[1, 1, dims.depth]} material={skinMat} castShadow receiveShadow>
            <latheGeometry args={[profile, 64]} />
          </mesh>

          {/* Bust (female) */}
          {dims.bust > 0 &&
            [-1, 1].map((side) => (
              <mesh
                key={`bust-${side}`}
                position={[side * 0.062, 1.31, 0.082]}
                scale={[1.15, 0.95, 0.78]}
                material={skinMat}
                castShadow
              >
                <sphereGeometry args={[0.057 * scale.chest, 20, 20]} />
              </mesh>
            ))}

          {/* Shirt shell over the torso (tracks chest + looseness). */}
          {shirt && shirtMat && (
            <group>
              <mesh position={[0, 1.24, 0.004]} scale={[1, 1, dims.depth * 1.04]} material={shirtMat} castShadow>
                <capsuleGeometry args={[0.176 * scale.chest * shirt.looseness, 0.4, 10, 28]} />
              </mesh>
              {/* Hem flares slightly so it reads as fabric, not paint. */}
              <mesh position={[0, 1.0, 0.004]} scale={[1, 1, dims.depth * 1.06]} material={shirtMat} castShadow>
                <cylinderGeometry
                  args={[
                    0.182 * scale.waist * shirt.looseness,
                    0.166 * scale.waist * shirt.looseness,
                    0.16,
                    28,
                  ]}
                />
              </mesh>
            </group>
          )}
        </group>

        {/* Seat / glutes */}
        {[-1, 1].map((side) => (
          <mesh
            key={`seat-${side}`}
            position={[side * 0.07, 0.93, -0.088]}
            scale={[1.1, 1, 0.92]}
            material={skinMat}
            castShadow
          >
            <sphereGeometry args={[0.072 * scale.hips * dims.seat, 20, 20]} />
          </mesh>
        ))}

        {/* Pelvis / hip band for pants. */}
        {pants && pantsMat && (
          <mesh position={[0, 0.93, 0]} scale={[1, 1, dims.depth * 1.05]} material={pantsMat} castShadow>
            <capsuleGeometry args={[0.158 * scale.hips * pants.looseness, 0.12, 10, 28]} />
          </mesh>
        )}

        {/* Arms (pivot at the shoulder so they swing while walking) */}
        <group ref={leftArm} position={[-dims.shoulderHalf, 1.47, 0]} rotation={[0, 0, 0.08]}>
          <Arm
            radius={dims.armRadius}
            mat={skinMat}
            forearmRef={leftForearm}
            sleeve={
              shirt && shirtMat ? (
                <mesh position={[0, -0.13, 0]} material={shirtMat} castShadow>
                  <capsuleGeometry
                    args={[dims.armRadius * 1.3 * shirt.looseness, shirt.looseness > 1.2 ? 0.18 : 0.22, 8, 18]}
                  />
                </mesh>
              ) : undefined
            }
            longSleeve={
              shirt && shirtMat && shirt.looseness > 1.2 ? (
                <mesh position={[0, -0.16, 0]} material={shirtMat} castShadow>
                  <capsuleGeometry args={[dims.armRadius * 1.18 * shirt.looseness, 0.26, 8, 18]} />
                </mesh>
              ) : undefined
            }
          />
        </group>
        <group ref={rightArm} position={[dims.shoulderHalf, 1.47, 0]} rotation={[0, 0, -0.08]}>
          <Arm
            radius={dims.armRadius}
            mat={skinMat}
            forearmRef={rightForearm}
            sleeve={
              shirt && shirtMat ? (
                <mesh position={[0, -0.13, 0]} material={shirtMat} castShadow>
                  <capsuleGeometry
                    args={[dims.armRadius * 1.3 * shirt.looseness, shirt.looseness > 1.2 ? 0.18 : 0.22, 8, 18]}
                  />
                </mesh>
              ) : undefined
            }
            longSleeve={
              shirt && shirtMat && shirt.looseness > 1.2 ? (
                <mesh position={[0, -0.16, 0]} material={shirtMat} castShadow>
                  <capsuleGeometry args={[dims.armRadius * 1.18 * shirt.looseness, 0.26, 8, 18]} />
                </mesh>
              ) : undefined
            }
          />
        </group>

        {/* Legs (pivot at the hip) */}
        <group ref={leftLeg} position={[-dims.hipHalf, 0.92, 0]} rotation={[0, 0, -0.02]}>
          <Leg
            radius={dims.legRadius}
            mat={skinMat}
            shoeMat={shoeMat}
            shinRef={leftShin}
            thighCover={
              pants && pantsMat ? (
                <mesh position={[0, -0.2, 0]} material={pantsMat} castShadow>
                  <capsuleGeometry args={[dims.legRadius * 1.18 * pants.looseness, 0.3, 8, 18]} />
                </mesh>
              ) : undefined
            }
            shinCover={
              pants && pantsMat ? (
                <mesh position={[0, -0.18, 0]} material={pantsMat} castShadow>
                  <capsuleGeometry args={[dims.legRadius * 1.08 * pants.looseness, 0.3, 8, 18]} />
                </mesh>
              ) : undefined
            }
          />
        </group>
        <group ref={rightLeg} position={[dims.hipHalf, 0.92, 0]} rotation={[0, 0, 0.02]}>
          <Leg
            radius={dims.legRadius}
            mat={skinMat}
            shoeMat={shoeMat}
            shinRef={rightShin}
            thighCover={
              pants && pantsMat ? (
                <mesh position={[0, -0.2, 0]} material={pantsMat} castShadow>
                  <capsuleGeometry args={[dims.legRadius * 1.18 * pants.looseness, 0.3, 8, 18]} />
                </mesh>
              ) : undefined
            }
            shinCover={
              pants && pantsMat ? (
                <mesh position={[0, -0.18, 0]} material={pantsMat} castShadow>
                  <capsuleGeometry args={[dims.legRadius * 1.08 * pants.looseness, 0.3, 8, 18]} />
                </mesh>
              ) : undefined
            }
          />
        </group>

        {/* Neck */}
        <mesh position={[0, 1.61, 0]} material={skinMat} castShadow>
          <cylinderGeometry args={[0.05, 0.064, 0.1, 24]} />
        </mesh>

        {/* Head */}
        <group ref={head} position={[0, 1.73, 0.004]}>
          <mesh material={skinMat} castShadow scale={[0.92, 1.08, 1]}>
            <sphereGeometry args={[0.112, 40, 40]} />
          </mesh>
          {/* Jaw / chin */}
          <mesh position={[0, -0.062, 0.012]} scale={[0.82, 0.74, 0.86]} material={skinMat} castShadow>
            <sphereGeometry args={[0.1, 28, 28]} />
          </mesh>
          {/* Nose */}
          <mesh position={[0, -0.012, 0.108]} scale={[0.7, 1.1, 0.9]} material={skinMat}>
            <sphereGeometry args={[0.02, 14, 14]} />
          </mesh>
          {/* Lips */}
          <mesh position={[0, -0.056, 0.1]} scale={[1.5, 0.5, 0.7]} material={lipMat}>
            <sphereGeometry args={[0.018, 16, 12]} />
          </mesh>
          {/* Ears */}
          {[-1, 1].map((side) => (
            <mesh
              key={`ear-${side}`}
              position={[side * 0.106, -0.004, 0.008]}
              scale={[0.5, 1, 0.72]}
              rotation={[0, side * 0.3, 0]}
              material={skinMat}
              castShadow
            >
              <sphereGeometry args={[0.028, 16, 16]} />
            </mesh>
          ))}
          {/* Eyes */}
          {[-1, 1].map((side) => (
            <group key={`eye-${side}`} position={[side * 0.042, 0.012, 0.094]}>
              <mesh material={eyeWhiteMat} scale={[1.25, 1, 0.7]}>
                <sphereGeometry args={[0.018, 16, 16]} />
              </mesh>
              <mesh position={[0, 0, 0.012]} material={irisMat}>
                <sphereGeometry args={[0.0095, 14, 14]} />
              </mesh>
              {/* Pupil */}
              <mesh position={[0, 0, 0.017]} material={pupilMat}>
                <sphereGeometry args={[0.0048, 12, 12]} />
              </mesh>
              {/* Upper lid for a softer, less wide-eyed look */}
              <mesh position={[0, 0.012, 0.01]} scale={[1.3, 0.5, 0.8]} material={skinMat}>
                <sphereGeometry args={[0.016, 16, 12]} />
              </mesh>
              {/* Brow */}
              <mesh position={[0, 0.026, 0.004]} rotation={[0, 0, side * -0.12]} material={hairMat}>
                <boxGeometry args={[0.034, 0.007, 0.012]} />
              </mesh>
            </group>
          ))}
          {/* Hair cap — sits above the forehead so the face stays clear */}
          <mesh position={[0, 0.03, -0.02]} scale={[1.04, 1.02, 1.08]} material={hairMat} castShadow>
            <sphereGeometry args={[0.118, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          </mesh>
          {/* Longer hair mass falling behind the head for the female silhouette */}
          {gender === "female" && (
            <mesh position={[0, -0.07, -0.055]} scale={[0.86, 1.3, 0.62]} material={hairMat} castShadow>
              <sphereGeometry args={[0.108, 28, 28]} />
            </mesh>
          )}
        </group>
      </group>
    </group>
  );
}
