import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/server/storage";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const analytics = await storage.getToolAnalytics(params.id);
    return NextResponse.json(analytics);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
