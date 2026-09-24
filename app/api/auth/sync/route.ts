import { NextResponse } from "next/server";
import { syncCurrentUser } from "@/lib/auth/user-sync";

export async function POST() {
  try {
    const user = await syncCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized / No active session" }, { status: 401 });
    }
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("User sync error:", error);
    return NextResponse.json({ error: "Failed to synchronize user" }, { status: 500 });
  }
}
