import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Quote from "@/models/Quote";
import User from "@/models/User";
import { generateId } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const [quotes, total] = await Promise.all([
      Quote.find().populate("customer", "firstName lastName company").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Quote.countDocuments(),
    ]);

    return NextResponse.json({ success: true, data: quotes, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("GET /api/quotes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const quote = await Quote.create({
      ...body,
      quoteNumber: generateId("QT"),
      createdBy: dbUser._id,
    });

    return NextResponse.json({ success: true, data: quote }, { status: 201 });
  } catch (error) {
    console.error("POST /api/quotes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
