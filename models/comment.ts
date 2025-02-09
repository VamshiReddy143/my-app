import mongoose, { Schema, Types, Document } from "mongoose";

interface IComment extends Document {
  content: string;
  user: Types.ObjectId;
  postId: Types.ObjectId;
}

const CommentSchema = new Schema<IComment>(
  {
    content: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  },
  { timestamps: true }
);


const Comment = mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;
