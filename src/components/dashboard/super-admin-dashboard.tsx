"use client";

import { useState, useEffect } from "react";
import StatsCard from "@/components/dashboard/stats-card";
import { Building2, Users, Ticket, UserCheck, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SuperAdminDashboardProps {
  stats: any;
  currentUser: any;
}

export default function SuperAdminDashboard({ stats, currentUser }: SuperAdminDashboardProps) {
  const [activeImpersonatedOrg, setActiveImpersonatedOrg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("rvm_impersonate_org_id");
      if (saved) {
        setActiveImpersonatedOrg(saved);
      }
    }
  }, []);

  const handleImpersonate = (orgId: string, orgName: string) => {
    if (typeof window !== "undefined") {
      if (activeImpersonatedOrg === orgId) {
        sessionStorage.removeItem("rvm_impersonate_org_id");
        sessionStorage.removeItem("rvm_impersonate_org_name");
        document.cookie = "rvm_impersonate_org_id=; path=/; max-age=0";
        setActiveImpersonatedOrg(null);
        alert("Impersonation cleared. Viewing global database.");
      } else {
        sessionStorage.setItem("rvm_impersonate_org_id", orgId);
        sessionStorage.setItem("rvm_impersonate_org_name", orgName);
        document.cookie = `rvm_impersonate_org_id=${orgId}; path=/; max-age=31536000`; // 1 year
        setActiveImpersonatedOrg(orgId);
        alert(`Now impersonating context: ${orgName}. Database requests will filter to this company.`);
      }
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-4xl font-black text-foreground tracking-tight">
            Sovereign Command Center
          </h1>
          <p className="text-sm text-foreground-secondary mt-1 font-medium">
            Super Admin Overview of all CRM tenants and system resources.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl shadow-sm self-start md:self-auto">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs font-bold text-foreground-secondary uppercase tracking-wider">Super Admin Mode</span>
        </div>
      </div>

      {/* Impersonation Warning Banner */}
      {activeImpersonatedOrg && (
        <div className="p-4 bg-warning-muted/15 border border-warning/20 rounded-2xl flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <Building2 className="text-warning w-5 h-5 shrink-0" />
            <p className="text-sm font-semibold text-foreground-secondary">
              ⚠️ <strong className="text-warning">Active Impersonation Context:</strong> You are currently inspecting data scoped strictly to organization ID: <code className="bg-surface-active px-1.5 py-0.5 rounded text-xs">{activeImpersonatedOrg}</code>.
            </p>
          </div>
          <button
            onClick={() => handleImpersonate(activeImpersonatedOrg, "")}
            className="px-3.5 py-1.5 bg-surface hover:bg-surface-hover border border-border rounded-lg text-xs font-bold transition-all text-foreground shrink-0 cursor-pointer"
          >
            Clear Context
          </button>
        </div>
      )}

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
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm card-hover animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Tenant Workspaces
            </h3>
            <p className="text-xs text-foreground-muted mt-1 font-medium">
              Registered tenants and their workspace metadata.
            </p>
          </div>
          <Link href="/super-admin" className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline">
            Manage All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-[10px] font-bold text-foreground-muted uppercase tracking-widest">Workspace Name</th>
                <th className="pb-3 text-[10px] font-bold text-foreground-muted uppercase tracking-widest">Slug (Subdomain)</th>
                <th className="pb-3 text-[10px] font-bold text-foreground-muted uppercase tracking-widest">Active Staff</th>
                <th className="pb-3 text-[10px] font-bold text-foreground-muted uppercase tracking-widest">Workspace Status</th>
                <th className="pb-3 text-[10px] font-bold text-foreground-muted uppercase tracking-widest text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {(stats?.organizations || []).map((org: any) => (
                <tr key={org._id} className="hover:bg-background-secondary/30 transition-colors group">
                  <td className="py-4 text-sm font-bold text-foreground group-hover:text-accent transition-colors">{org.name}</td>
                  <td className="py-4 text-xs font-semibold text-foreground-secondary">{org.slug}.rvminfotech.com</td>
                  <td className="py-4 text-sm font-semibold text-foreground">{org.userCount} users</td>
                  <td className="py-4">
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      org.status === "active" ? "bg-success-muted text-success" : "bg-danger-muted text-danger"
                    )}>
                      {org.status}
                    </span>
                  </td>
                  <td className="py-4 text-right pr-4">
                    <button
                      onClick={() => handleImpersonate(org._id, org.name)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                        activeImpersonatedOrg === org._id
                          ? "bg-warning text-black hover:bg-warning-hover font-extrabold"
                          : "bg-accent-muted text-accent hover:bg-accent hover:text-white"
                      )}
                    >
                      <Eye size={12} />
                      <span>{activeImpersonatedOrg === org._id ? "Stop Inspecting" : "Inspect DB"}</span>
                    </button>
                  </td>
                </tr>
              ))}
              {(!stats?.organizations || stats?.organizations.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-xs font-bold text-foreground-muted uppercase tracking-widest">No organizations registered yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
