"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Sidebar } from "@/components/Sidebar";
import { StoreBanner } from "@/components/StoreBanner";
import { ProductCard } from "@/components/ProductCard";
import { ShoppingBag } from "@/components/ShoppingBag";
import { Onboarding, type ScanMeta } from "@/components/Scanner/Onboarding";
import {
  DEFAULT_MEASUREMENTS,
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
import { findGarment, getProduct, type BagItem } from "@/lib/catalog";
import { getFitScore } from "@/lib/fitLogic";
import { DEFAULT_GENDER, DEFAULT_SKIN_TONE, type Gender } from "@/lib/body";

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
  const [gender, setGender] = useState<Gender>(DEFAULT_GENDER);
  const [skinTone, setSkinTone] = useState<string>(DEFAULT_SKIN_TONE);
  const [activeStore, setActiveStore] = useState<string | null>(null);
  const [activeProduct, setActiveProduct] = useState<string | null>(null);
  const [garmentColors, setGarmentColors] = useState<Record<string, number>>({});
  const [bag, setBag] = useState<BagItem[]>([]);

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
      setGender(saved.gender);
      setSkinTone(saved.skinTone);
      setBag(saved.bag);
    }
    hydrated.current = true;
  }, []);

  // Persist to the session on any change (skip the initial pre-hydration render).
  useEffect(() => {
    if (!hydrated.current) return;
    saveSession({
      measurements,
      selectedIds,
      scanned,
      lastMethod,
      scanHistory,
      gender,
      skinTone,
      bag,
    });
  }, [measurements, selectedIds, scanned, lastMethod, scanHistory, gender, skinTone, bag]);

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
      const withoutSameType = prev.filter((id) => findGarment(id)?.type !== item.type);
      return [...withoutSameType, item.id];
    });
  }, []);

  // Try on a specific product/colorway: replaces any same-type garment.
  const handleTryOn = useCallback((productId: string, colorIndex: number) => {
    setGarmentColors((prev) => ({ ...prev, [productId]: colorIndex }));
    const type = getProduct(productId)?.garment.type;
    setSelectedIds((prev) => {
      const withoutSameType = prev.filter(
        (id) => id !== productId && findGarment(id)?.type !== type,
      );
      return [...withoutSameType, productId];
    });
  }, []);

  const handleRemoveTryOn = useCallback((productId: string) => {
    setSelectedIds((prev) => prev.filter((id) => id !== productId));
  }, []);

  const handleAddToBag = useCallback((item: BagItem) => {
    setBag((prev) => [...prev, item]);
  }, []);

  const handleRemoveFromBag = useCallback((index: number) => {
    setBag((prev) => prev.filter((_, i) => i !== index));
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
    () =>
      selectedIds
        .map((id) => findGarment(id, garmentColors[id] ?? 0))
        .filter((item): item is WardrobeItem => Boolean(item)),
    [selectedIds, garmentColors],
  );

  const recommendedSize = useMemo(
    () => getFitScore(measurements).recommendedSize,
    [measurements],
  );

  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar
        measurements={measurements}
        selectedIds={selectedIds}
        scanned={scanned}
        gender={gender}
        skinTone={skinTone}
        onMeasurementChange={handleMeasurementChange}
        onToggleItem={handleToggleItem}
        onReset={handleReset}
        onStartScan={() => setScannerOpen(true)}
        onGenderChange={setGender}
        onSkinToneChange={setSkinTone}
      />
      <div className="relative flex-1">
        <ThreeScene
          measurements={measurements}
          selectedItems={selectedItems}
          gender={gender}
          skinTone={skinTone}
          onEnterStore={setActiveStore}
          onNearProduct={setActiveProduct}
          activeProductId={activeProduct}
        />
        <StoreBanner storeId={activeStore} />
        <ShoppingBag items={bag} onRemove={handleRemoveFromBag} />
        <ProductCard
          productId={activeProduct}
          wornIds={selectedIds}
          recommendedSize={recommendedSize}
          onTryOn={handleTryOn}
          onRemoveTryOn={handleRemoveTryOn}
          onAddToBag={handleAddToBag}
        />
      </div>
      <Onboarding
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onComplete={handleScanComplete}
      />
    </div>
  );
}
