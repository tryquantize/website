import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/server/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: { startupId: string } }
) {
  try {
    const analytics = await storage.getSearchAnalytics(params.startupId);
    return NextResponse.json(analytics);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
