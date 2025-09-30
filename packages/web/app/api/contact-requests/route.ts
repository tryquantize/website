import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/server/storage";
import { insertContactRequestSchema } from "@shared/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const contactData = insertContactRequestSchema.parse(body);
    const contactRequest = await storage.createContactRequest(contactData);
    return NextResponse.json(contactRequest);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create contact request" },
      { status: 400 }
    );
  }
}
