"use client";

import { useEffect, useState } from "react";
import type { MutableRefObject } from "react";

/**
 * Shared, mutable input state. Both the keyboard listener and the on-screen
 * touch controls write into the same object; the Player reads it every frame.
 * Using a plain mutable object (not React state) avoids re-rendering 60×/sec.
 */
export interface InputState {
  /** -1 (back) … 1 (forward) */
  forward: number;
  /** -1 (left) … 1 (right) */
  right: number;
  /** Sprint modifier. */
  run: boolean;
  /** Set true on a jump press; the Player consumes (resets) it. */
  jumpQueued: boolean;
  /** Set true on an interact (E) press; the consumer resets it. */
  interactQueued: boolean;
}

export function createInputState(): InputState {
  return { forward: 0, right: 0, run: false, jumpQueued: false, interactQueued: false };
}

const MOVE_CODES = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Space",
]);

function isFormElement(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT" ||
      target.isContentEditable)
  );
}

/** Wires WASD/arrows + Shift (run) + Space (jump) into the shared input ref. */
export function useKeyboardControls(inputRef: MutableRefObject<InputState>) {
  useEffect(() => {
    const pressed = new Set<string>();

    const recompute = () => {
      const i = inputRef.current;
      const fwd = pressed.has("KeyW") || pressed.has("ArrowUp") ? 1 : 0;
      const back = pressed.has("KeyS") || pressed.has("ArrowDown") ? 1 : 0;
      const rt = pressed.has("KeyD") || pressed.has("ArrowRight") ? 1 : 0;
      const lf = pressed.has("KeyA") || pressed.has("ArrowLeft") ? 1 : 0;
      i.forward = fwd - back;
      i.right = rt - lf;
      i.run = pressed.has("ShiftLeft") || pressed.has("ShiftRight");
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // Don't hijack typing or slider/keyboard interaction in the sidebar.
      if (isFormElement(e.target)) return;
      if (MOVE_CODES.has(e.code)) e.preventDefault();
      if (e.code === "Space") {
        inputRef.current.jumpQueued = true;
        return;
      }
      if (e.code === "KeyE") {
        inputRef.current.interactQueued = true;
        return;
      }
      if (!pressed.has(e.code)) {
        pressed.add(e.code);
        recompute();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      pressed.delete(e.code);
      recompute();
    };

    // Stop "stuck keys" when focus leaves the window.
    const onBlur = () => {
      pressed.clear();
      recompute();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [inputRef]);
}

/** True on touch/coarse-pointer devices, so we can show the on-screen controls. */
export function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    setCoarse(mq.matches);
    const handler = (e: MediaQueryListEvent) => setCoarse(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  return coarse;
}
