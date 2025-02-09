import { dbConnect } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/authOptions";
import Community from "@/models/community";
import mongoose from "mongoose";
import User from "@/models/user";




export async function POST(req: NextRequest) {
    try {
        await dbConnect()
        const session = await getServerSession(authOptions)
        if (!session || !session.user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
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

        const { name, description, image } = await req.json()
        if (!name || !description) {
            return NextResponse.json({ success: false, message: "Name and description are required" }, { status: 400 });
        }

        const existingCommunity = await Community.findOne({ name });
        if (existingCommunity) {
            return NextResponse.json({ success: false, message: "Community already exists" }, { status: 400 });
        }

        const newCommunity = await Community.create({
            name,
            description,
            image,
            members: [userId],
        });

        return NextResponse.json({ success: true, community: newCommunity }, { status: 201 });
    } catch (error) {
        console.error("POST Community Error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}


export async function GET() {
    try {
      await dbConnect();
  
      // Fetch all communities and populate members
      const communities = await Community.find()
        .populate("members", "name image") 
        .select("name  description  image members"); 
  
      return NextResponse.json({ success: true, communities }, { status: 200 });
    } catch (error) {
      console.error("GET Communities Error:", error);
      return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
  }