import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import { getOrCreateDbUser } from "@/lib/get-or-create-user";

// GET /api/contacts/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();
    
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const contact = await Customer.findById(id).populate("assignedTo", "firstName lastName").lean();
    if (!contact) return NextResponse.json({ error: "Contact not found" }, { status: 404 });

    // BOLA/IDOR checks
    if (dbUser.roleTier === "junior" && String(contact.assignedTo?._id || contact.assignedTo) !== String(dbUser._id)) {
      return NextResponse.json({ error: "Forbidden: Access Denied" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: contact });
  } catch (error) {
    console.error("GET /api/contacts/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/contacts/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();
    
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const existing = await Customer.findById(id);
    if (!existing) return NextResponse.json({ error: "Contact not found" }, { status: 404 });

    // BOLA/IDOR checks
    if (dbUser.roleTier === "junior" && String(existing.assignedTo) !== String(dbUser._id)) {
      return NextResponse.json({ error: "Forbidden: Access Denied" }, { status: 403 });
    }

    const body = await req.json();

    if (body.email) body.emails = [body.email];
    if (body.phone) body.phones = [body.phone];
    if (body.city) {
      body.address = {
        ...body.address,
        city: body.city,
      };
    }

    const contact = await Customer.findByIdAndUpdate(id, body, { new: true })
      .populate("assignedTo", "firstName lastName");

    return NextResponse.json({ success: true, data: contact });
  } catch (error) {
    console.error("PATCH /api/contacts/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/contacts/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectToDatabase();
    
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const existing = await Customer.findById(id);
    if (!existing) return NextResponse.json({ error: "Contact not found" }, { status: 404 });

    // BOLA/IDOR checks
    if (dbUser.roleTier === "junior" && String(existing.assignedTo) !== String(dbUser._id)) {
      return NextResponse.json({ error: "Forbidden: Access Denied" }, { status: 403 });
    }

    await Customer.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Contact deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/contacts/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
