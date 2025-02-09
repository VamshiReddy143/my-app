import mongoose, { Schema, Types, Document } from "mongoose";

interface ICommunity extends Document {
  name: string;
  description: string;
  image?: string;
  members: Types.ObjectId[]; 
  posts: Types.ObjectId[]; 
}

const CommunitySchema = new Schema<ICommunity>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    image: { type: String }, 
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }], 
  },
  { timestamps: true }
);

const Community = mongoose.models.Community || mongoose.model<ICommunity>("Community", CommunitySchema);
export default Community;