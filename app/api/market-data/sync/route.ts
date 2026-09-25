import { NextResponse } from "next/server";
import { syncAMFIMutualFunds } from "@/lib/market-data/amfi-sync";
import { getMutualFunds } from "@/lib/market-data";
import { verifyRoleAccess } from "@/lib/auth/rbac";
import { Role } from "@prisma/client";
import { consumeRateLimit, getRequestIdentifier } from "@/lib/security/rate-limit";

export async function POST() {
  try {
    const access = await verifyRoleAccess([Role.ADMIN]);
    if (!access.authorized || access.user?.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    const rateLimit = consumeRateLimit(`amfi-sync:${access.user.id}`, 3, 60 * 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "AMFI sync rate limit exceeded" },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
      );
    }

    const result = await syncAMFIMutualFunds();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to sync AMFI market data", details: error?.message },
      { status: 500 }
    );
  }
}

// Backward-compatible read path for older browser bundles. It never triggers ingestion.
export async function GET(request: Request) {
  const rateLimit = consumeRateLimit(`sync-read:${getRequestIdentifier(request)}`, 60, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many fund requests" },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }
  try {
    const funds = await getMutualFunds();
    return NextResponse.json(
      { success: true, funds, totalFundsSynced: funds.length },
      { headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=300" } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch mutual funds", details: error?.message },
      { status: 500 }
    );
  }
}

