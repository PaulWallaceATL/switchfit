"use client";

import { useGameStore } from "@/lib/game/store";
import { SHOP_ZONES, getZone } from "@/lib/world/zones";

const SIZE = 168;
const PAD = 18;
/** World half-extent the minimap covers (units). Buildings sit ~30 out. */
const WORLD_R = 44;

function toSvg(x: number, z: number): [number, number] {
  const half = SIZE / 2;
  return [(x / WORLD_R) * (half - PAD) + half, (z / WORLD_R) * (half - PAD) + half];
}

/** Corner mini-map: mall layout, discovered shops, and the live player marker. */
export function Minimap() {
  const visible = useGameStore((s) => s.minimapVisible);
  const playerPos = useGameStore((s) => s.playerPos);
  const facing = useGameStore((s) => s.facing);
  const currentZoneId = useGameStore((s) => s.currentZoneId);
  const discovered = useGameStore((s) => s.discoveredShopIds);

  if (!visible) return null;

  const [px, pz] = toSvg(playerPos.x, playerPos.z);
  const zone = getZone(currentZoneId);
  // The avatar moves along (sin h, cos h) in (x, z). The arrow glyph points up
  // (0,-1) by default; this rotation aligns it with the heading on the y-down map.
  const arrowDeg = 180 - (facing * 180) / Math.PI;

  return (
    <div className="pointer-events-auto overflow-hidden rounded-2xl border border-white/15 bg-zinc-900/80 p-3 shadow-lg backdrop-blur-md">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">Mall Map</span>
        <span className="max-w-[7rem] truncate text-[11px] font-medium text-white/80">
          {zone?.label ?? "Plaza"}
        </span>
      </div>
      <svg width={SIZE} height={SIZE} className="rounded-lg bg-zinc-950/60">
        {/* Plaza ring */}
        <circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2 - PAD} fill="none" stroke="#3f3f46" strokeWidth={1} strokeDasharray="3 4" />
        <circle cx={SIZE / 2} cy={SIZE / 2} r={4} fill="#52525b" />

        {SHOP_ZONES.map((z) => {
          const [sx, sy] = toSvg(z.center[0], z.center[1]);
          const isCurrent = z.id === currentZoneId;
          const seen = discovered.includes(z.id);
          return (
            <g key={z.id}>
              <circle
                cx={sx}
                cy={sy}
                r={isCurrent ? 6 : 4.5}
                fill={seen ? z.accent : "#27272a"}
                stroke={isCurrent ? "#ffffff" : seen ? z.color : "#3f3f46"}
                strokeWidth={isCurrent ? 2 : 1}
              />
            </g>
          );
        })}

        {/* Player marker */}
        <g transform={`translate(${px} ${pz}) rotate(${arrowDeg})`}>
          <path d="M0,-6 L4,5 L0,2 L-4,5 Z" fill="#fafafa" stroke="#0c0a09" strokeWidth={0.75} />
        </g>
      </svg>
    </div>
  );
}
