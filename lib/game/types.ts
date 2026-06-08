/**
 * Shared types for the Shopping Mall World game layer. Kept dependency-free so
 * both the Zustand store slices and the 3D/HUD components can import them.
 */

/** A point on the mall floor plane (XZ, world units). */
export interface Vec2 {
  x: number;
  z: number;
}

/** Visual/behavioural theme of a zone. Drives which interior template loads. */
export type ZoneKind =
  | "plaza"
  | "boutique"
  | "streetwear"
  | "food-court"
  | "fitting-room"
  | "generic";

export type ZoneId = string;

/**
 * A logical area of the mall. The plaza is the open central concourse; every
 * other zone is a shop interior anchored at its building's footprint.
 */
export interface Zone {
  id: ZoneId;
  kind: ZoneKind;
  label: string;
  tagline: string;
  /** Facade / theme color. */
  color: string;
  /** Sign / trim accent color. */
  accent: string;
  /** World center of the building footprint (interior anchor). */
  center: [number, number];
  /** Y rotation of the building so its doorway faces the plaza. */
  rotationY: number;
}

/** NPC behaviour states for the simple per-character state machine. */
export type NpcState = "idle" | "greet" | "interact";

export type NpcArchetype = "stylist" | "tech" | "security";

export type NpcId = string;

export type DialogueNodeId = string;

/** Side effects a dialogue choice can trigger in the game world. */
export type DialogueAction =
  | { type: "end" }
  | { type: "goto"; node: DialogueNodeId }
  | { type: "openPanel"; panel: HudPanel }
  | { type: "startScan" }
  | { type: "toggleMap" }
  | { type: "grantCredits"; amount: number };

export interface DialogueChoice {
  label: string;
  action: DialogueAction;
}

export interface DialogueNode {
  id: DialogueNodeId;
  text: string;
  choices: DialogueChoice[];
}

export interface DialogueTree {
  /** Entry node id. */
  start: DialogueNodeId;
  nodes: Record<DialogueNodeId, DialogueNode>;
}

/** Which full-screen-ish HUD panel is currently open. */
export type HudPanel = "none" | "inventory" | "character" | "map";

export interface ContextualPrompt {
  /** Human text, e.g. "Talk to Fiona". */
  text: string;
  /** Key cap to show, e.g. "E". Omit for click prompts. */
  key?: string;
}
