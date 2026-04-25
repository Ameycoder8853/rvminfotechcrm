"use client";

import StatusBadge from "@/components/shared/status-badge";
import { Plus, Search, Package, Eye, Edit } from "lucide-react";
import { useState } from "react";

const orders = [
  { id: "1", number: "ORD-2026-0089", customer: "DataFlow Systems", items: 5, total: "₹5,80,000", status: "delivered", department: "IT Solutions", assignedTo: "Amit", date: "18 Apr 2026" },
  { id: "2", number: "ORD-2026-0088", customer: "TechVision Pvt Ltd", items: 3, total: "₹4,50,000", status: "processing", department: "Networking", assignedTo: "Priya", date: "16 Apr 2026" },
  { id: "3", number: "ORD-2026-0087", customer: "Sunrise Industries", items: 2, total: "₹3,20,000", status: "shipped", department: "Hardware", assignedTo: "Rajesh", date: "14 Apr 2026" },
  { id: "4", number: "ORD-2026-0086", customer: "CloudNet Solutions", items: 8, total: "₹2,85,000", status: "confirmed", department: "Cloud", assignedTo: "Sneha", date: "12 Apr 2026" },
  { id: "5", number: "ORD-2026-0085", customer: "Metro Enterprises", items: 1, total: "₹1,95,000", status: "pending", department: "Security", assignedTo: "Vikram", date: "10 Apr 2026" },
  { id: "6", number: "ORD-2026-0084", customer: "ConnectHub", items: 4, total: "₹90,000", status: "cancelled", department: "Telecom", assignedTo: "Amit", date: "8 Apr 2026" },
];

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = orders.filter(
    (o) => o.number.toLowerCase().includes(searchQuery.toLowerCase()) || o.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Orders</h1>
          <p className="text-sm text-[var(--foreground-secondary)] mt-1">Track customer orders from creation to delivery</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-[var(--accent)]/20">
          <Plus size={18} />
          <span>New Order</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 flex-1 sm:max-w-sm">
          <Search size={16} className="text-[var(--foreground-muted)]" />
          <input type="text" placeholder="Search orders..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] w-full" />
        </div>
      </div>

      {/* Order Status Pipeline */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["All", "Pending", "Confirmed", "Processing", "Shipped", "Delivered"].map((s) => (
          <button key={s} className="px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:border-[var(--border-hover)] transition-colors whitespace-nowrap">
            {s}
          </button>
        ))}
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Order</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)] hidden lg:table-cell">Department</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)] hidden md:table-cell">Date</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Package size={15} className="text-[var(--accent)]" />
                      <span className="font-medium text-[var(--foreground)]">{order.number}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground-secondary)]">{order.customer}</td>
                  <td className="px-4 py-3 font-semibold text-[var(--foreground)]">{order.total}</td>
                  <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                  <td className="px-4 py-3 text-[var(--foreground-muted)] text-xs hidden lg:table-cell">{order.department}</td>
                  <td className="px-4 py-3 text-[var(--foreground-muted)] text-xs hidden md:table-cell">{order.date}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-md text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-active)] transition-colors"><Eye size={15} /></button>
                      <button className="p-1.5 rounded-md text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-active)] transition-colors"><Edit size={15} /></button>
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
