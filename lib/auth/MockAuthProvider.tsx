"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * TEMPORARY mock auth. This stores a fake user in localStorage so the signup /
 * login flow exists and "quick login" works, WITHOUT any real authentication.
 *
 * TODO(auth): replace this provider with Supabase Auth (@supabase/ssr):
 *   - swap localStorage for supabase.auth.getUser()/onAuthStateChange
 *   - back login()/signup() with supabase.auth.signInWithPassword / signUp
 *   - add middleware to refresh sessions
 * The component API below is intentionally close to that shape to ease the swap.
 */

export interface MockUser {
  id: string;
  email: string;
  name: string;
}

interface AuthContextValue {
  user: MockUser | null;
  loading: boolean;
  signup: (email: string, name?: string) => void;
  login: (email: string) => void;
  loginAsGuest: () => void;
  logout: () => void;
}

const STORAGE_KEY = "switchfit.mockUser";
const AuthContext = createContext<AuthContextValue | null>(null);

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `user_${Date.now()}`;
}

function makeUser(email: string, name?: string): MockUser {
  const safeEmail = email.trim() || "guest@switchfit.app";
  return {
    id: newId(),
    email: safeEmail,
    name: (name?.trim() || safeEmail.split("@")[0] || "Guest").slice(0, 40),
  };
}

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as MockUser);
    } catch {
      // ignore malformed storage
    }
    setLoading(false);
  }, []);

  const persist = useCallback((next: MockUser | null) => {
    setUser(next);
    try {
      if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage failures
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signup: (email, name) => persist(makeUser(email, name)),
      login: (email) => persist(makeUser(email)),
      loginAsGuest: () => persist({ id: "guest", email: "guest@switchfit.app", name: "Guest" }),
      logout: () => persist(null),
    }),
    [user, loading, persist],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within MockAuthProvider");
  return ctx;
}
