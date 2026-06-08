"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  X,
  Camera,
  ScanLine,
  ArrowRight,
  ArrowLeft,
  Shirt,
  Ruler,
  Sun,
  AlertCircle,
  Loader2,
  Box,
  ImageUp,
  Check,
} from "lucide-react";
import { DEFAULT_MEASUREMENTS, type Measurements } from "@/lib/measurements";
import {
  BUILD_OPTIONS,
  estimateMeasurements,
  type BuildType,
  type PhotoInputs,
} from "@/lib/estimate";
import type { ScanMethod } from "@/lib/session";

export interface ScanMeta {
  method: ScanMethod;
  weightLb?: number;
}

type Step = "method" | "setup" | "capture" | "photo" | "processing";

interface OnboardingProps {
  open: boolean;
  onClose: () => void;
  onComplete: (measurements: Measurements, meta: ScanMeta) => void;
}

const LIDAR_FLOW: Step[] = ["method", "setup", "capture", "processing"];
const PHOTO_FLOW: Step[] = ["method", "photo", "processing"];

const SETUP_TIPS = [
  { icon: Shirt, text: "Wear tight-fitting clothing for the most accurate scan." },
  { icon: Ruler, text: "Stand 6-8 feet from the camera so your whole body is visible." },
  { icon: Sun, text: "Find a well-lit space with a plain background behind you." },
];

/** A dashed human outline used to guide the user's positioning. */
function SilhouetteOverlay() {
  return (
    <svg
      viewBox="0 0 120 260"
      className="pointer-events-none absolute inset-0 m-auto h-[92%] w-auto opacity-90"
      fill="none"
      stroke="white"
      strokeWidth={2.5}
      strokeDasharray="6 6"
      strokeLinejoin="round"
    >
      <circle cx="60" cy="32" r="21" />
      <path
        d="M42,52 C34,60 32,84 36,104 C30,120 32,150 38,150 L42,150 L46,236 L57,236
           L58,170 L62,170 L63,236 L74,236 L78,150 L82,150 C88,150 90,120 84,104
           C88,84 86,60 78,52 C70,46 50,46 42,52 Z"
      />
      <path d="M40,58 C24,74 20,104 22,124" />
      <path d="M80,58 C96,74 100,104 98,124" />
    </svg>
  );
}

function Stepper({ flow, step }: { flow: Step[]; step: Step }) {
  const activeIndex = flow.indexOf(step);
  return (
    <div className="flex items-center justify-center gap-2">
      {flow.map((s, i) => (
        <span
          key={s}
          className={`h-1.5 rounded-full transition-all ${
            i <= activeIndex ? "w-8 bg-zinc-900" : "w-4 bg-zinc-200"
          }`}
        />
      ))}
    </div>
  );
}

export function Onboarding({ open, onClose, onComplete }: OnboardingProps) {
  const [method, setMethod] = useState<ScanMethod | null>(null);
  const [step, setStep] = useState<Step>("method");
  const [progress, setProgress] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Photo-path form state.
  const [heightIn, setHeightIn] = useState(69);
  const [weightLb, setWeightLb] = useState(165);
  const [build, setBuild] = useState<BuildType>("average");
  const [photoName, setPhotoName] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pendingEstimateRef = useRef<Measurements | null>(null);
  const pendingWeightRef = useRef<number | undefined>(undefined);

  const flow = method === "photo" ? PHOTO_FLOW : LIDAR_FLOW;

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Acquire the camera when entering the capture step; release it on leave.
  useEffect(() => {
    if (step !== "capture") return;

    let cancelled = false;
    setCameraError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera API is not available in this browser.");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCameraError("Camera unavailable or permission denied.");
        }
      });

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [step, stopCamera]);

  // Reset everything whenever the modal closes.
  useEffect(() => {
    if (!open) {
      stopCamera();
      setMethod(null);
      setStep("method");
      setProgress(0);
      setCameraError(null);
      setPhotoName(null);
      pendingEstimateRef.current = null;
      pendingWeightRef.current = undefined;
    }
  }, [open, stopCamera]);

  // Run processing: animate the bar, then resolve measurements based on method.
  useEffect(() => {
    if (step !== "processing") return;

    let cancelled = false;
    const start = Date.now();
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => (prev < 95 ? prev + 5 : prev));
    }, 110);

    const finish = (measurements: Measurements, activeMethod: ScanMethod) => {
      const wait = Math.max(0, 1800 - (Date.now() - start));
      setTimeout(() => {
        if (cancelled) return;
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          if (!cancelled) {
            onComplete(measurements, {
              method: activeMethod,
              weightLb: pendingWeightRef.current,
            });
          }
        }, 400);
      }, wait);
    };

    if (method === "photo") {
      const estimate = pendingEstimateRef.current ?? DEFAULT_MEASUREMENTS;
      finish(estimate, "photo");
    } else {
      fetch("/api/scan", { method: "POST" })
        .then((res) => res.json() as Promise<Measurements>)
        .then((data) => finish(data, "lidar"))
        .catch(() => finish(DEFAULT_MEASUREMENTS, "lidar"));
    }

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // method is read inside but stable for the duration of the processing step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, onComplete]);

  const chooseMethod = (m: ScanMethod) => {
    setMethod(m);
    setStep(m === "lidar" ? "setup" : "photo");
  };

  const submitPhoto = () => {
    const inputs: PhotoInputs = { heightIn, weightLb, build };
    pendingEstimateRef.current = estimateMeasurements(inputs);
    pendingWeightRef.current = weightLb;
    setStep("processing");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-zinc-900" />
            <h2 className="text-base font-semibold text-zinc-900">AI Body Scan</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Close scanner"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="mb-5">
            <Stepper flow={flow} step={step} />
          </div>

          {step === "method" && (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">Choose a scan method</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  Pick the most accurate option your device supports.
                </p>
              </div>

              <button
                type="button"
                onClick={() => chooseMethod("lidar")}
                className="group flex items-start gap-3 rounded-xl border border-zinc-200 p-4 text-left transition-all hover:border-zinc-900 hover:shadow-sm"
              >
                <span className="rounded-lg bg-indigo-100 p-2 text-indigo-700">
                  <Box className="h-5 w-5" />
                </span>
                <span className="flex-1">
                  <span className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                    Guided 3D Scan
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                      Most accurate
                    </span>
                  </span>
                  <span className="mt-0.5 block text-xs text-zinc-500">
                    Uses your camera with on-screen guidance to capture your full body.
                  </span>
                </span>
                <ArrowRight className="mt-1 h-4 w-4 text-zinc-300 group-hover:text-zinc-900" />
              </button>

              <button
                type="button"
                onClick={() => chooseMethod("photo")}
                className="group flex items-start gap-3 rounded-xl border border-zinc-200 p-4 text-left transition-all hover:border-zinc-900 hover:shadow-sm"
              >
                <span className="rounded-lg bg-amber-100 p-2 text-amber-700">
                  <ImageUp className="h-5 w-5" />
                </span>
                <span className="flex-1">
                  <span className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                    Photo + Measurements
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                      Quick estimate
                    </span>
                  </span>
                  <span className="mt-0.5 block text-xs text-zinc-500">
                    No depth sensor needed. Add a photo and your height &amp; weight.
                  </span>
                </span>
                <ArrowRight className="mt-1 h-4 w-4 text-zinc-300 group-hover:text-zinc-900" />
              </button>
            </div>
          )}

          {step === "setup" && (
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">Before we start</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  A quick scan estimates your measurements for a precise fit.
                </p>
              </div>
              <ul className="flex flex-col gap-3">
                {SETUP_TIPS.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3">
                    <span className="mt-0.5 rounded-lg bg-zinc-100 p-2 text-zinc-700">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm text-zinc-700">{text}</span>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("method")}
                  className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep("capture")}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
                >
                  Continue to camera
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === "capture" && (
            <div className="flex flex-col gap-4">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-zinc-900">
                {cameraError ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                    <AlertCircle className="h-8 w-8 text-amber-400" />
                    <p className="text-sm text-zinc-200">{cameraError}</p>
                    <p className="text-xs text-zinc-400">
                      You can still continue with a demo scan.
                    </p>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="h-full w-full -scale-x-100 object-cover"
                    />
                    <SilhouetteOverlay />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-center">
                      <p className="text-xs font-medium text-white">
                        Align your body with the outline
                      </p>
                    </div>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setStep("processing")}
                className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
              >
                {cameraError ? (
                  <>
                    Use demo scan
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    Capture
                  </>
                )}
              </button>
            </div>
          )}

          {step === "photo" && (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">Your details</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  We&apos;ll estimate your avatar from these. Less precise than a 3D scan.
                </p>
              </div>

              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-zinc-300 p-3 text-sm text-zinc-600 transition-colors hover:border-zinc-400">
                <span className="flex items-center gap-2">
                  {photoName ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <ImageUp className="h-4 w-4" />
                  )}
                  {photoName ?? "Add a photo (optional)"}
                </span>
                <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600">
                  Browse
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={(e) => setPhotoName(e.target.files?.[0]?.name ?? null)}
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="ob-height" className="text-xs font-medium text-zinc-600">
                    Height (in)
                  </label>
                  <input
                    id="ob-height"
                    type="number"
                    min={48}
                    max={84}
                    value={heightIn}
                    onChange={(e) => setHeightIn(Number(e.target.value))}
                    className="rounded-lg border border-zinc-200 px-3 py-2 text-sm tabular-nums outline-none focus:border-zinc-900"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="ob-weight" className="text-xs font-medium text-zinc-600">
                    Weight (lb)
                  </label>
                  <input
                    id="ob-weight"
                    type="number"
                    min={70}
                    max={400}
                    value={weightLb}
                    onChange={(e) => setWeightLb(Number(e.target.value))}
                    className="rounded-lg border border-zinc-200 px-3 py-2 text-sm tabular-nums outline-none focus:border-zinc-900"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-zinc-600">Build</span>
                <div className="grid grid-cols-4 gap-2">
                  {BUILD_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setBuild(option.id)}
                      className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                        build === option.id
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("method")}
                  className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={submitPhoto}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
                >
                  Generate avatar
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === "processing" && (
            <div className="flex flex-col items-center gap-5 py-6">
              <Loader2 className="h-10 w-10 animate-spin text-zinc-900" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-zinc-900">
                  {method === "photo" ? "Building your avatar…" : "Scanning…"}
                </h3>
                <p className="mt-1 text-sm text-zinc-500">Estimating your body measurements.</p>
              </div>
              <div className="w-full">
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-200">
                  <div
                    className="h-full rounded-full bg-zinc-900 transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-right text-xs font-medium tabular-nums text-zinc-500">
                  {progress}%
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
