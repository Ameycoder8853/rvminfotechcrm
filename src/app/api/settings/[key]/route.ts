import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Setting from "@/models/Setting";
import { getOrCreateDbUser } from "@/lib/get-or-create-user";
import { getWriteOrgId } from "@/lib/rbac-filter";

const DEFAULT_SETTINGS: Record<string, any[]> = {
  settings_specializations: [
    { _id: "spec1", name: "Development", description: "Web and mobile application development", category: "Technology", level: "Expert", experience: "5 years", certRequired: true, salary: 95000, professionals: 245, demandLevel: "High", status: "Active" },
    { _id: "spec2", name: "Marketing", description: "Social media marketing and content strategy", category: "Marketing", level: "Intermediate", experience: "3 years", certRequired: false, salary: 65000, professionals: 189, demandLevel: "Medium", status: "Active" },
    { _id: "spec3", name: "Analytics", description: "Data modeling, statistical analysis and data visualization", category: "Analytics", level: "Expert", experience: "4 years", certRequired: true, salary: 110000, professionals: 156, demandLevel: "High", status: "Active" },
    { _id: "spec4", name: "Management", description: "Agile and traditional project management", category: "Management", level: "Intermediate", experience: "3 years", certRequired: true, salary: 85000, professionals: 312, demandLevel: "Medium", status: "Active" }
  ],
  settings_qualifications: [
    { _id: "q1", name: "Bachelor of Science in Computer Science", category: "Undergraduate", level: "Bachelor", field: "Computer Science", duration: "4 years" },
    { _id: "q2", name: "Master of Business Administration", category: "Postgraduate", level: "Master", field: "Business Administration", duration: "2 years" },
    { _id: "q3", name: "Certified Public Accountant (CPA)", category: "Professional Certification", level: "Professional", field: "Accounting", duration: "1 year" }
  ],
  settings_products: [
    { _id: "p1", name: "Software License", code: "SL-101", category: "Software", price: 49999, tax: "18%", status: "Active" },
    { _id: "p2", name: "Hardware Rack Integration", code: "HWR-202", category: "Hardware", price: 150000, tax: "18%", status: "Active" },
    { _id: "p3", name: "AMC Plan Annual", code: "AMC-303", category: "Service", price: 25000, tax: "18%", status: "Active" },
    { _id: "p4", name: "Networking Switch Setup", code: "NET-404", category: "Installation", price: 15000, tax: "18%", status: "Active" }
  ],
  settings_categories: [
    { _id: "c1", name: "Corporate Client", status: "Active" },
    { _id: "c2", name: "Government Entity", status: "Active" },
    { _id: "c3", name: "Retail Customer", status: "Active" }
  ],
  settings_sources: [
    { _id: "so1", name: "Google Search", status: "Active" },
    { _id: "so2", name: "Social Media Campaign", status: "Active" },
    { _id: "so3", name: "Customer Referral", status: "Active" }
  ],
  settings_locations: [
    { _id: "l1", name: "Mumbai", status: "Active" },
    { _id: "l2", name: "Delhi NCR", status: "Active" },
    { _id: "l3", name: "Bengaluru", status: "Active" }
  ],
  settings_stages: [
    { _id: "s1", name: "New Lead", status: "Active" },
    { _id: "s2", name: "Contacted", status: "Active" },
    { _id: "s3", name: "Qualified Proposal", status: "Active" }
  ],
  settings_complaints: [
    { _id: "cp1", name: "Product Delivery Delay", status: "Active" },
    { _id: "cp2", name: "Software License Issue", status: "Active" }
  ],
  settings_transports: [
    { _id: "tr1", name: "Air Freight", status: "Active" },
    { _id: "tr2", name: "Local Courier", status: "Active" }
  ],
  settings_expenseHeads: [
    { _id: "ex1", name: "Travel Allowance", status: "Active" },
    { _id: "ex2", name: "Office Supplies", status: "Active" }
  ],
  settings_countries: [
    { _id: "cn1", name: "India", status: "Active" },
    { _id: "cn2", name: "United States", status: "Active" }
  ],
  settings_definableMasters: [
    { _id: "dm1", name: "Custom Project Parameter", status: "Active" }
  ],
  settings_definableParameters: [
    { _id: "dp1", name: "Contract Expiration Period", status: "Active" }
  ],
  settings_districts: [
    { _id: "d1", name: "Pune District", status: "Active" },
    { _id: "d2", name: "Gurugram", status: "Active" }
  ],
  settings_serviceProviders: [
    { _id: "sp1", name: "Logistics Partner A", status: "Active" },
    { _id: "sp2", name: "AWS Cloud Support", status: "Active" }
  ],
  settings_features: [
    { _id: "f1", name: "Automatic Invoicing", status: "Active" },
    { _id: "f2", name: "WhatsApp Reminders", status: "Active" }
  ],
  settings_competitors: [
    { _id: "cmp1", name: "Competitor CRM Ltd", status: "Active" }
  ],
  settings_followTypes: [
    { _id: "ft1", name: "Call", status: "Active" },
    { _id: "ft2", name: "Email", status: "Active" },
    { _id: "ft3", name: "Meeting", status: "Active" },
    { _id: "ft4", name: "SMS", status: "Active" },
    { _id: "ft5", name: "WhatsApp", status: "Active" }
  ],
  settings_taskTypesMaster: [
    { _id: "tt1", name: "Sales Demo", status: "Active" },
    { _id: "tt2", name: "Support Ticket", status: "Active" },
    { _id: "tt3", name: "AMC Service", status: "Active" },
    { _id: "tt4", name: "Installation", status: "Active" }
  ],
  settings_reasonsCollection: [
    { _id: "rc1", name: "AMC Renewal", status: "Active" },
    { _id: "rc2", name: "Advance Payment", status: "Active" },
    { _id: "rc3", name: "Final Delivery", status: "Active" }
  ],
  settings_biReports: [
    { _id: "bi1", name: "Monthly Revenue", status: "Active" },
    { _id: "bi2", name: "Ticket Resolution SLA", status: "Active" },
    { _id: "bi3", name: "Expense Breakdown", status: "Active" }
  ],
  settings_serviceTypes: [
    { _id: "st1", name: "Corrective Maintenance", status: "Active" },
    { _id: "st2", name: "Preventive Maintenance", status: "Active" },
    { _id: "st3", name: "AMC Support", status: "Active" }
  ]
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { key } = await params;
    await connectToDatabase();
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const orgId = getWriteOrgId(req, dbUser);
    if (!orgId) return NextResponse.json({ error: "Organization context not found" }, { status: 400 });

    let record = await Setting.findOne({ key, orgId });

    if (!record) {
      // Seed default settings on first load if default config is available
      const defaultValue = DEFAULT_SETTINGS[key] || [];
      record = await Setting.create({
        key,
        value: defaultValue,
        orgId,
        updatedBy: dbUser._id
      });
    }

    return NextResponse.json({ success: true, data: record.value });
  } catch (error) {
    console.error("GET /api/settings/[key] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { key } = await params;
    await connectToDatabase();
    const dbUser = await getOrCreateDbUser();
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const orgId = getWriteOrgId(req, dbUser);
    if (!orgId) return NextResponse.json({ error: "Organization context not found" }, { status: 400 });

    const body = await req.json();

    const record = await Setting.findOneAndUpdate(
      { key, orgId },
      { value: body, updatedBy: dbUser._id },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, data: record.value });
  } catch (error) {
    console.error("POST /api/settings/[key] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
