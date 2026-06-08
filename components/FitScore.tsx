"use client";

import { useMemo } from "react";
import { TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { Measurements } from "@/lib/measurements";
import { getFitScore, type FitTone } from "@/lib/fitLogic";

interface FitScoreProps {
  measurements: Measurements;
  /** Whether the measurements came from a scan (affects the caption). */
  scanned?: boolean;
}

const TONE: Record<FitTone, { ring: string; bar: string; chip: string; label: string }> = {
  great: {
    ring: "border-emerald-300 bg-emerald-50",
    bar: "bg-emerald-500",
    chip: "bg-emerald-600 text-white",
    label: "text-emerald-700",
  },
  good: {
    ring: "border-sky-300 bg-sky-50",
    bar: "bg-sky-500",
    chip: "bg-sky-600 text-white",
    label: "text-sky-700",
  },
  fair: {
    ring: "border-amber-300 bg-amber-50",
    bar: "bg-amber-500",
    chip: "bg-amber-600 text-white",
    label: "text-amber-700",
  },
};

export function FitScore({ measurements, scanned = false }: FitScoreProps) {
  const result = useMemo(() => getFitScore(measurements), [measurements]);
  const tone = TONE[result.tone];

  return (
    <div className={`rounded-xl border p-4 ${tone.ring}`}>
      <div className="flex items-center justify-between">
        <span className={`flex items-center gap-1.5 text-sm font-medium ${tone.label}`}>
          <TrendingUp className="h-4 w-4" />
          {result.matchPercentage}% Match
        </span>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone.chip}`}>
          Size {result.recommendedSize}
        </span>
      </div>

      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/70">
        <div
          className={`h-full rounded-full transition-all duration-500 ${tone.bar}`}
          style={{ width: `${result.matchPercentage}%` }}
        />
      </div>

      <p className="mt-1 text-xs text-zinc-500">
        Recommended Size: <span className="font-semibold text-zinc-700">{result.recommendedSize}</span>
        {scanned ? " • from AI scan" : " • from manual measurements"}
      </p>

      <ul className="mt-3 flex flex-col gap-1.5">
        {result.notes.map((note, i) => (
          <li key={`${note.part}-${i}`} className="flex items-center gap-2 text-sm text-zinc-700">
            {note.direction === "neutral" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
            )}
            {note.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
