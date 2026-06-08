"use client";

import { Ruler, RotateCcw, Shirt, Check, ScanLine, User, X } from "lucide-react";
import { MEASUREMENT_RANGES, WARDROBE } from "@/lib/measurements";
import { SKIN_TONES, type Gender } from "@/lib/body";
import { FitScore } from "@/components/FitScore";
import { useGameStore } from "@/lib/game/store";

const GENDERS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

/**
 * In-world avatar customization, surfaced in the Fitting Room. Migrated from the
 * old left Sidebar; reads and writes the avatar slice directly.
 */
export function CharacterPanel() {
  const open = useGameStore((s) => s.openPanel === "character");
  const closePanel = useGameStore((s) => s.closePanel);
  const measurements = useGameStore((s) => s.measurements);
  const selectedIds = useGameStore((s) => s.selectedIds);
  const scanned = useGameStore((s) => s.scanned);
  const gender = useGameStore((s) => s.gender);
  const skinTone = useGameStore((s) => s.skinTone);
  const setMeasurement = useGameStore((s) => s.setMeasurement);
  const toggleItem = useGameStore((s) => s.toggleItem);
  const setGender = useGameStore((s) => s.setGender);
  const setSkinTone = useGameStore((s) => s.setSkinTone);
  const resetAvatar = useGameStore((s) => s.resetAvatar);
  const setScanner = useGameStore((s) => s.setScanner);

  if (!open) return null;

  return (
    <div className="pointer-events-auto absolute inset-0 z-30">
      <div className="animate-backdrop-in absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={closePanel} />
      <aside className="animate-drawer-in absolute left-0 top-0 flex h-full w-full max-w-sm flex-col gap-6 overflow-y-auto border-r border-white/10 bg-zinc-950 p-6 text-white shadow-2xl">
        <header className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <h1 className="text-lg font-semibold tracking-tight">Your Look</h1>
          </div>
          <button
            type="button"
            onClick={closePanel}
            aria-label="Close"
            className="press rounded-md p-1 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <button
          type="button"
          onClick={() => setScanner(true)}
          className="press flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:from-indigo-500 hover:to-violet-500"
        >
          <ScanLine className="h-4 w-4" />
          Start AI Scan
        </button>

        {/* Appearance */}
        <section className="flex flex-col gap-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white/70">
            <User className="h-4 w-4" />
            Appearance
          </h2>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-white/50">Body type</span>
            <div className="grid grid-cols-2 gap-2">
              {GENDERS.map((g) => {
                const active = gender === g.value;
                return (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGender(g.value)}
                    className={`press rounded-lg border px-3 py-2 text-sm font-medium ${
                      active ? "border-white bg-white text-zinc-900" : "border-white/15 bg-white/5 text-white hover:border-white/40"
                    }`}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-white/50">Skin tone</span>
            <div className="flex flex-wrap gap-2">
              {SKIN_TONES.map((tone) => {
                const active = skinTone === tone.color;
                return (
                  <button
                    key={tone.id}
                    type="button"
                    title={tone.label}
                    aria-label={tone.label}
                    onClick={() => setSkinTone(tone.color)}
                    style={{ backgroundColor: tone.color }}
                    className={`press h-8 w-8 rounded-full hover:scale-110 ${
                      active ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-zinc-950" : "ring-1 ring-white/20 hover:ring-white/50"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </section>

        {/* Measurements */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white/70">
              <Ruler className="h-4 w-4" />
              Measurements
            </h2>
            <button
              type="button"
              onClick={resetAvatar}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
          <div className="flex flex-col gap-5">
            {MEASUREMENT_RANGES.map((range) => (
              <div key={range.key} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <label htmlFor={range.key} className="font-medium text-white/80">{range.label}</label>
                  <span className="tabular-nums font-semibold text-white">
                    {measurements[range.key]}
                    <span className="ml-1 text-xs font-normal text-white/40">{range.unit}</span>
                  </span>
                </div>
                <input
                  id={range.key}
                  type="range"
                  min={range.min}
                  max={range.max}
                  step={range.step}
                  value={measurements[range.key]}
                  onChange={(e) => setMeasurement(range.key, Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-indigo-400"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Wardrobe */}
        <section className="flex flex-col gap-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white/70">
            <Shirt className="h-4 w-4" />
            Wardrobe
          </h2>
          <FitScore measurements={measurements} scanned={scanned} />
          <div className="grid grid-cols-2 gap-3">
            {WARDROBE.map((item) => {
              const active = selectedIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleItem(item)}
                  className={`press relative flex flex-col items-start gap-2 rounded-xl border p-3 text-left hover:-translate-y-0.5 ${
                    active ? "border-white bg-white text-zinc-900 shadow-md" : "border-white/15 bg-white/5 text-white hover:border-white/40"
                  }`}
                >
                  <span className="h-8 w-8 rounded-full border border-black/10" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-medium leading-tight">{item.name}</span>
                  <span className="text-xs capitalize opacity-70">{item.type}</span>
                  {active && (
                    <span className="animate-pop-in absolute right-2 top-2 rounded-full bg-zinc-900 p-0.5 text-white">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </aside>
    </div>
  );
}
