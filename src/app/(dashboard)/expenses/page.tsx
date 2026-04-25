"use client";

import StatusBadge from "@/components/shared/status-badge";
import { Plus, Search, Receipt, Check, X } from "lucide-react";
import { useState } from "react";

const expenses = [
  { id: "1", user: "Amit Patel", category: "travel", amount: "₹3,200", description: "Client visit — Mumbai to Pune", date: "22 Apr 2026", status: "pending" },
  { id: "2", user: "Priya Sharma", category: "food", amount: "₹850", description: "Client lunch — TechVision meeting", date: "21 Apr 2026", status: "approved" },
  { id: "3", user: "Rajesh Kumar", category: "travel", amount: "₹5,400", description: "Delhi site visit — round trip", date: "20 Apr 2026", status: "pending" },
  { id: "4", user: "Vikram Singh", category: "accommodation", amount: "₹2,800", description: "Overnight stay — Hyderabad", date: "19 Apr 2026", status: "rejected" },
  { id: "5", user: "Sneha Patel", category: "supplies", amount: "₹1,200", description: "Demo equipment cables", date: "18 Apr 2026", status: "approved" },
];

const categoryIcons: Record<string, string> = { travel: "🚗", food: "🍽️", accommodation: "🏨", supplies: "📦", other: "📋" };

export default function ExpensesPage() {
  const [search, setSearch] = useState("");
  const filtered = expenses.filter((e) => e.user.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Expenses</h1>
          <p className="text-sm text-[var(--foreground-secondary)] mt-1">Track and approve expense claims</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-[var(--accent)]/20">
          <Plus size={18} /><span>Submit Expense</span>
        </button>
      </div>

      <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 max-w-sm">
        <Search size={16} className="text-[var(--foreground-muted)]" />
        <input type="text" placeholder="Search expenses..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] w-full" />
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Employee</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Description</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((exp) => (
                <tr key={exp.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)] transition-colors">
                  <td className="px-4 py-3 font-medium text-[var(--foreground)]">{exp.user}</td>
                  <td className="px-4 py-3"><span className="text-xs capitalize">{categoryIcons[exp.category]} {exp.category}</span></td>
                  <td className="px-4 py-3 text-[var(--foreground-secondary)] max-w-[200px] truncate">{exp.description}</td>
                  <td className="px-4 py-3 font-semibold text-[var(--foreground)]">{exp.amount}</td>
                  <td className="px-4 py-3"><StatusBadge status={exp.status} /></td>
                  <td className="px-4 py-3 text-right">
                    {exp.status === "pending" && (
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded-md text-[var(--success)] hover:bg-[var(--success-muted)] transition-colors" title="Approve"><Check size={15} /></button>
                        <button className="p-1.5 rounded-md text-[var(--danger)] hover:bg-[var(--danger-muted)] transition-colors" title="Reject"><X size={15} /></button>
                      </div>
                    )}
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
