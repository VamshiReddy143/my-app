import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "next-auth"; 
import { authOptions } from "../../auth/authOptions";
import Post from "@/models/post";
import Community from "@/models/community";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/user";




export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid community ID" }, { status: 400 });
    }

    const community = await Community.findById(id);
    if (!community) {
      return NextResponse.json({ success: false, message: "Community not found" }, { status: 404 });
    }

    
    let userId: string | mongoose.Types.ObjectId = session?.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        const existingUser = await User.findOne({ email: session?.user.email }).select("_id");
        if (!existingUser) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }
        userId = existingUser._id;
    } else {
        userId = new mongoose.Types.ObjectId(userId);
    }
    
    let joined;
    if (community.members.includes(userId)) {
      community.members.pull(userId);
      joined = false;
    } else {
      community.members.push(userId);
      joined = true;
    }
    await community.save();

    return NextResponse.json({ 
      success: true, 
      joined,
      members: community.members.length,
      memberList: await community.populate("members", "name image"), 
    }, { status: 200 });
  } catch (error) {
    console.error("PUT Community Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}





export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const { id } = params;


    const community = await Community.findById(id)
    .populate({
      path: "posts",
      populate: {
        path: "comments",
        populate: {
          path: "user",
          select: "name image",
        },
      },
    })
    .populate("members", "name image");
  
  
  
    if (!community) {
      return NextResponse.json({ success: false, message: "Community not found" }, { status: 404 });
    }

    // Fetch posts associated with the community
    const posts = await Post.find({ community: id })
      .populate("user", "name image") // Populate user details
      .populate({
        path: "comments",
        populate: { path: "user", select: "name image" },
      })
      .sort({ createdAt: -1 }); // Sort by latest posts

    return NextResponse.json(
      { success: true, community, posts },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET Community Details Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}