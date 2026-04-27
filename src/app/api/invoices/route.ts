import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import { generateId } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const invoices = await Invoice.find()
      .populate("customer", "firstName lastName company")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: invoices });
  } catch (error) {
    console.error("GET /api/invoices error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const body = await req.json();
    
    const invoiceNumber = generateId("INV");
    
    const invoice = await Invoice.create({
      ...body,
      invoiceNumber,
    });

    return NextResponse.json({ success: true, data: invoice }, { status: 201 });
  } catch (error) {
    console.error("POST /api/invoices error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
