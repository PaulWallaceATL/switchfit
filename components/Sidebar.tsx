"use client";

import Link from "next/link";
import { Ruler, RotateCcw, Shirt, Check, ScanLine, LogIn, LogOut } from "lucide-react";
import {
  MEASUREMENT_RANGES,
  WARDROBE,
  type MeasurementKey,
  type Measurements,
  type WardrobeItem,
} from "@/lib/measurements";
import { FitScore } from "@/components/FitScore";
import { useAuth } from "@/lib/auth/MockAuthProvider";

interface SidebarProps {
  measurements: Measurements;
  selectedIds: string[];
  scanned: boolean;
  onMeasurementChange: (key: MeasurementKey, value: number) => void;
  onToggleItem: (item: WardrobeItem) => void;
  onReset: () => void;
  onStartScan: () => void;
}

export function Sidebar({
  measurements,
  selectedIds,
  scanned,
  onMeasurementChange,
  onToggleItem,
  onReset,
  onStartScan,
}: SidebarProps) {
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-full w-full max-w-sm flex-col gap-6 overflow-y-auto border-r border-zinc-200 bg-white p-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">SwitchFit</h1>
          {user ? (
            <div className="flex items-center gap-2">
              <span className="max-w-[7rem] truncate text-xs font-medium text-zinc-500">
                {user.name}
              </span>
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              <LogIn className="h-3.5 w-3.5" />
              Sign in
            </Link>
          )}
        </div>
        <p className="text-sm text-zinc-500">
          Scan your body or adjust it manually, then try on the wardrobe.
        </p>
      </header>

      {/* AI Scan */}
      <button
        type="button"
        onClick={onStartScan}
        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:from-indigo-500 hover:to-violet-500"
      >
        <ScanLine className="h-4 w-4" />
        Start AI Scan
      </button>

      {/* Measurements */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-700">
            <Ruler className="h-4 w-4" />
            Measurements
          </h2>
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {MEASUREMENT_RANGES.map((range) => (
            <div key={range.key} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <label htmlFor={range.key} className="font-medium text-zinc-700">
                  {range.label}
                </label>
                <span className="tabular-nums font-semibold text-zinc-900">
                  {measurements[range.key]}
                  <span className="ml-1 text-xs font-normal text-zinc-400">{range.unit}</span>
                </span>
              </div>
              <input
                id={range.key}
                type="range"
                min={range.min}
                max={range.max}
                step={range.step}
                value={measurements[range.key]}
                onChange={(e) => onMeasurementChange(range.key, Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-zinc-900"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Wardrobe */}
      <section className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-700">
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
                onClick={() => onToggleItem(item)}
                className={`relative flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all ${
                  active
                    ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"
                }`}
              >
                <span
                  className="h-8 w-8 rounded-full border border-black/10"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium leading-tight">{item.name}</span>
                <span className="text-xs capitalize opacity-70">{item.type}</span>
                {active && (
                  <span className="absolute right-2 top-2 rounded-full bg-white p-0.5 text-zinc-900">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>
    </aside>
  );
}
