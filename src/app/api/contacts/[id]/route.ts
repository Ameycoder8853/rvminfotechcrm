import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import { getOrCreateDbUser } from "@/lib/get-or-create-user";
import { getScopedFilter } from "@/lib/rbac-filter";

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
    const baseFilter = await getScopedFilter(req, dbUser);

    const contact = await Customer.findOne({ _id: id, ...baseFilter }).populate("assignedTo", "firstName lastName").lean();
    if (!contact) return NextResponse.json({ error: "Contact not found or access denied" }, { status: 404 });

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
    const baseFilter = await getScopedFilter(req, dbUser);

    const existing = await Customer.findOne({ _id: id, ...baseFilter });
    if (!existing) return NextResponse.json({ error: "Contact not found or access denied" }, { status: 404 });

    const body = await req.json();
    delete body.orgId;

    if (body.email) body.emails = [body.email];
    if (body.phone) body.phones = [body.phone];
    if (body.city) {
      body.address = {
        ...body.address,
        city: body.city,
      };
    }

    const contact = await Customer.findOneAndUpdate({ _id: id, ...baseFilter }, body, { new: true })
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
    const baseFilter = await getScopedFilter(req, dbUser);

    const deletedContact = await Customer.findOneAndDelete({ _id: id, ...baseFilter });
    if (!deletedContact) return NextResponse.json({ error: "Contact not found or access denied" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Contact deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/contacts/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
