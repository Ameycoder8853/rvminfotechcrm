"use client";

import { useState } from "react";
import { Megaphone, Search, Plus, TrendingUp, DollarSign, Target, Loader2, Shield } from "lucide-react";
import { usePermission } from "@/hooks/use-permission";

export default function MarketingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { hasAccess, canWrite, loading } = usePermission("leads");

  const campaigns = [
    { id: "MKT-001", name: "Google Ads Q2 - Network Services", channel: "Search Engines", spend: "$1,200", leads: 145, status: "Active", conversion: "12%" },
    { id: "MKT-002", name: "LinkedIn Lead Gen - IT Executives", channel: "LinkedIn B2B", spend: "$850", leads: 48, status: "Active", conversion: "5.6%" },
    { id: "MKT-003", name: "Complimentary Audit Campaign", channel: "Cold Email Outreach", spend: "$150", leads: 82, status: "Active", conversion: "18.2%" },
    { id: "MKT-004", name: "Facebook Retargeting Ads", channel: "Facebook Social", spend: "$400", leads: 95, status: "Paused", conversion: "8.4%" },
    { id: "MKT-005", name: "Exhibition Expo 2026", channel: "In-Person Event", spend: "$3,000", leads: 220, status: "Completed", conversion: "15%" },
  ];

  const filtered = campaigns.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.channel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
        <p className="text-sm font-bold text-foreground-muted uppercase tracking-[0.2em]">
          Checking Access...
        </p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="p-4 bg-danger/10 text-danger rounded-full">
          <Shield size={48} className="animate-pulse" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-foreground">Access Denied</h2>
          <p className="text-sm text-foreground-secondary leading-relaxed">
            You do not have the required permissions to access the Marketing module. 
            Please contact your organization administrator to request access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-2 lg:p-4 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-muted flex items-center justify-center text-accent">
            <Megaphone size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Marketing Campaigns</h1>
          </div>
        </div>
        {canWrite && (
          <button className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-semibold transition-all shadow-md active:scale-95 cursor-pointer">
            <Plus size={16} className="stroke-[3]" />
            <span>New Campaign</span>
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Active Campaigns</p>
            <h3 className="text-2xl font-bold text-foreground mt-2">3 Campaigns</h3>
            <span className="text-xs font-semibold text-success flex items-center gap-1 mt-1.5">
              <TrendingUp size={12} />
              <span>Running successfully</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-accent-muted flex items-center justify-center text-accent">
            <Megaphone size={22} />
          </div>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Monthly Ad Spend</p>
            <h3 className="text-2xl font-bold text-foreground mt-2">$5,600</h3>
            <span className="text-xs font-semibold text-foreground-muted flex items-center gap-1 mt-1.5">
              <span>Within budget constraints</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-warning-muted flex items-center justify-center text-warning">
            <DollarSign size={22} />
          </div>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Total Leads Acquired</p>
            <h3 className="text-2xl font-bold text-foreground mt-2">590 Leads</h3>
            <span className="text-xs font-semibold text-accent flex items-center gap-1 mt-1.5">
              <Target size={12} />
              <span>~ $9.49 CAC average</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-accent-muted flex items-center justify-center text-accent">
            <Target size={22} />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-3 bg-background-secondary/20">
          <Search size={18} className="text-foreground-muted shrink-0" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-foreground placeholder-foreground-muted w-full font-medium"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-background-secondary/50">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-foreground-muted">Campaign Name</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-foreground-muted">Marketing Channel</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-foreground-muted">Ad Spend</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-foreground-muted">Leads Acquired</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-foreground-muted">Conversion Rate</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-foreground-muted">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-surface-hover/40 transition-colors">
                  <td className="px-6 py-4.5 font-semibold text-foreground text-sm">{c.name}</td>
                  <td className="px-6 py-4.5 text-xs font-semibold text-foreground-secondary">{c.channel}</td>
                  <td className="px-6 py-4.5 text-sm font-semibold text-foreground-secondary">{c.spend}</td>
                  <td className="px-6 py-4.5 text-sm font-semibold text-foreground-secondary">{c.leads}</td>
                  <td className="px-6 py-4.5 text-sm font-bold text-accent">{c.conversion}</td>
                  <td className="px-6 py-4.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      c.status === "Active" ? "bg-success-muted text-success border border-success/20" :
                      c.status === "Paused" ? "bg-warning-muted text-warning border border-warning/20" :
                      "bg-background-secondary text-foreground-secondary border border-border"
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
