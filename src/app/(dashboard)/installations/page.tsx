"use client";

import StatusBadge from "@/components/shared/status-badge";
import { Plus, Search, Wrench, Camera, CheckSquare } from "lucide-react";
import { useState } from "react";

const installations = [
  { id: "1", customer: "TechVision Pvt Ltd", order: "ORD-2026-0088", tech: "Rahul Verma", date: "25 Apr 2026", status: "scheduled", photos: 0, signed: false },
  { id: "2", customer: "Sunrise Industries", order: "ORD-2026-0087", tech: "Deepak Jain", date: "23 Apr 2026", status: "in_progress", photos: 4, signed: false },
  { id: "3", customer: "DataFlow Systems", order: "ORD-2026-0086", tech: "Suresh Nair", date: "20 Apr 2026", status: "completed", photos: 8, signed: true },
  { id: "4", customer: "Metro Enterprises", order: "ORD-2026-0085", tech: "Rahul Verma", date: "18 Apr 2026", status: "completed", photos: 6, signed: true },
];

export default function InstallationsPage() {
  const [search, setSearch] = useState("");
  const filtered = installations.filter((i) => i.customer.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Installations</h1>
          <p className="text-sm text-[var(--foreground-secondary)] mt-1">Track installation jobs and progress</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-[var(--accent)]/20">
          <Plus size={18} /><span>Schedule Installation</span>
        </button>
      </div>

      <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 max-w-sm">
        <Search size={16} className="text-[var(--foreground-muted)]" />
        <input type="text" placeholder="Search installations..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] w-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((inst) => (
          <div key={inst.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--border-hover)] transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wrench size={18} className="text-[var(--accent)]" />
                <span className="font-semibold text-[var(--foreground)]">{inst.customer}</span>
              </div>
              <StatusBadge status={inst.status} />
            </div>
            <div className="space-y-2 text-xs mb-4">
              <div className="flex justify-between"><span className="text-[var(--foreground-muted)]">Order</span><span className="text-[var(--accent)] font-mono">{inst.order}</span></div>
              <div className="flex justify-between"><span className="text-[var(--foreground-muted)]">Technician</span><span className="text-[var(--foreground-secondary)]">{inst.tech}</span></div>
              <div className="flex justify-between"><span className="text-[var(--foreground-muted)]">Scheduled</span><span className="text-[var(--foreground-secondary)]">{inst.date}</span></div>
            </div>
            <div className="flex items-center gap-4 pt-3 border-t border-[var(--border)]">
              <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)]">
                <Camera size={13} /><span>{inst.photos} photos</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <CheckSquare size={13} className={inst.signed ? "text-[var(--success)]" : "text-[var(--foreground-muted)]"} />
                <span className={inst.signed ? "text-[var(--success)]" : "text-[var(--foreground-muted)]"}>{inst.signed ? "Signed" : "Pending signature"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
