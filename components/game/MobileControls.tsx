"use client";

import { useRef, useState } from "react";
import type { MutableRefObject, PointerEvent as ReactPointerEvent } from "react";
import { ChevronUp, Zap } from "lucide-react";
import type { InputState } from "@/components/game/input";

const MAX_RADIUS = 46;

/**
 * Touch controls: a left-thumb joystick that drives forward/strafe, a jump
 * button, and a run toggle. All writes go into the shared input ref so the
 * Player treats them identically to keyboard input.
 */
export function MobileControls({ inputRef }: { inputRef: MutableRefObject<InputState> }) {
  const baseRef = useRef<HTMLDivElement>(null);
  const pointerId = useRef<number | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const [running, setRunning] = useState(false);

  const updateFromPointer = (e: ReactPointerEvent<HTMLDivElement>) => {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = e.clientX - cx;
    let dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > MAX_RADIUS) {
      dx *= MAX_RADIUS / dist;
      dy *= MAX_RADIUS / dist;
    }
    setKnob({ x: dx, y: dy });
    inputRef.current.forward = -dy / MAX_RADIUS;
    inputRef.current.right = dx / MAX_RADIUS;
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointerId.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromPointer(e);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== e.pointerId) return;
    updateFromPointer(e);
  };

  const release = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== e.pointerId) return;
    pointerId.current = null;
    setKnob({ x: 0, y: 0 });
    inputRef.current.forward = 0;
    inputRef.current.right = 0;
  };

  const toggleRun = () => {
    setRunning((prev) => {
      const next = !prev;
      inputRef.current.run = next;
      return next;
    });
  };

  return (
    <div className="pointer-events-none absolute inset-0 select-none">
      {/* Joystick */}
      <div
        ref={baseRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={release}
        onPointerCancel={release}
        className="pointer-events-auto absolute bottom-8 left-8 flex h-32 w-32 touch-none items-center justify-center rounded-full border border-white/40 bg-white/20 backdrop-blur-sm"
      >
        <div
          className="h-14 w-14 rounded-full bg-white/80 shadow-md transition-transform"
          style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
        />
      </div>

      {/* Action buttons */}
      <div className="pointer-events-none absolute bottom-8 right-8 flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={toggleRun}
          className={`pointer-events-auto flex h-16 w-16 touch-none flex-col items-center justify-center rounded-full border text-[10px] font-semibold shadow-md backdrop-blur-sm transition-colors ${
            running
              ? "border-indigo-300 bg-indigo-500/80 text-white"
              : "border-white/40 bg-white/30 text-zinc-800"
          }`}
        >
          <Zap className="h-5 w-5" />
          RUN
        </button>
        <button
          type="button"
          onPointerDown={() => {
            inputRef.current.jumpQueued = true;
          }}
          className="pointer-events-auto flex h-20 w-20 touch-none flex-col items-center justify-center rounded-full border border-white/40 bg-white/40 text-xs font-semibold text-zinc-800 shadow-md backdrop-blur-sm active:scale-95"
        >
          <ChevronUp className="h-6 w-6" />
          JUMP
        </button>
      </div>
    </div>
  );
}
