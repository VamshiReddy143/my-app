import { dbConnect } from "@/lib/mongodb";
import Community from "@/models/community";
import { NextRequest, NextResponse } from "next/server";



export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const query = req.nextUrl.searchParams.get("q"); // Get the search query

    if (!query) {
      return NextResponse.json({ success: false, message: "Search query is required" }, { status: 400 });
    }

    // Find communities matching the query (case-insensitive)
    const communities = await Community.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    })
      .select("name image") // Select only necessary fields
      .limit(10); // Limit results to 10

    return NextResponse.json({ success: true, communities }, { status: 200 });
  } catch (error) {
    console.error("GET Communities Search Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}