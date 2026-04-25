"use client";

import StatsCard from "@/components/dashboard/stats-card";
import StatusBadge from "@/components/shared/status-badge";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ==========================================
// Mock Data (will be replaced with API calls)
// ==========================================

const revenueData = [
  { month: "Jan", revenue: 186000, leads: 32 },
  { month: "Feb", revenue: 245000, leads: 41 },
  { month: "Mar", revenue: 198000, leads: 28 },
  { month: "Apr", revenue: 312000, leads: 55 },
  { month: "May", revenue: 287000, leads: 48 },
  { month: "Jun", revenue: 356000, leads: 62 },
  { month: "Jul", revenue: 410000, leads: 71 },
];

const leadsBySource = [
  { name: "Website", value: 35, color: "#6366f1" },
  { name: "Referral", value: 25, color: "#a78bfa" },
  { name: "Cold Call", value: 20, color: "#ec4899" },
  { name: "Social Media", value: 12, color: "#3b82f6" },
  { name: "Exhibition", value: 8, color: "#22c55e" },
];

const ticketsByPriority = [
  { priority: "Critical", count: 3 },
  { priority: "High", count: 8 },
  { priority: "Medium", count: 15 },
  { priority: "Low", count: 6 },
];

const recentActivities = [
  {
    id: 1,
    action: "New lead created",
    detail: "Priya Sharma from TechVision Pvt Ltd",
    time: "2 min ago",
    type: "lead",
  },
  {
    id: 2,
    action: "Ticket resolved",
    detail: "TKT-2024-0142 — Printer malfunction",
    time: "15 min ago",
    type: "ticket",
  },
  {
    id: 3,
    action: "Order confirmed",
    detail: "ORD-2024-0089 — ₹1,85,000",
    time: "32 min ago",
    type: "order",
  },
  {
    id: 4,
    action: "Expense approved",
    detail: "Travel reimbursement — Rajesh Kumar ₹3,200",
    time: "1 hr ago",
    type: "expense",
  },
  {
    id: 5,
    action: "AMC renewal alert",
    detail: "Sunrise Industries — Expires in 7 days",
    time: "2 hr ago",
    type: "amc",
  },
  {
    id: 6,
    action: "Installation completed",
    detail: "CloudNet Solutions — Site B setup",
    time: "3 hr ago",
    type: "installation",
  },
];

const topLeads = [
  { name: "TechVision Pvt Ltd", value: "₹4,50,000", status: "proposal", rep: "Amit" },
  { name: "Sunrise Industries", value: "₹3,20,000", status: "negotiation", rep: "Priya" },
  { name: "CloudNet Solutions", value: "₹2,85,000", status: "qualified", rep: "Rajesh" },
  { name: "Metro Enterprises", value: "₹1,95,000", status: "contacted", rep: "Sneha" },
  { name: "Apex Digital", value: "₹1,60,000", status: "new", rep: "Vikram" },
];

// ==========================================
// Custom Tooltip
// ==========================================

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

// ==========================================
// Dashboard Page
// ==========================================

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-[var(--foreground)]">
          Dashboard
        </h1>
        <p className="text-sm text-[var(--foreground-secondary)] mt-1">
          Welcome back! Here&apos;s what&apos;s happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Leads"
          value="247"
          change="+12.5%"
          changeType="positive"
          description="vs last month"
          icon={Target}
          iconColor="#6366f1"
        />
        <StatsCard
          title="Conversion Rate"
          value="24.8%"
          change="+3.2%"
          changeType="positive"
          description="vs last month"
          icon={TrendingUp}
          iconColor="#22c55e"
        />
        <StatsCard
          title="Open Tickets"
          value="18"
          change="-5"
          changeType="positive"
          description="resolved today"
          icon={Ticket}
          iconColor="#f59e0b"
        />
        <StatsCard
          title="Active Agents"
          value="12"
          change="3 in field"
          changeType="neutral"
          icon={Users}
          iconColor="#3b82f6"
        />
      </div>

      {/* Second Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Monthly Revenue"
          value="₹4.1L"
          change="+18.2%"
          changeType="positive"
          description="vs last month"
          icon={IndianRupee}
          iconColor="#22c55e"
        />
        <StatsCard
          title="Pending Orders"
          value="23"
          change="8 shipped"
          changeType="neutral"
          icon={ShoppingCart}
          iconColor="#a78bfa"
        />
        <StatsCard
          title="Pending Expenses"
          value="₹48.5K"
          change="6 claims"
          changeType="neutral"
          icon={Receipt}
          iconColor="#ec4899"
        />
        <StatsCard
          title="Avg Resolution"
          value="4.2 hrs"
          change="-1.3 hrs"
          changeType="positive"
          description="vs last week"
          icon={Clock}
          iconColor="#3b82f6"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-[var(--foreground)]">
                Revenue Trend
              </h3>
              <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
                Monthly revenue overview
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-[var(--foreground-muted)]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                Revenue
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "var(--foreground-muted)", fontSize: 12 }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--foreground-muted)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v / 1000}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Sources Pie */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">
            Lead Sources
          </h3>
          <p className="text-xs text-[var(--foreground-muted)] mb-4">
            Where your leads come from
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={leadsBySource}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {leadsBySource.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {leadsBySource.map((source) => (
              <div key={source.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: source.color }}
                  />
                  <span className="text-[var(--foreground-secondary)]">
                    {source.name}
                  </span>
                </div>
                <span className="font-semibold text-[var(--foreground)]">
                  {source.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tickets by Priority */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">
            Tickets by Priority
          </h3>
          <p className="text-xs text-[var(--foreground-muted)] mb-4">
            Open ticket distribution
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ticketsByPriority} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: "var(--foreground-muted)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="priority"
                tick={{ fill: "var(--foreground-muted)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Leads */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">
            Top Leads
          </h3>
          <p className="text-xs text-[var(--foreground-muted)] mb-4">
            Highest value opportunities
          </p>
          <div className="space-y-3">
            {topLeads.map((lead, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">
                    {lead.name}
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    {lead.rep} · {lead.value}
                  </p>
                </div>
                <StatusBadge status={lead.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">
            Recent Activity
          </h3>
          <p className="text-xs text-[var(--foreground-muted)] mb-4">
            Latest updates across modules
          </p>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex gap-3 py-2 border-b border-[var(--border)] last:border-0"
              >
                <div className="w-2 h-2 rounded-full bg-[var(--accent)] mt-1.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {activity.action}
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)] truncate">
                    {activity.detail}
                  </p>
                  <p className="text-[10px] text-[var(--foreground-muted)] mt-0.5">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
