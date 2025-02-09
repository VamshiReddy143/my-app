import mongoose, { Schema, Types, Document } from "mongoose";

interface IPost extends Document {
  title: string;
  description: string;
  image?: string; // ✅ Ensured "image" field is a string (Cloudinary URL)
  user: Types.ObjectId;
  likes?: Types.ObjectId[];
  dislikes?: Types.ObjectId[];
  comments?: Types.ObjectId[];
  tags: string[]; // ✅ Ensure tags are stored correctly
  community?: Types.ObjectId;
}

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String }, // ✅ This field will now store the Cloudinary URL
    user: { type: Schema.Types.ObjectId , ref: "User", required: true }, // ✅ Ensuring ObjectId type
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    tags: [{ type: String }], // ✅ Ensuring this is an array of strings
    community: { type: Schema.Types.ObjectId, ref: "Community" },
  },
  { timestamps: true }
);

const Post = mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);
export default Post;
