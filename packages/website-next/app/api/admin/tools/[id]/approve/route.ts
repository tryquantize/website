import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/server/storage";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tool = await storage.approveTool(params.id);
    return NextResponse.json(tool);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to approve tool" },
      { status: 500 }
    );
  }
}
