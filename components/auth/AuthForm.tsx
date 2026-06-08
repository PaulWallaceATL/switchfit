"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ScanLine, ArrowRight, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth/MockAuthProvider";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const { login, signup, loginAsGuest } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isSignup = mode === "signup";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isSignup) signup(email, name);
    else login(email);
    router.push("/");
  };

  const handleGuest = () => {
    loginAsGuest();
    router.push("/");
  };

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 rounded-xl bg-zinc-900 p-2.5 text-white">
            <ScanLine className="h-6 w-6" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">SwitchFit</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {isSignup ? "Create your account" : "Welcome back"}
          </p>
        </div>

        <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Testing mode: authentication is bypassed. Any details work, or jump straight in as a
            guest.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          {isSignup && (
            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="text-xs font-medium text-zinc-600">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Doe"
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900"
              />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-xs font-medium text-zinc-600">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-xs font-medium text-zinc-600">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900"
            />
          </div>

          <button
            type="submit"
            className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
          >
            {isSignup ? "Create account" : "Log in"}
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleGuest}
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            <Zap className="h-4 w-4" />
            Quick continue as guest
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-500">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-zinc-900 hover:underline">
                Log in
              </Link>
            </>
          ) : (
            <>
              New here?{" "}
              <Link href="/signup" className="font-semibold text-zinc-900 hover:underline">
                Create an account
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
