"use client";

import StatusBadge from "@/components/shared/status-badge";
import { Plus, Search, FileText, Eye, Edit, ArrowRightLeft } from "lucide-react";
import { useState } from "react";

const quotes = [
  { id: "1", number: "QT-2026-0047", customer: "TechVision Pvt Ltd", items: 5, total: "₹4,50,000", status: "sent", validUntil: "30 Apr 2026", createdBy: "Amit" },
  { id: "2", number: "QT-2026-0046", customer: "Sunrise Industries", items: 3, total: "₹3,20,000", status: "accepted", validUntil: "28 Apr 2026", createdBy: "Priya" },
  { id: "3", number: "QT-2026-0045", customer: "CloudNet Solutions", items: 8, total: "₹2,85,000", status: "draft", validUntil: "25 Apr 2026", createdBy: "Rajesh" },
  { id: "4", number: "QT-2026-0044", customer: "Metro Enterprises", items: 2, total: "₹1,95,000", status: "rejected", validUntil: "22 Apr 2026", createdBy: "Sneha" },
  { id: "5", number: "QT-2026-0043", customer: "Apex Digital", items: 4, total: "₹1,60,000", status: "converted", validUntil: "20 Apr 2026", createdBy: "Vikram" },
];

export default function QuotesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = quotes.filter(
    (q) => q.number.toLowerCase().includes(searchQuery.toLowerCase()) || q.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Quotations</h1>
          <p className="text-sm text-[var(--foreground-secondary)] mt-1">Create and manage sales quotations</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-[var(--accent)]/20">
          <Plus size={18} />
          <span>New Quote</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 flex-1 sm:max-w-sm">
          <Search size={16} className="text-[var(--foreground-muted)]" />
          <input type="text" placeholder="Search quotes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] w-full" />
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Quote #</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)] hidden md:table-cell">Items</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)] hidden lg:table-cell">Valid Until</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((quote) => (
                <tr key={quote.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText size={15} className="text-[var(--accent)]" />
                      <span className="font-medium text-[var(--foreground)]">{quote.number}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground-secondary)]">{quote.customer}</td>
                  <td className="px-4 py-3 text-[var(--foreground-secondary)] hidden md:table-cell">{quote.items} items</td>
                  <td className="px-4 py-3 font-semibold text-[var(--foreground)]">{quote.total}</td>
                  <td className="px-4 py-3"><StatusBadge status={quote.status} /></td>
                  <td className="px-4 py-3 text-[var(--foreground-muted)] text-xs hidden lg:table-cell">{quote.validUntil}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-md text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-active)] transition-colors" title="View"><Eye size={15} /></button>
                      <button className="p-1.5 rounded-md text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-active)] transition-colors" title="Edit"><Edit size={15} /></button>
                      {quote.status === "accepted" && (
                        <button className="p-1.5 rounded-md text-[var(--success)] hover:bg-[var(--success-muted)] transition-colors" title="Convert to Order">
                          <ArrowRightLeft size={15} />
                        </button>
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
