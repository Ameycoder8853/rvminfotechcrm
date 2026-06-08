"use client";

import StatsCard from "@/components/dashboard/stats-card";
import StatusBadge from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import {
  Target,
  Ticket,
  ShoppingCart,
  UserCheck,
  Phone,
} from "lucide-react";

interface SeniorDashboardProps {
  stats: any;
  currentUser: any;
}

export default function SeniorDashboard({ stats, currentUser }: SeniorDashboardProps) {
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

  const teamName = (currentUser?.teamId as any)?.name || "My Assigned Team";

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-4xl font-black text-foreground tracking-tight">
            Team Operations Hub
          </h1>
          <p className="text-sm text-foreground-secondary mt-1 font-medium">
            Overview and management metrics for <span className="text-accent font-semibold">{teamName}</span>.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl shadow-sm">
          <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
          <span className="text-xs font-bold text-foreground-secondary uppercase tracking-wider">Senior Manager Dashboard</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {hasLeads && (
          <StatsCard
            title="Team Assigned Leads"
            value={stats?.totalLeads || 0}
            change="Active"
            changeType="neutral"
            description="opportunities under management"
            icon={Target}
            iconColor="#6366f1"
          />
        )}
        {hasTickets && (
          <StatsCard
            title="Team Open Complaints"
            value={stats?.openTickets || 0}
            change="Pending"
            changeType="neutral"
            description="service requests to resolve"
            icon={Ticket}
            iconColor="#f59e0b"
          />
        )}
        {hasInvoices && (
          <StatsCard
            title="Team Active Orders"
            value={stats?.pendingOrders || 0}
            change="Processing"
            changeType="neutral"
            description="unfulfilled team orders"
            icon={ShoppingCart}
            iconColor="#3b82f6"
          />
        )}
        <StatsCard
          title="Team Members Checked In"
          value={stats?.teamRoster?.filter((r: any) => r.checkedIn).length || 0}
          change={`Out of ${stats?.teamRoster?.length || 0}`}
          changeType="positive"
          description="live staff members today"
          icon={UserCheck}
          iconColor="#22c55e"
        />
      </div>

      {/* Team Attendance and Roster Status */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Roster list */}
        <div className="xl:col-span-2 bg-surface border border-border rounded-2xl p-6 shadow-sm card-hover animate-scale-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Team Roster Status
              </h3>
              <p className="text-xs text-foreground-muted mt-1 font-medium">
                Staff roster and today's attendance checkins.
              </p>
            </div>
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest cursor-pointer hover:underline">Enroll Junior</span>
          </div>
          <div className="space-y-3">
            {(stats?.teamRoster || []).map((member: any) => (
              <div
                key={member._id}
                className="flex items-center justify-between p-4 bg-background-secondary/30 rounded-xl border border-border hover:border-accent transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-background-secondary border border-border flex items-center justify-center text-sm font-bold text-accent uppercase">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.firstName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      `${member.firstName[0]}${member.lastName?.[0] || ""}`
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground group-hover:text-accent transition-colors">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest mt-0.5">
                      Role: <span className="text-foreground-secondary">{member.role} ({member.roleTier})</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {member.phone && (
                    <a href={`tel:${member.phone}`} className="p-2 rounded-lg text-foreground-muted hover:text-accent hover:bg-surface-hover transition-colors hidden sm:block">
                      <Phone size={16} />
                    </a>
                  )}
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    member.checkedIn ? "bg-success-muted text-success" : "bg-foreground-muted/10 text-foreground-muted"
                  )}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", member.checkedIn ? "bg-success animate-pulse" : "bg-foreground-muted")} />
                    {member.checkedIn ? "Checked In" : "Absent"}
                  </span>
                </div>
              </div>
            ))}
            {(!stats?.teamRoster || stats?.teamRoster.length === 0) && (
              <p className="text-center py-10 text-xs font-bold text-foreground-muted uppercase tracking-widest">No team members assigned.</p>
            )}
          </div>
        </div>

        {/* High Priority Leads */}
        {hasLeads && (
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm card-hover">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Recent Team Leads
              </h3>
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest cursor-pointer hover:underline">View Pipeline</span>
            </div>
            <div className="space-y-4">
              {(stats?.recentLeads || []).map((lead: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-background-secondary/30 rounded-xl border border-border hover:border-accent transition-all cursor-pointer group"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate group-hover:text-accent transition-colors">
                      {lead.name}
                    </p>
                    <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest mt-0.5">
                      Est. Value: <span className="text-foreground-secondary">{lead.value}</span>
                    </p>
                  </div>
                  <StatusBadge status={lead.status} />
                </div>
              ))}
              {(!stats?.recentLeads || stats?.recentLeads.length === 0) && (
                <p className="text-center py-10 text-xs font-bold text-foreground-muted uppercase tracking-widest">No active leads in pipeline</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
