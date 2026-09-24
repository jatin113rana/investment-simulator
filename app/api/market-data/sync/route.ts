import { NextResponse } from "next/server";
import { syncAMFIMutualFunds } from "@/lib/market-data/amfi-sync";

export async function POST() {
  try {
    const result = await syncAMFIMutualFunds();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to sync AMFI market data", details: error?.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await syncAMFIMutualFunds();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to sync AMFI market data", details: error?.message },
      { status: 500 }
    );
  }
}
