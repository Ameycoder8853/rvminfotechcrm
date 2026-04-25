"use client";

import StatusBadge from "@/components/shared/status-badge";
import { Plus, Search, Shield, AlertTriangle } from "lucide-react";
import { useState } from "react";

const amcs = [
  { id: "1", number: "AMC-2026-0021", customer: "TechVision Pvt Ltd", value: "₹1,20,000", start: "01 Jan 2026", end: "31 Dec 2026", status: "active", services: "Server + Network", nextService: "15 May 2026" },
  { id: "2", number: "AMC-2026-0020", customer: "Sunrise Industries", value: "₹85,000", start: "01 Mar 2026", end: "28 Feb 2027", status: "active", services: "CCTV + Access Control", nextService: "01 Jun 2026" },
  { id: "3", number: "AMC-2025-0018", customer: "Metro Enterprises", value: "₹60,000", start: "01 Apr 2025", end: "31 Mar 2026", status: "expired", services: "Printer Maintenance", nextService: "—" },
  { id: "4", number: "AMC-2026-0019", customer: "CloudNet Solutions", value: "₹2,40,000", start: "15 Feb 2026", end: "14 Feb 2027", status: "active", services: "Full IT Support", nextService: "20 May 2026" },
];

export default function AMCPage() {
  const [search, setSearch] = useState("");
  const filtered = amcs.filter((a) => a.customer.toLowerCase().includes(search.toLowerCase()) || a.number.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">AMC Management</h1>
          <p className="text-sm text-[var(--foreground-secondary)] mt-1">Annual Maintenance Contract tracking</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-[var(--accent)]/20">
          <Plus size={18} /><span>New AMC</span>
        </button>
      </div>

      <div className="flex items-center gap-3 bg-[var(--warning-muted)] border border-[rgba(245,158,11,0.3)] rounded-lg px-4 py-3">
        <AlertTriangle size={18} className="text-[var(--warning)] shrink-0" />
        <p className="text-sm text-[var(--warning)]"><span className="font-semibold">1 contract</span> expiring within 30 days.</p>
      </div>

      <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 max-w-sm">
        <Search size={16} className="text-[var(--foreground-muted)]" />
        <input type="text" placeholder="Search AMC..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] w-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((amc) => (
          <div key={amc.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--border-hover)] transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-[var(--accent)]" />
                <span className="text-xs font-mono text-[var(--foreground-muted)]">{amc.number}</span>
              </div>
              <StatusBadge status={amc.status} />
            </div>
            <p className="font-semibold text-[var(--foreground)] mb-1">{amc.customer}</p>
            <p className="text-xs text-[var(--foreground-muted)] mb-3">{amc.services}</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-[var(--foreground-muted)]">Value</span><span className="font-semibold text-[var(--foreground)]">{amc.value}/yr</span></div>
              <div className="flex justify-between"><span className="text-[var(--foreground-muted)]">Period</span><span className="text-[var(--foreground-secondary)]">{amc.start} — {amc.end}</span></div>
              <div className="flex justify-between"><span className="text-[var(--foreground-muted)]">Next Service</span><span className="text-[var(--foreground-secondary)]">{amc.nextService}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
