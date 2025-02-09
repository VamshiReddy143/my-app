import { dbConnect } from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { email, password, name } = body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new Response(JSON.stringify({ success: false, message: "Email already registered" }), { 
        status: 400, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const newUser = await User.create({
      email,
      password: hashedPassword || undefined,
      name,
    });

    return new Response(JSON.stringify({ success: true, message: "User registered successfully", user: newUser._id }), { 
      status: 201, 
      headers: { "Content-Type": "application/json" } 
    });

  } catch (error) {
    console.error("Registration Error:", error);
    return new Response(JSON.stringify({ success: false, message: "Server error" }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    });
  }
}




