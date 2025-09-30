import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/server/storage";
import { insertAiToolSchema } from "@shared/schema";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const tool = await storage.getTool(params.id);
    if (!tool) {
      return NextResponse.json(
        { message: "Tool not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(tool);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch tool" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const body = await request.json();
    const updates = insertAiToolSchema.partial().parse(body);
    const tool = await storage.updateTool(params.id, updates);
    return NextResponse.json(tool);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update tool" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    await storage.deleteTool(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete tool" },
      { status: 500 }
    );
  }
}
