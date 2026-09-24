import { NextResponse } from "next/server";
import prisma from "@/lib/db/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const schemeCode = searchParams.get("schemeCode");

  if (!schemeCode) {
    return NextResponse.json({ error: "schemeCode query parameter is required" }, { status: 400 });
  }

  try {
    const history = await prisma.fundPriceHistory.findMany({
      where: { schemeCode },
      orderBy: { createdAt: "asc" },
      take: 14,
    });

    const formatted = history.map((h) => ({
      date: h.date,
      nav: h.nav.toNumber(),
    }));

    return NextResponse.json({ schemeCode, history: formatted });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch price history", details: error?.message },
      { status: 500 }
    );
  }
}
