"use client";

import { useState } from "react";
import StatusBadge from "@/components/shared/status-badge";
import { Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2, GripVertical } from "lucide-react";

// Mock data
const leads = [
  { id: "1", title: "Enterprise Cloud Solution", company: "TechVision Pvt Ltd", contact: "Priya Sharma", value: "₹4,50,000", status: "proposal", source: "website", assignedTo: "Amit", date: "22 Apr 2026" },
  { id: "2", title: "Network Infrastructure", company: "Sunrise Industries", contact: "Rajesh Kumar", value: "₹3,20,000", status: "negotiation", source: "referral", assignedTo: "Priya", date: "20 Apr 2026" },
  { id: "3", title: "Office Automation Suite", company: "CloudNet Solutions", contact: "Sneha Patel", value: "₹2,85,000", status: "qualified", source: "exhibition", assignedTo: "Rajesh", date: "18 Apr 2026" },
  { id: "4", title: "Security System Install", company: "Metro Enterprises", contact: "Vikram Singh", value: "₹1,95,000", status: "contacted", source: "cold_call", assignedTo: "Sneha", date: "16 Apr 2026" },
  { id: "5", title: "Server Upgrade Pack", company: "Apex Digital", contact: "Meera Joshi", value: "₹1,60,000", status: "new", source: "social_media", assignedTo: "Vikram", date: "15 Apr 2026" },
  { id: "6", title: "ERP Integration", company: "DataFlow Systems", contact: "Arjun Mehta", value: "₹5,80,000", status: "won", source: "referral", assignedTo: "Amit", date: "12 Apr 2026" },
  { id: "7", title: "VoIP Phone System", company: "ConnectHub", contact: "Nisha Verma", value: "₹90,000", status: "lost", source: "website", assignedTo: "Priya", date: "10 Apr 2026" },
];

const kanbanColumns = [
  { key: "new", label: "New", color: "#3b82f6" },
  { key: "contacted", label: "Contacted", color: "#f59e0b" },
  { key: "qualified", label: "Qualified", color: "#6366f1" },
  { key: "proposal", label: "Proposal", color: "#a855f7" },
  { key: "negotiation", label: "Negotiation", color: "#ec4899" },
  { key: "won", label: "Won", color: "#22c55e" },
  { key: "lost", label: "Lost", color: "#ef4444" },
];

type ViewMode = "table" | "kanban";

export default function LeadsPage() {
  const [view, setView] = useState<ViewMode>("table");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLeads = leads.filter(
    (l) =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Lead Management</h1>
          <p className="text-sm text-[var(--foreground-secondary)] mt-1">
            Track and manage your sales pipeline
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-[var(--accent)]/20">
          <Plus size={18} />
          <span>Add Lead</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 flex-1 sm:w-72">
            <Search size={16} className="text-[var(--foreground-muted)]" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] w-full"
            />
          </div>
          <button className="p-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:border-[var(--border-hover)] transition-colors">
            <Filter size={16} />
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-[var(--surface)] border border-[var(--border)] rounded-lg p-1">
          <button
            onClick={() => setView("table")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              view === "table"
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setView("kanban")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              view === "kanban"
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
            }`}
          >
            Kanban
          </button>
        </div>
      </div>

      {/* Table View */}
      {view === "table" && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Lead</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)] hidden md:table-cell">Company</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Value</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)] hidden lg:table-cell">Assigned</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)] hidden lg:table-cell">Source</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-[var(--foreground)]">{lead.title}</p>
                        <p className="text-xs text-[var(--foreground-muted)] md:hidden">{lead.company}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--foreground-secondary)] hidden md:table-cell">{lead.company}</td>
                    <td className="px-4 py-3 font-semibold text-[var(--foreground)]">{lead.value}</td>
                    <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                    <td className="px-4 py-3 text-[var(--foreground-secondary)] hidden lg:table-cell">{lead.assignedTo}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs px-2 py-1 rounded bg-[var(--background-secondary)] text-[var(--foreground-secondary)] capitalize">
                        {lead.source.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded-md text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-active)] transition-colors"><Eye size={15} /></button>
                        <button className="p-1.5 rounded-md text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-active)] transition-colors"><Edit size={15} /></button>
                        <button className="p-1.5 rounded-md text-[var(--foreground-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-muted)] transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Kanban View */}
      {view === "kanban" && (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
          {kanbanColumns.map((col) => {
            const colLeads = filteredLeads.filter((l) => l.status === col.key);
            return (
              <div
                key={col.key}
                className="min-w-[280px] w-[280px] shrink-0 bg-[var(--background-secondary)] rounded-xl border border-[var(--border)]"
              >
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                  <span className="text-sm font-semibold text-[var(--foreground)]">{col.label}</span>
                  <span className="ml-auto text-xs text-[var(--foreground-muted)] bg-[var(--surface)] px-2 py-0.5 rounded-full">
                    {colLeads.length}
                  </span>
                </div>
                <div className="p-3 space-y-3 max-h-[60vh] overflow-y-auto">
                  {colLeads.length === 0 && (
                    <p className="text-xs text-[var(--foreground-muted)] text-center py-6">No leads</p>
                  )}
                  {colLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3 hover:border-[var(--border-hover)] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-medium text-[var(--foreground)] leading-tight">
                          {lead.title}
                        </p>
                        <GripVertical size={14} className="text-[var(--foreground-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                      <p className="text-xs text-[var(--foreground-muted)] mb-2">{lead.company}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[var(--accent)]">{lead.value}</span>
                        <div className="w-6 h-6 rounded-full bg-[var(--accent-muted)] flex items-center justify-center text-[10px] font-bold text-[var(--accent)]">
                          {lead.assignedTo.charAt(0)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
