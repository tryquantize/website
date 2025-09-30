import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/server/storage";
import { insertSearchQuerySchema } from "@shared/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const searchData = insertSearchQuerySchema.parse(body);
    await storage.recordSearch(searchData);
    
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5002';
    const response = await fetch(`${AI_SERVICE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error('AI service request failed');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: "Search failed" },
      { status: 500 }
    );
  }
}
