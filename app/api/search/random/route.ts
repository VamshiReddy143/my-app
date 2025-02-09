import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import User from "@/models/user";
import Community from "@/models/community";

import { authOptions } from "../../auth/authOptions";
import { dbConnect } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // ✅ Get the user session
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id; // ✅ Extract user ID from session

    const usersQuery = [{ $sample: { size: 10 } }]; // Get more users first
    if (userId) {
      usersQuery.push({ $match: { _id: { $ne: userId } } }); // ✅ Exclude logged-in user
    }

    const users = await User.aggregate(usersQuery).limit(5); // Take first 5 after filtering
    const communities = await Community.aggregate([{ $sample: { size: 5 } }]);

    return NextResponse.json({ users, communities }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users and communities:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
