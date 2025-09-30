import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/server/storage";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ startupId: string }> }
) {
  const params = await props.params;
  try {
    const tools = await storage.getToolsByStartup(params.startupId);
    return NextResponse.json(tools);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch startup tools" },
      { status: 500 }
    );
  }
}
