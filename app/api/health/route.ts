import { NextResponse } from "next/server";
import { healthResponseSchema } from "@/lib/validation";

export async function GET() {
  const data = {
    status: "ok" as const,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  };

  const parsed = healthResponseSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid health status response" }, { status: 500 });
  }

  return NextResponse.json(parsed.data);
}
