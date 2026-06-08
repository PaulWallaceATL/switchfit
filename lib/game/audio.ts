/**
 * Tiny, asset-free sound layer built on the Web Audio API. Generates a soft
 * ambient mall hum plus short UI tones (clicks, purchase chime) so there are no
 * audio files to ship. The AudioContext is created lazily on the first user
 * gesture to respect browser autoplay policies.
 */

const AMBIENT_VOL = 0.012;

let ctx: AudioContext | null = null;
let muted = false;
let ambient: { gain: GainNode } | null = null;

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = "sine", vol = 0.06) {
  const c = ensureCtx();
  if (!c || muted) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(c.destination);
  const t = c.currentTime;
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

/** A short tactile click for UI interactions. */
export function playClick() {
  tone(420, 0.06, "triangle", 0.035);
}

/** A two-note rising chime for successful purchases / rewards. */
export function playChime() {
  tone(880, 0.16, "sine", 0.05);
  setTimeout(() => tone(1320, 0.22, "sine", 0.045), 95);
}

/** Starts the low ambient room tone (idempotent). */
export function startAmbient() {
  const c = ensureCtx();
  if (!c || ambient) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.value = 64;
  gain.gain.value = muted ? 0 : AMBIENT_VOL;
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start();
  ambient = { gain };
}

export function setMuted(value: boolean) {
  muted = value;
  if (ambient) ambient.gain.gain.value = value ? 0 : AMBIENT_VOL;
}
