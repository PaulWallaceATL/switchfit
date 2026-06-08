import { DEFAULT_MEASUREMENTS, type Measurements } from "@/lib/measurements";

export type ScanMethod = "lidar" | "photo";

export interface ScanRecord {
  method: ScanMethod;
  measurements: Measurements;
  weightLb?: number;
  /** ISO timestamp. */
  at: string;
}

export interface SessionProfile {
  measurements: Measurements;
  selectedIds: string[];
  scanned: boolean;
  lastMethod: ScanMethod | null;
  scanHistory: ScanRecord[];
}

const STORAGE_KEY = "switchfit.session";
const MAX_HISTORY = 10;

export const EMPTY_SESSION: SessionProfile = {
  measurements: DEFAULT_MEASUREMENTS,
  selectedIds: [],
  scanned: false,
  lastMethod: null,
  scanHistory: [],
};

/**
 * Session-scoped persistence (sessionStorage). Keeps the avatar, wardrobe, and
 * scan history alive across reloads/navigations while testing, with no backend.
 *
 * TODO(supabase): when adding Supabase, sync these reads/writes to the
 * `body_scans` table (see supabase/migrations) for cross-device history.
 */
export function loadSession(): SessionProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return { ...EMPTY_SESSION, ...(JSON.parse(raw) as Partial<SessionProfile>) };
  } catch {
    return null;
  }
}

export function saveSession(profile: SessionProfile): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // sessionStorage unavailable (private mode / quota) — ignore.
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Returns a new history array with the record prepended, capped at MAX_HISTORY. */
export function appendScan(history: ScanRecord[], record: ScanRecord): ScanRecord[] {
  return [record, ...history].slice(0, MAX_HISTORY);
}
