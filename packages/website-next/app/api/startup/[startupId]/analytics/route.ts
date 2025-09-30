import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/server/storage";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ startupId: string }> }
) {
  const params = await props.params;
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
