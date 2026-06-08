"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Sidebar } from "@/components/Sidebar";
import { Onboarding, type ScanMeta } from "@/components/Scanner/Onboarding";
import {
  DEFAULT_MEASUREMENTS,
  WARDROBE,
  type MeasurementKey,
  type Measurements,
  type WardrobeItem,
} from "@/lib/measurements";
import {
  appendScan,
  loadSession,
  saveSession,
  type ScanMethod,
  type ScanRecord,
} from "@/lib/session";

const ThreeScene = dynamic(() => import("@/components/ThreeScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-stone-200 text-sm text-zinc-500">
      Loading 3D scene…
    </div>
  ),
});

export default function Home() {
  const [measurements, setMeasurements] = useState<Measurements>(DEFAULT_MEASUREMENTS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [lastMethod, setLastMethod] = useState<ScanMethod | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);

  // Hydrate from the session once on mount (after SSR to avoid mismatches).
  const hydrated = useRef(false);
  useEffect(() => {
    const saved = loadSession();
    if (saved) {
      setMeasurements(saved.measurements);
      setSelectedIds(saved.selectedIds);
      setScanned(saved.scanned);
      setLastMethod(saved.lastMethod);
      setScanHistory(saved.scanHistory);
    }
    hydrated.current = true;
  }, []);

  // Persist to the session on any change (skip the initial pre-hydration render).
  useEffect(() => {
    if (!hydrated.current) return;
    saveSession({ measurements, selectedIds, scanned, lastMethod, scanHistory });
  }, [measurements, selectedIds, scanned, lastMethod, scanHistory]);

  const handleMeasurementChange = useCallback((key: MeasurementKey, value: number) => {
    setMeasurements((prev) => ({ ...prev, [key]: value }));
    setScanned(false);
  }, []);

  const handleToggleItem = useCallback((item: WardrobeItem) => {
    setSelectedIds((prev) => {
      if (prev.includes(item.id)) {
        return prev.filter((id) => id !== item.id);
      }
      // Only one garment per type may be worn at a time.
      const withoutSameType = prev.filter(
        (id) => WARDROBE.find((w) => w.id === id)?.type !== item.type,
      );
      return [...withoutSameType, item.id];
    });
  }, []);

  const handleReset = useCallback(() => {
    setMeasurements(DEFAULT_MEASUREMENTS);
    setSelectedIds([]);
    setScanned(false);
    setLastMethod(null);
  }, []);

  const handleScanComplete = useCallback((scanResult: Measurements, meta: ScanMeta) => {
    setMeasurements(scanResult);
    setScanned(true);
    setLastMethod(meta.method);
    setScanHistory((prev) =>
      appendScan(prev, {
        method: meta.method,
        measurements: scanResult,
        weightLb: meta.weightLb,
        at: new Date().toISOString(),
      }),
    );
    setScannerOpen(false);
  }, []);

  const selectedItems = useMemo(
    () => WARDROBE.filter((item) => selectedIds.includes(item.id)),
    [selectedIds],
  );

  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar
        measurements={measurements}
        selectedIds={selectedIds}
        scanned={scanned}
        onMeasurementChange={handleMeasurementChange}
        onToggleItem={handleToggleItem}
        onReset={handleReset}
        onStartScan={() => setScannerOpen(true)}
      />
      <div className="relative flex-1">
        <ThreeScene measurements={measurements} selectedItems={selectedItems} />
      </div>
      <Onboarding
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onComplete={handleScanComplete}
      />
    </div>
  );
}
