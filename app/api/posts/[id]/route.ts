import cloudinary from "@/lib/cloudinary";
import { dbConnect } from "@/lib/mongodb";
import Post from "@/models/post";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/authOptions";
import mongoose from "mongoose";
import User from "@/models/user";
import Comment from "@/models/comment";



export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {

    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    try {
        await dbConnect()
        const { id } = params
        if (!id) {
            return NextResponse.json({ success: false, message: "Post id is required" }, { status: 400 })
        }

        const post = await Post.findById(id)
        if (!post) {
            return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 });
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

    if(post.user.toString() !== userId.toString()){
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

        let publicId = null
        if (post.image) {
            const urlparts = post.image.split("/")
            const fileName = urlparts[urlparts.length - 1]
            publicId = fileName.split(".")[0]
        }
        await Post.findByIdAndDelete(id)

        if (publicId) {
            try {
                await cloudinary.uploader.destroy(publicId, { resource_type: "auto" });
                console.log("File deleted from Cloudinary:", publicId);
            } catch (cloudinaryError) {
                console.error("Cloudinary deletion error:", cloudinaryError);

            }
        }
        return NextResponse.json({ success: true, message: "Post deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("DELETE Error:", error);
        return NextResponse.json({ success: false, message: "Something went wrong." }, { status: 500 });
    }
}


export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const { action } = await req.json()

    let userId: string | mongoose.Types.ObjectId = session.user.id;



    if (!mongoose.Types.ObjectId.isValid(userId)) {
        const existingUser = await User.findOne({ email: session.user.email }).select("_id");
        if (!existingUser) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }
        userId = existingUser._id;
    } else {
        userId = new mongoose.Types.ObjectId(userId);
    }

    if (!id || !userId || !action) {
        return NextResponse.json(
            { success: false, message: "Post ID, User ID, and Action are required." },
            { status: 400 }
        );
    }

    try {
        await dbConnect()
        const post = await Post.findById(id)
        if (!post) {
            return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 })
        }


        if (action === "like") {
            const isLiked = post.likes.includes(userId)
            if (isLiked) {
                post.likes.pull(userId)
            } else {
                post.likes.push(userId);
                post.dislikes.pull(userId);
            }
        } else if (action === "dislike") {
            const isDisliked = post.dislikes.includes(userId)
            if (isDisliked) {
                post.dislikes.pull(userId)
            } else {
                post.dislikes.push(userId);
                post.likes.pull(userId);
            }
        } else {
            return NextResponse.json({ success: false, message: "Invalid action." }, { status: 400 });
        }

        await post.save()

        return NextResponse.json(
            {
                success: true,
                message:
                    action === "like"
                        ? "Post liked successfully."
                        : "Post disliked successfully.",
                likes: post.likes,
                dislikes: post.dislikes,
            },
            { status: 200 }
        );

    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: "Something went wrong.", error }, { status: 500 });
    }
}



export async function POST(req: NextRequest, { params }: { params: { id: string } }) {



    try {
        await dbConnect()

        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        const { id } = params
        const { content } = await req.json()
        let userId: string | mongoose.Types.ObjectId = session?.user.id;



        if (!mongoose.Types.ObjectId.isValid(userId)) {
            const existingUser = await User.findOne({ email: session.user.email }).select("_id");
            if (!existingUser) {
                return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
            }
            userId = existingUser._id;
        } else {
            userId = new mongoose.Types.ObjectId(userId);
        }


        if (!userId || !content) {
            return NextResponse.json({ success: false, message: "User ID and content are required" }, { status: 400 });
        }

        console.log(userId)


        const post = await Post.findById(id)
        if (!post) {
            return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 })
        }

        const newComment = await Comment.create({
            content,
            user: userId,
            postId: id
        })

        const populatedComment = await Comment.findById(newComment._id).populate("user", "name image").lean()

        post.comments.push(newComment._id)
        await post.save()

        return NextResponse.json({ success: true, message: "Comment added successfully", comment: populatedComment }, { status: 200 });
    } catch (error) {
        console.error("POST Comment Error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}