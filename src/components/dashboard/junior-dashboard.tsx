"use client";

import StatsCard from "@/components/dashboard/stats-card";
import StatusBadge from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import {
  Target,
  Ticket,
  Clock,
  Calendar as CalendarIcon,
  CheckCircle2,
} from "lucide-react";

interface JuniorDashboardProps {
  stats: any;
  currentUser: any;
}

export default function JuniorDashboard({ stats, currentUser }: JuniorDashboardProps) {
  // Defensive checks
  const rawTeam = currentUser?.teamId;
  const perms = (rawTeam && typeof rawTeam === "object" && "permissions" in rawTeam)
    ? (rawTeam.permissions as any)
    : null;

  const isAdmin = currentUser?.roleTier === "admin" || currentUser?.roleTier === "super_admin";
  const isSuperAdmin = currentUser?.roleTier === "super_admin";

  const hasLeads = isAdmin || isSuperAdmin || perms?.leads !== "none";
  const hasTickets = isAdmin || isSuperAdmin || perms?.tickets !== "none";

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-4xl font-black text-foreground tracking-tight">
            My Workspace
          </h1>
          <p className="text-sm text-foreground-secondary mt-1 font-medium">
            Welcome back, {currentUser?.firstName || "Staff Member"}. Here is your personal agenda.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl shadow-sm">
          <div className="w-2 h-2 rounded-full bg-info animate-pulse" />
          <span className="text-xs font-bold text-foreground-secondary uppercase tracking-wider">Representative Portal</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {hasLeads && (
          <StatsCard
            title="My Active Leads"
            value={stats?.totalLeads || 0}
            change="Target"
            changeType="neutral"
            description="leads assigned to me"
            icon={Target}
            iconColor="#6366f1"
          />
        )}
        {hasTickets && (
          <StatsCard
            title="My Open Tickets"
            value={stats?.openTickets || 0}
            change="Pending"
            changeType="neutral"
            description="service calls assigned to me"
            icon={Ticket}
            iconColor="#f59e0b"
          />
        )}
        <StatsCard
          title="Tasks Completed Today"
          value={stats?.myTasks?.filter((t: any) => t.isCompleted).length || 0}
          change={`Out of ${stats?.myTasks?.length || 0}`}
          changeType="positive"
          description="diary items ticked off"
          icon={CheckCircle2}
          iconColor="#22c55e"
        />
        <StatsCard
          title="Attendance Status"
          value={stats?.activeAgents > 0 ? "Checked In" : "Not Checked In"}
          change="Today"
          changeType={stats?.activeAgents > 0 ? "positive" : "neutral"}
          description="field checkin record"
          icon={Clock}
          iconColor="#3b82f6"
        />
      </div>

      {/* Tasks List and My Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Planner Agenda list */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-6 shadow-sm card-hover animate-scale-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                My Daily Agenda
              </h3>
              <p className="text-xs text-foreground-muted mt-1 font-medium">
                Diary schedule and tasks list for today.
              </p>
            </div>
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest cursor-pointer hover:underline">Add Entry</span>
          </div>
          <div className="space-y-3">
            {(stats?.myTasks || []).map((task: any) => (
              <div
                key={task._id}
                className="flex items-center justify-between p-4 bg-background-secondary/30 rounded-xl border border-border hover:border-accent transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-surface-hover border border-border rounded-lg text-accent">
                    <CalendarIcon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground group-hover:text-accent transition-colors">
                      {task.title}
                    </p>
                    <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest mt-0.5">
                      {task.startTime && task.endTime ? `${task.startTime} - ${task.endTime}` : "All Day"} | Type: <span className="text-foreground-secondary">{task.type}</span>
                    </p>
                  </div>
                </div>
                <span className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  task.isCompleted ? "bg-success-muted text-success" : "bg-warning-muted text-warning"
                )}>
                  {task.isCompleted ? "Completed" : "Pending"}
                </span>
              </div>
            ))}
            {(!stats?.myTasks || stats?.myTasks.length === 0) && (
              <div className="text-center py-12">
                <CalendarIcon className="w-10 h-10 text-foreground-muted mx-auto mb-3" />
                <p className="text-xs font-bold text-foreground-muted uppercase tracking-widest">No diary planner tasks listed today.</p>
              </div>
            )}
          </div>
        </div>

        {/* My Assigned Leads */}
        {hasLeads && (
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm card-hover">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                My Pipeline
              </h3>
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest cursor-pointer hover:underline">View All</span>
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
                <p className="text-center py-10 text-xs font-bold text-foreground-muted uppercase tracking-widest">No active leads in your pipeline</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
