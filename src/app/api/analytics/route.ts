import { NextRequest, NextResponse } from "next/server";
import { saveEvent } from "@/lib/analytics/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await saveEvent(body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
