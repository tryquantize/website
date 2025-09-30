import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/server/storage";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ startupId: string }> }
) {
  const params = await props.params;
  try {
    const contactRequests = await storage.getContactRequestsForStartup(params.startupId);
    return NextResponse.json(contactRequests);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch contact requests" },
      { status: 500 }
    );
  }
}
