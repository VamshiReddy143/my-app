// /api/users/[id].js
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user"; // Assuming you have a User model
import Post from "@/models/post"; // Assuming you have a Post model

export async function GET(req:NextRequest, { params }) {
  const { id: userId } = params;

  try {
    // Fetch user details
    const user = await User.findById(userId).select("name email image followers following");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch posts created by the user
    const posts = await Post.find({ user: userId }).select("title description likes dislikes community  image tags user comments createdAt") .sort({ createdAt: -1 })

    return NextResponse.json({
      user,
      posts,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


// export async function GET() {
//   try {
//     await dbConnect();

//     const { default: Comment } = await import("@/models/comment");
//     const { default: Community } = await import("@/models/community");
//     const posts = await Post.find()
//       .populate("user", "name email image")
//       .populate({
//         path: "comments",
//         populate: {
//           path: "user",
//           select: "name email image"
//         }
//       })
//       .populate({
//         path: "community",
//         select: "name"})
//       .select("title description likes dislikes community  image tags user comments createdAt")
//       .sort({ createdAt: -1 })


//       console.log("Fetched Posts:", posts);

//     return NextResponse.json({ success: true, posts }, { status: 200 });
//   } catch (error) {
//     if (error instanceof Error) {
//       return NextResponse.json({ success: false, message: error.message }, { status: 500 });

//     }
//     return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
//   }
// }