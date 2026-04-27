import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Lead from "@/models/Lead";
import Ticket from "@/models/Ticket";
import Order from "@/models/Order";
import Expense from "@/models/Expense";
import Attendance from "@/models/Attendance";
import Contact from "@/models/Contact";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();

    // Today's range
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      totalLeads,
      openTickets,
      pendingOrders,
      pendingExpenses,
      activeAgents,
      monthlyRevenue,
      recentLeads,
      ticketsPriority
    ] = await Promise.all([
      Lead.countDocuments(),
      Ticket.countDocuments({ status: { $ne: "resolved" } }),
      Order.countDocuments({ status: "pending" }),
      Expense.aggregate([
        { $match: { status: "pending" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Attendance.countDocuments({ 
        type: "check_in", 
        timestamp: { $gte: todayStart, $lte: todayEnd } 
      }),
      Order.aggregate([
        { $match: { status: "delivered" } }, // Delivered orders count as revenue
        { $group: { _id: null, total: { $sum: "$totalValue" } } }
      ]),
      Lead.find().sort({ createdAt: -1 }).limit(5).populate("customer", "company").lean(),
      Ticket.aggregate([
        { $group: { _id: "$priority", count: { $sum: 1 } } }
      ])
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalLeads,
        openTickets,
        pendingOrders,
        pendingExpenses: pendingExpenses[0]?.total || 0,
        activeAgents,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        recentLeads: recentLeads.map(l => ({
          name: (l.customer as any)?.company || "Unknown",
          value: `₹${l.value?.toLocaleString() || 0}`,
          status: l.status,
          rep: "Staff" // Placeholder
        })),
        ticketsByPriority: ticketsPriority.map(p => ({
          priority: p._id ? (p._id.charAt(0).toUpperCase() + p._id.slice(1)) : "Unknown",
          count: p.count
        }))
      }
    });
  } catch (error) {
    console.error("GET /api/dashboard/stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
