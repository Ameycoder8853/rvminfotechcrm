import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import { getScopedFilter } from "@/lib/rbac-filter";
import { getOrCreateDbUser } from "@/lib/get-or-create-user";

// GET /api/customers/[id]
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
    const customer = await Customer.findOne({ _id: id, ...baseFilter }).populate("assignedTo", "firstName lastName").lean();

    if (!customer) return NextResponse.json({ error: "Customer not found or access denied" }, { status: 404 });

    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    console.error("GET /api/customers/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/customers/[id]
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
    const customer = await Customer.findOneAndUpdate({ _id: id, ...baseFilter }, body, { new: true }).populate("assignedTo", "firstName lastName");

    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    console.error("PATCH /api/customers/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/customers/[id]
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

    const customer = await Customer.findOneAndDelete({ _id: id, ...baseFilter });

    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/customers/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
