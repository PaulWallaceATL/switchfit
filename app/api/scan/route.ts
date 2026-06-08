import { NextResponse } from "next/server";
import type { Measurements } from "@/lib/measurements";

/** Returns a random integer in [min, max]. */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Mock body-scan endpoint. In a real system this would run pose estimation on
 * the uploaded image; here we ignore the (simulated) payload and return random
 * but realistic measurements in inches so the rest of the flow can be exercised.
 */
export async function POST(request: Request) {
  // Drain the body if present so the simulated upload is "consumed".
  await request.arrayBuffer().catch(() => undefined);

  // Simulate server-side processing latency.
  await new Promise((resolve) => setTimeout(resolve, 600));

  const measurements: Measurements = {
    height: randInt(64, 75),
    chest: randInt(36, 46),
    waist: randInt(28, 40),
    hips: randInt(35, 45),
  };

  return NextResponse.json(measurements);
}
