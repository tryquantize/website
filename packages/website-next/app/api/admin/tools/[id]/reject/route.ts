import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/server/storage";

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const tool = await storage.rejectTool(params.id);
    return NextResponse.json(tool);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to reject tool" },
      { status: 500 }
    );
  }
}
