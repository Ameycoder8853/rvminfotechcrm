import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Contact from "@/models/Contact";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();
    const contact = await Contact.findById(id).lean();

    if (!contact) return NextResponse.json({ error: "Contact not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: contact });
  } catch (error) {
    console.error("GET /api/contacts/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();
    const body = await req.json();
    
    const contact = await Contact.findByIdAndUpdate(id, body, { new: true });

    if (!contact) return NextResponse.json({ error: "Contact not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: contact });
  } catch (error) {
    console.error("PATCH /api/contacts/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();

    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) return NextResponse.json({ error: "Contact not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Contact deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/contacts/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
