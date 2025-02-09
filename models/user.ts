import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  image?:string;
  followers?:string[];
  following?:string[];
  posts?:string[];
  googleId?:string
}

const userSchema = new Schema<IUser>(
  {
    googleId: { type: String, unique: true, sparse: true },
    image:{type:String,default:""},
    email: { type: String, required: true, unique: true },
    password: { type: String },
    name: { type: String,required:true },
    followers:[{type:Schema.Types.ObjectId,ref:"User"}],
    following:[{type:Schema.Types.ObjectId,ref:"User"}],
    posts:[{type:Schema.Types.ObjectId,ref:"Post"}]
  },
  { timestamps: true }
);



const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
