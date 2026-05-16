import { NextResponse } from "next/server";
import { getAnalyticsStats } from "@/lib/analytics/server";

export async function GET() {
  const stats = await getAnalyticsStats();
  return NextResponse.json(stats);
}
