import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/server/storage";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await storage.recordToolClick(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to record click" },
      { status: 500 }
    );
  }
}
