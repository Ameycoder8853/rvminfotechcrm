import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import User from "@/models/User";
import { getOrCreateDbUser } from "@/lib/get-or-create-user";

// GET /api/customers — List customers with team filtering
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "1000"); // Allow fetching all for large lists
    const search = searchParams.get("search") || "";

    const filter: Record<string, any> = {};
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Role-Based Access Control (RBAC) Hierarchical Filtering
    if (dbUser.roleTier === "junior") {
      // Juniors only see customers assigned directly to them
      filter.assignedTo = dbUser._id;
    } else if (dbUser.roleTier === "senior" && dbUser.teamId) {
      // Seniors see all customers assigned to users in their team
      const teamUserIds = await User.find({ teamId: dbUser.teamId }).select("_id");
      filter.$or = filter.$or || [];
      filter.$or.push(
        { assignedTo: { $in: teamUserIds.map((u) => u._id) } },
        { createdBy: { $in: teamUserIds.map((u) => u._id) } }
      );
    }

    const [customers, total] = await Promise.all([
      Customer.find(filter)
        .populate("assignedTo", "firstName lastName")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Customer.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: customers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/customers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/customers — Create a single customer or bulk import from CSV
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();

    // Check if it's a bulk array import
    if (Array.isArray(body)) {
      const formatted = body.map((item: any) => {
        const emails = item.email ? [item.email] : (item.emails || []);
        const phones = item.phone ? [item.phone] : (item.phones || []);
        return {
          firstName: item.firstName || "Imported",
          lastName: item.lastName || "Customer",
          company: item.company || "",
          email: item.email || emails[0] || "",
          phone: item.phone || phones[0] || "",
          city: item.city || item.address?.city || "",
          emails,
          phones,
          address: {
            street: item.street || item.address?.street || "",
            city: item.city || item.address?.city || "",
            state: item.state || item.address?.state || "",
            zip: item.zip || item.address?.zip || "",
            country: item.country || item.address?.country || "India",
          },
          createdBy: dbUser._id,
          assignedTo: item.assignedTo || dbUser._id,
        };
      });

      const inserted = await Customer.insertMany(formatted);
      return NextResponse.json({ success: true, count: inserted.length, data: inserted }, { status: 201 });
    }

    // Single customer creation
    if (body.email) body.emails = [body.email];
    if (body.phone) body.phones = [body.phone];
    if (body.city) {
      body.address = {
        ...body.address,
        city: body.city,
      };
    }
    const customer = await Customer.create({
      ...body,
      createdBy: dbUser._id,
      assignedTo: body.assignedTo || dbUser._id,
    });

    return NextResponse.json({ success: true, data: customer }, { status: 201 });
  } catch (error) {
    console.error("POST /api/customers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
