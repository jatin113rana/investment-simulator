import { NextResponse } from "next/server";
import prisma from "@/lib/db/db";
import { consumeRateLimit, getRequestIdentifier } from "@/lib/security/rate-limit";

export async function GET(request: Request) {
  const rateLimit = consumeRateLimit(`history:${getRequestIdentifier(request)}`, 120, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many history requests" },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const schemeCode = searchParams.get("schemeCode");

  if (!schemeCode) {
    return NextResponse.json({ error: "schemeCode query parameter is required" }, { status: 400 });
  }

  try {
    const history = await prisma.fundPriceHistory.findMany({
      where: { schemeCode },
      orderBy: { createdAt: "desc" },
      take: 14,
    });

    const formatted = history.reverse().map((h) => ({
      date: h.date,
      nav: h.nav.toNumber(),
    }));

    return NextResponse.json(
      { schemeCode, history: formatted },
      { headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=300" } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch price history", details: error?.message },
      { status: 500 }
    );
  }
}
