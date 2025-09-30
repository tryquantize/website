import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/server/storage";

export async function GET() {
  try {
    const tools = await storage.getPendingTools();
    return NextResponse.json(tools);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch pending tools" },
      { status: 500 }
    );
  }
}
