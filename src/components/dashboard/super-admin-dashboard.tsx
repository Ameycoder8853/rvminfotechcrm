"use client";

import StatsCard from "@/components/dashboard/stats-card";
import { Building2, Users, Ticket, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuperAdminDashboardProps {
  stats: any;
  currentUser: any;
}

export default function SuperAdminDashboard({ stats, currentUser }: SuperAdminDashboardProps) {
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-4xl font-black text-[var(--foreground)] tracking-tight">
            Sovereign Command Center
          </h1>
          <p className="text-sm text-[var(--foreground-secondary)] mt-1 font-medium">
            Super Admin Overview of all CRM tenants and system resources.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-sm">
          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
          <span className="text-xs font-bold text-[var(--foreground-secondary)] uppercase tracking-wider">Super Admin Mode</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Tenant Orgs"
          value={stats?.totalOrganizations || 0}
          change="Active"
          changeType="positive"
          description="registered organizations"
          icon={Building2}
          iconColor="#6366f1"
        />
        <StatsCard
          title="Total CRM Users"
          value={stats?.totalUsers || 0}
          change="Syncing"
          changeType="neutral"
          description="active staff accounts"
          icon={Users}
          iconColor="#3b82f6"
        />
        <StatsCard
          title="Active System Tickets"
          value={stats?.openTickets || 0}
          change="Unresolved"
          changeType="neutral"
          description="cross-tenant service tickets"
          icon={Ticket}
          iconColor="#f59e0b"
        />
        <StatsCard
          title="Active Agents Today"
          value={stats?.activeAgents || 0}
          change="Checkins"
          changeType="positive"
          description="live field personnel"
          icon={UserCheck}
          iconColor="#22c55e"
        />
      </div>

      {/* Tenant Organization Directory */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm card-hover animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">
              Tenant Workspaces
            </h3>
            <p className="text-xs text-[var(--foreground-muted)] mt-1 font-medium">
              Registered tenants and their workspace metadata.
            </p>
          </div>
          <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest cursor-pointer hover:underline">Manage All</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="pb-3 text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest">Workspace Name</th>
                <th className="pb-3 text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest">Slug (Subdomain)</th>
                <th className="pb-3 text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest">Active Staff</th>
                <th className="pb-3 text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest">Workspace Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]/50">
              {(stats?.organizations || []).map((org: any) => (
                <tr key={org._id} className="hover:bg-[var(--background-secondary)]/30 transition-colors group">
                  <td className="py-4 text-sm font-bold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">{org.name}</td>
                  <td className="py-4 text-xs font-semibold text-[var(--foreground-secondary)]">{org.slug}.rvminfotech.com</td>
                  <td className="py-4 text-sm font-semibold text-[var(--foreground)]">{org.userCount} users</td>
                  <td className="py-4">
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      org.status === "active" ? "bg-[var(--success-muted)] text-[var(--success)]" : "bg-[var(--danger-muted)] text-[var(--danger)]"
                    )}>
                      {org.status}
                    </span>
                  </td>
                </tr>
              ))}
              {(!stats?.organizations || stats?.organizations.length === 0) && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-widest">No organizations registered yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
