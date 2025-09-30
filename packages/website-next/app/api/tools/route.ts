import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/server/storage";
import { insertAiToolSchema } from "@shared/schema";

export async function GET() {
  try {
    const tools = await storage.getAllTools();
    return NextResponse.json(tools);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch tools" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const toolData = insertAiToolSchema.parse(body);
    const tool = await storage.createTool(toolData);
    return NextResponse.json(tool);
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid tool data" },
      { status: 400 }
    );
  }
}
