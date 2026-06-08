import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Measurements } from "@/lib/measurements";

interface ScanPayload {
  method: "lidar" | "photo";
  measurements: Measurements;
  weightLb?: number;
}

/**
 * Persists a completed scan. While auth is bypassed this uses the service-role
 * client (user_id left null). If Supabase isn't configured it no-ops so the
 * scan flow keeps working in local/testing setups.
 *
 * TODO(auth): once real auth is enabled, switch to the request-scoped server
 * client and set user_id = the authenticated user's id (RLS already enforces it).
 */
export async function POST(request: Request) {
  let body: ScanPayload;
  try {
    body = (await request.json()) as ScanPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { method, measurements } = body ?? {};
  if (!method || !measurements) {
    return NextResponse.json({ error: "Missing method or measurements" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    // Supabase not configured — accept the scan but don't persist.
    return NextResponse.json({ persisted: false, reason: "supabase-not-configured" });
  }

  const { data, error } = await admin
    .from("body_scans")
    .insert({
      user_id: null,
      method,
      height_in: measurements.height,
      chest_in: measurements.chest,
      waist_in: measurements.waist,
      hips_in: measurements.hips,
      weight_lb: body.weightLb ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ persisted: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ persisted: true, id: data.id });
}
