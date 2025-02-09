import { NextResponse } from "next/server";

import User from "@/models/user";
import Community from "@/models/community";
import { dbConnect } from "@/lib/mongodb";


export async function GET(req: Request) {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const query = url.searchParams.get("q");
    if (!query) {
      return NextResponse.json({ users: [], communities: [] }, { status: 200 });
    }

    // Search for users and communities matching the query
    const users = await User.find({ name: { $regex: query, $options: "i" } }).limit(5);
    const communities = await Community.find({ name: { $regex: query, $options: "i" } }).limit(5);

    return NextResponse.json({ users, communities }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
