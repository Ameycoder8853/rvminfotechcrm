import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import User from "@/models/User";
import { getOrCreateDbUser } from "@/lib/get-or-create-user";
import { getScopedFilter, getWriteOrgId } from "@/lib/rbac-filter";

// GET /api/contacts — List contacts with pre-seeding matching the screenshot
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const search = searchParams.get("search") || "";
    const filterStatus = searchParams.get("status") || "";

    // Fetch all contacts according to standard filters

    const baseFilter = await getScopedFilter(req, dbUser);
    const filter: Record<string, any> = { ...baseFilter };

    if (search) {
      const searchConditions = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
      if (filter.$or) {
        const existingOr = filter.$or;
        delete filter.$or;
        filter.$and = [
          { $or: existingOr },
          { $or: searchConditions }
        ];
      } else {
        filter.$or = searchConditions;
      }
    }

    if (filterStatus) {
      filter.status = filterStatus;
    }

    const [contacts, total] = await Promise.all([
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
      data: contacts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/contacts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/contacts — Create single contact or bulk import from CSV
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();

    // Check if bulk array import
    const writeOrgId = getWriteOrgId(req, dbUser);
    if (Array.isArray(body)) {
      const formatted = body.map((item: any) => {
        const emails = item.email ? [item.email] : (item.emails || []);
        const phones = item.phone ? [item.phone] : (item.phones || []);
        return {
          firstName: item.firstName || "Imported",
          lastName: item.lastName || "",
          company: item.company || "",
          email: item.email || emails[0] || "",
          phone: item.phone || phones[0] || "",
          city: item.city || item.address?.city || "",
          status: item.status || "Lead",
          source: item.source || "website",
          gender: item.gender || "",
          state: item.state || "",
          district: item.district || "",
          subLocation: item.subLocation || "",
          department: item.department || "",
          designation: item.designation || "",
          workAddress: item.workAddress || "",
          workPhone: item.workPhone || "",
          workPinCode: item.workPinCode || "",
          websiteUrl: item.websiteUrl || "",
          product: item.product || "",
          category: item.category || "",
          subCategory: item.subCategory || "",
          reference: item.reference || "",
          classification: item.classification || "",
          group: item.group || "",
          zone: item.zone || "",
          contactType: item.contactType || "",
          dob: item.dob || "",
          planDate: item.planDate || "",
          planActionType: item.planActionType || "",
          remarks: item.remarks || "",
          additionalNotes: item.additionalNotes || "",
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
          orgId: writeOrgId,
        };
      });

      const inserted = await Customer.insertMany(formatted);
      return NextResponse.json({ success: true, count: inserted.length, data: inserted }, { status: 201 });
    }

    // Single contact creation
    if (body.email) body.emails = [body.email];
    if (body.phone) body.phones = [body.phone];
    if (body.city) {
      body.address = {
        ...body.address,
        city: body.city,
      };
    }
    const contact = await Customer.create({
      ...body,
      createdBy: dbUser._id,
      assignedTo: body.assignedTo || dbUser._id,
      orgId: writeOrgId,
    });

    return NextResponse.json({ success: true, data: contact }, { status: 201 });
  } catch (error) {
    console.error("POST /api/contacts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
