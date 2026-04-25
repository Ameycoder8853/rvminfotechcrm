import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Contact from "@/models/Contact";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    const filter: Record<string, unknown> = {};
    if (search) filter.$text = { $search: search };

    const [contacts, total] = await Promise.all([
      Contact.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Contact.countDocuments(filter),
    ]);

    return NextResponse.json({ success: true, data: contacts, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("GET /api/contacts error:", error);
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
    const contact = await Contact.create({ ...body, createdBy: dbUser._id });

    return NextResponse.json({ success: true, data: contact }, { status: 201 });
  } catch (error) {
    console.error("POST /api/contacts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
