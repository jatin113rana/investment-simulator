import { NextResponse } from "next/server";
import { getMutualFunds } from "@/lib/market-data";
import { consumeRateLimit, getRequestIdentifier } from "@/lib/security/rate-limit";

export async function GET(request: Request) {
  const rateLimit = consumeRateLimit(`funds:${getRequestIdentifier(request)}`, 60, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many fund catalog requests" },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  try {
    const funds = await getMutualFunds();
    return NextResponse.json(
      { funds, count: funds.length },
      {
        headers: {
          "Cache-Control": "private, max-age=30, stale-while-revalidate=300",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch mutual funds", details: error?.message },
      { status: 500 }
    );
  }
}