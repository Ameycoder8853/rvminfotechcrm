import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Lead from "@/models/Lead";
import Ticket from "@/models/Ticket";
import Order from "@/models/Order";
import Expense from "@/models/Expense";
import Attendance from "@/models/Attendance";
import User from "@/models/User";
import Organization from "@/models/Organization";
import DiaryEntry from "@/models/DiaryEntry";
import { getOrCreateDbUser } from "@/lib/get-or-create-user";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();

    const dbUser = await getOrCreateDbUser();
    if (!dbUser) return NextResponse.json({ error: "User profile not found" }, { status: 404 });

    // Populate teamId to access permission rules
    const populatedUser = await User.findById(dbUser._id).populate("teamId").lean();
    if (!populatedUser) return NextResponse.json({ error: "User details not found" }, { status: 404 });

    const isSuperAdmin = populatedUser.roleTier === "super_admin";
    const isAdmin = populatedUser.roleTier === "admin" || isSuperAdmin;

    const perms = (populatedUser.teamId as any)?.permissions || {
      leads: "all",
      customers: "all",
      invoices: "all",
      tickets: "all",
    };

    const hasLeadsAccess = isAdmin || perms.leads !== "none";
    const hasTicketsAccess = isAdmin || perms.tickets !== "none";
    const hasInvoicesAccess = isAdmin || perms.invoices !== "none";

    // Build hierarchical query filters
    let leadFilter: any = {};
    let ticketFilter: any = {};
    let orderFilter: any = {};
    let expenseFilter: any = {};
    let attendanceFilter: any = {};

    const impersonateOrgId = req.cookies.get("rvm_impersonate_org_id")?.value;

    if (isSuperAdmin) {
      if (impersonateOrgId) {
        const targetOrgId = new mongoose.Types.ObjectId(impersonateOrgId);
        leadFilter = { orgId: targetOrgId };
        ticketFilter = { orgId: targetOrgId };
        orderFilter = { orgId: targetOrgId };
        expenseFilter = { orgId: targetOrgId };
        attendanceFilter = { orgId: targetOrgId };
      }
    } else {
      if (populatedUser.orgId) {
        const orgUsers = await User.find({ orgId: populatedUser.orgId }).select("_id");
        const orgUserIds = orgUsers.map(u => u._id);

        if (isAdmin) {
          leadFilter = { $or: [{ assignedTo: { $in: orgUserIds } }, { createdBy: { $in: orgUserIds } }] };
          ticketFilter = { $or: [{ assignedTech: { $in: orgUserIds } }, { createdBy: { $in: orgUserIds } }] };
          orderFilter = { $or: [{ assignedTo: { $in: orgUserIds } }, { createdBy: { $in: orgUserIds } }] };
          expenseFilter = { user: { $in: orgUserIds } };
          attendanceFilter = { user: { $in: orgUserIds } };
        } else if (populatedUser.roleTier === "senior" && populatedUser.teamId) {
          const teamUsers = await User.find({ teamId: populatedUser.teamId }).select("_id");
          const teamUserIds = teamUsers.map(u => u._id);

          leadFilter = { $or: [{ assignedTo: { $in: teamUserIds } }, { createdBy: { $in: teamUserIds } }] };
          ticketFilter = { $or: [{ assignedTech: { $in: teamUserIds } }, { createdBy: { $in: teamUserIds } }] };
          orderFilter = { $or: [{ assignedTo: { $in: teamUserIds } }, { createdBy: { $in: teamUserIds } }] };
          expenseFilter = { user: { $in: teamUserIds } };
          attendanceFilter = { user: { $in: teamUserIds } };
        } else {
          // Junior rep is strictly isolated to their own records
          leadFilter = { $or: [{ assignedTo: populatedUser._id }, { createdBy: populatedUser._id }] };
          ticketFilter = { $or: [{ assignedTech: populatedUser._id }, { createdBy: populatedUser._id }] };
          orderFilter = { $or: [{ assignedTo: populatedUser._id }, { createdBy: populatedUser._id }] };
          expenseFilter = { user: populatedUser._id };
          attendanceFilter = { user: populatedUser._id };
        }
      } else {
        // Safe fallback: no org, no records
        leadFilter = { _id: new mongoose.Types.ObjectId() };
        ticketFilter = { _id: new mongoose.Types.ObjectId() };
        orderFilter = { _id: new mongoose.Types.ObjectId() };
        expenseFilter = { _id: new mongoose.Types.ObjectId() };
        attendanceFilter = { _id: new mongoose.Types.ObjectId() };
      }
    }

    // Today's range for attendance checks
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      totalLeads,
      openTickets,
      pendingOrders,
      pendingExpensesResult,
      activeAgents,
      monthlyRevenueResult,
      recentLeadsResult,
      ticketsPriorityResult
    ] = await Promise.all([
      // 1. Leads Count
      hasLeadsAccess ? Lead.countDocuments(leadFilter) : Promise.resolve(0),
      
      // 2. Open Tickets Count
      hasTicketsAccess ? Ticket.countDocuments({ ...ticketFilter, status: { $ne: "resolved" } }) : Promise.resolve(0),
      
      // 3. Pending Orders Count
      hasInvoicesAccess ? Order.countDocuments({ ...orderFilter, status: "pending" }) : Promise.resolve(0),
      
      // 4. Pending Expenses Aggregate Sum
      hasInvoicesAccess ? Expense.aggregate([
        { $match: { ...expenseFilter, status: "pending" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]) : Promise.resolve([]),
      
      // 5. Active Agents (Attendance check-ins today)
      Attendance.countDocuments({ 
        ...attendanceFilter,
        type: "check_in", 
        timestamp: { $gte: todayStart, $lte: todayEnd } 
      }),
      
      // 6. Monthly Revenue (Delivered Orders totalValue sum)
      hasInvoicesAccess ? Order.aggregate([
        { $match: { ...orderFilter, status: "delivered" } },
        { $group: { _id: null, total: { $sum: "$totalValue" } } }
      ]) : Promise.resolve([]),
      
      // 7. Recent Leads
      hasLeadsAccess ? Lead.find(leadFilter).sort({ createdAt: -1 }).limit(5).populate("customer", "company").lean() : Promise.resolve([]),
      
      // 8. Tickets Priority Aggregation
      hasTicketsAccess ? Ticket.aggregate([
        { $match: ticketFilter },
        { $group: { _id: "$priority", count: { $sum: 1 } } }
      ]) : Promise.resolve([])
    ]);

    const pendingExpenses = pendingExpensesResult[0]?.total || 0;
    const monthlyRevenue = monthlyRevenueResult[0]?.total || 0;
    
    const recentLeads = recentLeadsResult.map((l: any) => ({
      name: (l.customer as any)?.company || l.company || "Unknown",
      value: `₹${l.value?.toLocaleString() || 0}`,
      status: l.status,
      rep: "Staff" // Placeholder
    }));
    
    const ticketsByPriority = ticketsPriorityResult.map((p: any) => ({
      priority: p._id ? (p._id.charAt(0).toUpperCase() + p._id.slice(1)) : "Unknown",
      count: p.count
    }));

    // ==========================================
    // Role-specific Extra Stats Data
    // ==========================================
    let extraStats: any = {};

    if (isSuperAdmin) {
      const orgs = await Organization.find().lean();
      const orgList = await Promise.all(orgs.map(async (org) => {
        const userCount = await User.countDocuments({ orgId: org._id, isActive: true });
        return {
          _id: org._id,
          name: org.name,
          slug: org.slug,
          status: org.status,
          userCount
        };
      }));
      extraStats = {
        totalOrganizations: orgs.length,
        totalUsers: await User.countDocuments({ isActive: true }),
        organizations: orgList
      };
    } else if (populatedUser.roleTier === "senior" && populatedUser.teamId) {
      const teamMembers = await User.find({ teamId: populatedUser.teamId }).lean();
      const teamRoster = await Promise.all(teamMembers.map(async (member) => {
        const attendance = await Attendance.findOne({ 
          user: member._id,
          type: "check_in",
          timestamp: { $gte: todayStart, $lte: todayEnd }
        }).lean();
        return {
          _id: member._id,
          firstName: member.firstName,
          lastName: member.lastName,
          role: member.role,
          roleTier: member.roleTier,
          phone: member.phone,
          avatar: member.avatar,
          checkedIn: !!attendance,
          checkInTime: attendance ? attendance.timestamp : null
        };
      }));
      extraStats = {
        teamRoster
      };
    } else if (populatedUser.roleTier === "junior") {
      const myTasks = await DiaryEntry.find({ user: populatedUser._id })
        .sort({ date: 1 })
        .limit(5)
        .lean();
      extraStats = {
        myTasks: myTasks.map(t => ({
          _id: t._id,
          title: t.title,
          description: t.description,
          type: t.type,
          date: t.date,
          startTime: t.startTime,
          endTime: t.endTime,
          isCompleted: t.isCompleted
        }))
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        totalLeads,
        openTickets,
        pendingOrders,
        pendingExpenses,
        activeAgents,
        monthlyRevenue,
        recentLeads,
        ticketsByPriority,
        ...extraStats
      }
    });
  } catch (error) {
    console.error("GET /api/dashboard/stats error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
