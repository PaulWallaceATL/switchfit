"use client";

import { useEffect, useState } from "react";

/** A one-time controls hint that fades after the player gets going. */
export function ControlsHint() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`pointer-events-none absolute bottom-4 left-1/2 z-0 -translate-x-1/2 transition-opacity duration-700 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex items-center gap-3 rounded-full border border-white/10 bg-zinc-900/60 px-4 py-2 text-xs text-white/70 backdrop-blur-md">
        <span><kbd className="font-semibold text-white">WASD</kbd> move</span>
        <span className="text-white/20">•</span>
        <span><kbd className="font-semibold text-white">Shift</kbd> run</span>
        <span className="text-white/20">•</span>
        <span><kbd className="font-semibold text-white">E</kbd> interact</span>
        <span className="text-white/20">•</span>
        <span><kbd className="font-semibold text-white">Space</kbd> jump</span>
      </div>
    </div>
  );
}
