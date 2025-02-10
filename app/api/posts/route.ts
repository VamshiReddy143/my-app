import cloudinary from "@/lib/cloudinary";
import { dbConnect } from "@/lib/mongodb";
import Post from "@/models/post";
import User from "@/models/user";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/authOptions";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    let userId: string | mongoose.Types.ObjectId = session.user.id;
    ///➡️➡️➡️ changed 


    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const existingUser = await User.findOne({ email: session.user.email }).select("_id");
      if (!existingUser) {
        return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
      }
      userId = existingUser._id;
    } else {
      userId = new mongoose.Types.ObjectId(userId);
    }

    const formData = await request.formData();
    const title = formData.get("title")?.toString();
    const description = formData.get("description")?.toString();
    const imageFile = formData.get("image");
    const tagsString = formData.get("tags")?.toString();
    const communityId = formData.get("community")?.toString();

    const isCommunityPost = Boolean(communityId && communityId !== "null")

    if (!title || !description || (isCommunityPost && !communityId)) {
      return NextResponse.json(
        { success: false, message: isCommunityPost ? "Community is required" : "Title and description are required" },
        { status: 400 }
      );
    }


    const tags = tagsString ? tagsString.split(",").map(tag => tag.trim()) : [];

    let secureUrl = "";
    if (imageFile instanceof File) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      try {
        const cloudImage = await new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "posts", resource_type: "auto" },
            (error, result) => (error ? reject(error) : resolve(result))
          );
          uploadStream.end(buffer);
        });

        secureUrl = cloudImage.secure_url;
      } catch (uploadError) {
        console.error("Image/Video upload failed:", uploadError);
        return NextResponse.json({ success: false, message: "Image/Video upload failed" }, { status: 500 });
      }
    }


    const newPost = await Post.create({
      title,
      description,
      image: secureUrl,
      user: userId,
      tags,
      community: isCommunityPost ? communityId : null,
    });

    return NextResponse.json({ success: true, post: newPost }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}


export async function GET() {
  try {
    await dbConnect();

    const { default: Comment } = await import("@/models/comment");
    const { default: Community } = await import("@/models/community");
    const posts = await Post.find()
      .populate("user", "name email image")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "name email image"
        }
      })
      .populate({
        path: "community",
        select: "name"})
      .select("title description likes dislikes community  image tags user comments createdAt")
      .sort({ createdAt: -1 })


      console.log("Fetched Posts:", posts);

    return NextResponse.json({ success: true, posts }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });

    }
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}