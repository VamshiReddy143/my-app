import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import User from "@/models/user";
import { authOptions } from "../../auth/authOptions";
import { dbConnect } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    let currentUserId: string | mongoose.Types.ObjectId = session.user.id;
    if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
      const existingUser = await User.findOne({ email: session.user.email }).select("_id");
      if (!existingUser) {
        return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
      }
      currentUserId = existingUser._id;
    }

    const { userId } = await req.json();
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ success: false, message: "Invalid user ID" }, { status: 400 });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(userId);

  
    if (!currentUser) {
      return NextResponse.json({ success: false, message: "Current user not found" }, { status: 404 });
    }
    if (!targetUser) {
      return NextResponse.json({ success: false, message: "Target user not found" }, { status: 404 });
    }

  
    const isFollowing = currentUser.following.includes(userId);
    if (isFollowing) {
      currentUser.following = currentUser.following.filter((id) => id.toString() !== userId);
      targetUser.followers = targetUser.followers.filter((id) => id.toString() !== currentUserId.toString());
    } else {
      currentUser.following.push(userId);
      targetUser.followers.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    return NextResponse.json({ success: true, isFollowing: !isFollowing }, { status: 200 });
  } catch (error) {
    console.error("Follow API Error:", error);


    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
