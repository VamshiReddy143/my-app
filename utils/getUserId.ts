import mongoose from "mongoose";
import User from "@/models/user";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";

export const getUserId = async () => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  let userId: string | mongoose.Types.ObjectId = session.user.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const existingUser = await User.findOne({ email: session.user.email }).select("_id");
    if (!existingUser) {
      throw new Error("User not found");
    }
    userId = existingUser._id;
  } else {
    userId = new mongoose.Types.ObjectId(userId);
  }

  return userId;
};
