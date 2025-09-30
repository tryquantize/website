import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/server/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: { startupId: string } }
) {
  try {
    const tools = await storage.getStartupTools(params.startupId);
    return NextResponse.json(tools);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch startup tools" },
      { status: 500 }
    );
  }
}
