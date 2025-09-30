import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/server/storage";
import { insertUserSchema } from "@shared/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userData = insertUserSchema.parse(body);
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const user = await storage.createUser(userData);
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid user data" },
      { status: 400 }
    );
  }
}
