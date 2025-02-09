import { NextRequest, NextResponse } from "next/server";

import User from "@/models/user";

import Post from "@/models/post";
import { dbConnect } from "@/lib/mongodb";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();

    const user = await User.findById(params.id);
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const posts = await Post.find({ "user._id": params.id });

    return NextResponse.json({ success: true, user, posts }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
