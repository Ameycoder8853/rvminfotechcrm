"use client";

import StatsCard from "@/components/dashboard/stats-card";
import StatusBadge from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import {
  Target,
  TrendingUp,
  Ticket,
  Users,
  IndianRupee,
  ShoppingCart,
  Receipt,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface AdminDashboardProps {
  stats: any;
  currentUser: any;
}

// Custom Tooltip for charts
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="text-[var(--foreground)] font-semibold mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-[var(--foreground-secondary)]">
          {entry.name}: <span className="text-[var(--foreground)] font-medium">
            {entry.name === "revenue" ? `₹${(entry.value / 1000).toFixed(0)}K` : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
}

export default function AdminDashboard({ stats, currentUser }: AdminDashboardProps) {
  // Defensive checks
  const rawTeam = currentUser?.teamId;
  const perms = (rawTeam && typeof rawTeam === "object" && "permissions" in rawTeam)
    ? (rawTeam.permissions as any)
    : null;

  const isAdmin = currentUser?.roleTier === "admin" || currentUser?.roleTier === "super_admin";
  const isSuperAdmin = currentUser?.roleTier === "super_admin";

  const hasLeads = isAdmin || isSuperAdmin || perms?.leads !== "none";
  const hasTickets = isAdmin || isSuperAdmin || perms?.tickets !== "none";
  const hasInvoices = isAdmin || isSuperAdmin || perms?.invoices !== "none";
  const hasModuleHealth = hasInvoices || hasLeads || hasTickets;

  // Placeholder trend data (quarterly aggregation)
  const revenueTrend = [
    { month: "Jan", revenue: 150000 },
    { month: "Feb", revenue: 280000 },
    { month: "Mar", revenue: 190000 },
    { month: "Apr", revenue: stats?.monthlyRevenue || 0 },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-4xl font-black text-[var(--foreground)] tracking-tight">
            Command Center
          </h1>
          <p className="text-sm text-[var(--foreground-secondary)] mt-1 font-medium">
            Real-time business intelligence for RVM Infotech.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-sm">
          <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
          <span className="text-xs font-bold text-[var(--foreground-secondary)] uppercase tracking-wider">Live System Status</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {hasLeads && (
          <StatsCard
            title="Total Leads"
            value={stats?.totalLeads || 0}
            change="+4.2%"
            changeType="positive"
            description="active opportunities"
            icon={Target}
            iconColor="#6366f1"
          />
        )}
        {hasInvoices && (
          <StatsCard
            title="Monthly Revenue"
            value={`₹${((stats?.monthlyRevenue || 0) / 100000).toFixed(1)}L`}
            change="+12.5%"
            changeType="positive"
            description="gross sales"
            icon={IndianRupee}
            iconColor="#22c55e"
          />
        )}
        {hasTickets && (
          <StatsCard
            title="Open Tickets"
            value={stats?.openTickets || 0}
            change="-2"
            changeType="positive"
            description="awaiting resolution"
            icon={Ticket}
            iconColor="#f59e0b"
          />
        )}
        <StatsCard
          title="Field Agents"
          value={stats?.activeAgents || 0}
          change="Live"
          changeType="neutral"
          description="checked in today"
          icon={Users}
          iconColor="#3b82f6"
        />
      </div>

      {/* Charts Row */}
      {(hasInvoices || hasTickets) && (
        <div className={cn(
          "grid grid-cols-1 gap-6",
          hasInvoices && hasTickets ? "lg:grid-cols-3" : "lg:grid-cols-1"
        )}>
          {/* Revenue Trend */}
          {hasInvoices && (
            <div className={cn(
              "bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm card-hover",
              hasTickets ? "lg:col-span-2" : ""
            )}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">
                    Revenue Trajectory
                  </h3>
                  <p className="text-xs text-[var(--foreground-muted)] mt-1 font-medium">
                    Sales performance over current quarter
                  </p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueTrend}>
                  <defs>
                    <linearGradient id="adminRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "var(--foreground-muted)", fontSize: 10, fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "var(--foreground-muted)", fontSize: 10, fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${v / 1000}K`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--accent)"
                    strokeWidth={3}
                    fill="url(#adminRevenueGradient)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Priority Distribution */}
          {hasTickets && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm card-hover">
              <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider mb-1">
                Ticket Priority
              </h3>
              <p className="text-xs text-[var(--foreground-muted)] mb-8 font-medium">
                Resolution focus distribution
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats?.ticketsByPriority || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="priority"
                    tick={{ fill: "var(--foreground-secondary)", fontSize: 10, fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip
                    cursor={{ fill: 'var(--background-secondary)', opacity: 0.4 }}
                    contentStyle={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      fontSize: "10px",
                      fontWeight: 700
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="var(--accent)" 
                    radius={[0, 6, 6, 0]} 
                    barSize={18}
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-6 pt-6 border-t border-[var(--border)]">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest">Efficiency</span>
                    <span className="text-xs font-bold text-[var(--success)]">84%</span>
                 </div>
                 <div className="w-full bg-[var(--background-secondary)] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[var(--success)] h-full w-[84%] rounded-full shadow-[0_0_8px_var(--success)]" />
                 </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Row */}
      {(hasLeads || hasModuleHealth) && (
        <div className={cn(
          "grid grid-cols-1 gap-6",
          hasLeads && hasModuleHealth ? "lg:grid-cols-2" : ""
        )}>
          {/* Top Leads */}
          {hasLeads && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm card-hover">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">
                  High-Value Leads
                </h3>
                <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest cursor-pointer hover:underline">View Pipeline</span>
              </div>
              <div className="space-y-4">
                {(stats?.recentLeads || []).map((lead: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-[var(--background-secondary)]/30 rounded-xl border border-[var(--border)] hover:border-[var(--accent)] transition-all cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[var(--foreground)] truncate group-hover:text-[var(--accent)] transition-colors">
                        {lead.name}
                      </p>
                      <p className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest mt-0.5">
                        Est. Value: <span className="text-[var(--foreground-secondary)]">{lead.value}</span>
                      </p>
                    </div>
                    <StatusBadge status={lead.status} />
                  </div>
                ))}
                {(!stats?.recentLeads || stats?.recentLeads.length === 0) && (
                  <p className="text-center py-10 text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-widest">No active leads in pipeline</p>
                )}
              </div>
            </div>
          )}

          {/* Module Health */}
          {hasModuleHealth && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm card-hover">
               <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider mb-6">
                Module Health
              </h3>
              <div className="grid grid-cols-2 gap-4">
                 {hasInvoices && (
                   <div className="p-4 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border)]">
                      <Receipt className="w-5 h-5 text-[var(--danger)] mb-2" />
                      <p className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest">Pending Claims</p>
                      <p className="text-xl font-black text-[var(--foreground)] mt-1">₹{((stats?.pendingExpenses || 0) / 1000).toFixed(1)}K</p>
                   </div>
                 )}
                 {hasInvoices && (
                   <div className="p-4 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border)]">
                      <ShoppingCart className="w-5 h-5 text-[var(--accent)] mb-2" />
                      <p className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest">Active Orders</p>
                      <p className="text-xl font-black text-[var(--foreground)] mt-1">{stats?.pendingOrders || 0}</p>
                   </div>
                 )}
                 {hasLeads && (
                   <div className="p-4 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border)]">
                      <TrendingUp className="w-5 h-5 text-[var(--success)] mb-2" />
                      <p className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest">Conversion</p>
                      <p className="text-xl font-black text-[var(--foreground)] mt-1">24%</p>
                   </div>
                 )}
                 {hasTickets && (
                   <div className="p-4 rounded-2xl bg-[var(--background-secondary)] border border-[var(--border)]">
                      <Clock className="w-5 h-5 text-[var(--warning)] mb-2" />
                      <p className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest">Avg. Res Time</p>
                      <p className="text-xl font-black text-[var(--foreground)] mt-1">4.2h</p>
                   </div>
                 )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
