import User from "@/models/user";

import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { dbConnect } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    await dbConnect();

    let body;
    try {
      body = await request.json();
    } catch (error: unknown) {
      console.error("Error parsing JSON:", error);
      return new NextResponse(
        JSON.stringify({ success: false, message: "Invalid JSON payload" }),
        { status: 400 }
      );
    }

    const { email, password } = body;

    if (!email || !password) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "Email and password are required" }),
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "No user found with this email" }),
        { status: 401 }
      );
    }

    if (!user.password) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "This account uses Google login. Please sign in with Google." }),
        { status: 400 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "Incorrect password" }),
        { status: 401 }
      );
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: "Login successful",
        token, // Return the token instead of exposing user details
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Login API Error:", error);
    return new NextResponse(
      JSON.stringify({ success: false, message: "An unexpected error occurred" }),
      { status: 500 }
    );
  }
}
