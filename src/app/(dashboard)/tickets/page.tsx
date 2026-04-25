"use client";

import StatusBadge from "@/components/shared/status-badge";
import { Plus, Search, AlertCircle, Eye, Edit, CheckCircle } from "lucide-react";
import { useState } from "react";

const tickets = [
  { id: "1", number: "TKT-2026-0145", customer: "TechVision Pvt Ltd", issue: "Network connectivity drops intermittently", category: "complaint", priority: "high", status: "in_progress", tech: "Rahul", created: "22 Apr 2026" },
  { id: "2", number: "TKT-2026-0144", customer: "Sunrise Industries", issue: "Printer not responding after firmware update", category: "service_request", priority: "medium", status: "assigned", tech: "Deepak", created: "21 Apr 2026" },
  { id: "3", number: "TKT-2026-0143", customer: "CloudNet Solutions", issue: "Server overheating alert", category: "complaint", priority: "critical", status: "open", tech: "—", created: "21 Apr 2026" },
  { id: "4", number: "TKT-2026-0142", customer: "Metro Enterprises", issue: "CCTV camera offline at Branch B", category: "service_request", priority: "high", status: "resolved", tech: "Rahul", created: "20 Apr 2026" },
  { id: "5", number: "TKT-2026-0141", customer: "Apex Digital", issue: "Software license renewal request", category: "general", priority: "low", status: "closed", tech: "Deepak", created: "18 Apr 2026" },
  { id: "6", number: "TKT-2026-0140", customer: "DataFlow Systems", issue: "UPS failure at main office", category: "complaint", priority: "critical", status: "in_progress", tech: "Suresh", created: "17 Apr 2026" },
];

const priorityColors: Record<string, string> = {
  critical: "var(--danger)",
  high: "#f59e0b",
  medium: "var(--info)",
  low: "var(--foreground-muted)",
};

export default function TicketsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = tickets.filter(
    (t) => t.number.toLowerCase().includes(searchQuery.toLowerCase()) || t.customer.toLowerCase().includes(searchQuery.toLowerCase()) || t.issue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Service Tickets</h1>
          <p className="text-sm text-[var(--foreground-secondary)] mt-1">Manage complaints and service requests</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-[var(--accent)]/20">
          <Plus size={18} />
          <span>New Ticket</span>
        </button>
      </div>

      {/* Priority Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Critical", count: 2, color: "var(--danger)" },
          { label: "High", count: 1, color: "#f59e0b" },
          { label: "Medium", count: 1, color: "var(--info)" },
          { label: "Low", count: 1, color: "var(--foreground-muted)" },
        ].map((p) => (
          <div key={p.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
            <div>
              <p className="text-lg font-bold text-[var(--foreground)]">{p.count}</p>
              <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">{p.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 flex-1 sm:max-w-sm">
          <Search size={16} className="text-[var(--foreground-muted)]" />
          <input type="text" placeholder="Search tickets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] w-full" />
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Ticket</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)] hidden md:table-cell">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Issue</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)] hidden lg:table-cell">Technician</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ticket) => (
                <tr key={ticket.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={15} style={{ color: priorityColors[ticket.priority] }} />
                      <span className="font-medium text-[var(--foreground)] text-xs">{ticket.number}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground-secondary)] hidden md:table-cell">{ticket.customer}</td>
                  <td className="px-4 py-3 text-[var(--foreground-secondary)] max-w-[200px] truncate">{ticket.issue}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold capitalize" style={{ color: priorityColors[ticket.priority] }}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={ticket.status} /></td>
                  <td className="px-4 py-3 text-[var(--foreground-muted)] hidden lg:table-cell">{ticket.tech}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-md text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-active)] transition-colors"><Eye size={15} /></button>
                      <button className="p-1.5 rounded-md text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-active)] transition-colors"><Edit size={15} /></button>
                      {ticket.status !== "resolved" && ticket.status !== "closed" && (
                        <button className="p-1.5 rounded-md text-[var(--success)] hover:bg-[var(--success-muted)] transition-colors" title="Resolve"><CheckCircle size={15} /></button>
                      )}
                    </div>
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
