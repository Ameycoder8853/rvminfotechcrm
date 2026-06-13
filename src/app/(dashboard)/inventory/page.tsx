"use client";

import { useState } from "react";
import { Package, Search, Plus, ArrowUpRight, TrendingUp, AlertTriangle, BadgeAlert, Loader2, Shield } from "lucide-react";
import { usePermission } from "@/hooks/use-permission";

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { hasAccess, canWrite, loading } = usePermission("invoices");

  const inventoryItems = [
    { id: "INV-001", name: "Cat6 Ethernet Cable (305m)", category: "Cables", stock: 45, unit: "Rolls", status: "In Stock", price: "$120" },
    { id: "INV-002", name: "8-Port PoE Gigabit Switch", category: "Hardware", stock: 12, unit: "Units", status: "In Stock", price: "$85" },
    { id: "INV-003", name: "RVM Dome IP Camera 4MP", category: "Cameras", stock: 3, unit: "Units", status: "Low Stock", price: "$150" },
    { id: "INV-004", name: "RJ45 Connectors (Pack of 100)", category: "Connectors", stock: 80, unit: "Packs", status: "In Stock", price: "$15" },
    { id: "INV-005", name: "Server Rack Cabinet 12U", category: "Racks", stock: 0, unit: "Units", status: "Out of Stock", price: "$280" },
  ];

  const filtered = inventoryItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
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
            You do not have the required permissions to access the Inventory module. 
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
            <Package size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Inventory & Assets</h1>
          </div>
        </div>
        {canWrite && (
          <button className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-semibold transition-all shadow-md active:scale-95 cursor-pointer">
            <Plus size={16} className="stroke-[3]" />
            <span>Add Asset</span>
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Total SKU Items</p>
            <h3 className="text-2xl font-bold text-foreground mt-2">140 items</h3>
            <span className="text-xs font-semibold text-success flex items-center gap-1 mt-1.5">
              <TrendingUp size={12} />
              <span>+4% this week</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-accent-muted flex items-center justify-center text-accent">
            <Package size={22} />
          </div>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Low Stock SKU Alert</p>
            <h3 className="text-2xl font-bold text-foreground mt-2">3 SKUs</h3>
            <span className="text-xs font-semibold text-warning flex items-center gap-1 mt-1.5">
              <AlertTriangle size={12} />
              <span>Needs immediate reorder</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-warning-muted flex items-center justify-center text-warning">
            <BadgeAlert size={22} />
          </div>
        </div>

        <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Estimated Valuation</p>
            <h3 className="text-2xl font-bold text-foreground mt-2">$24,850</h3>
            <span className="text-xs font-semibold text-foreground-muted flex items-center gap-1 mt-1.5">
              <ArrowUpRight size={12} />
              <span>Asset valuation model</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-background-secondary flex items-center justify-center text-foreground-secondary">
            <Package size={22} />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-3 bg-background-secondary/20">
          <Search size={18} className="text-foreground-muted shrink-0" />
          <input
            type="text"
            placeholder="Search inventory assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-foreground placeholder-foreground-muted w-full font-medium"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-background-secondary/50">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-foreground-muted">Asset Name</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-foreground-muted">SKU Code</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-foreground-muted">Category</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-foreground-muted">Stock Qty</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-foreground-muted">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-foreground-muted">Unit Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-surface-hover/40 transition-colors">
                  <td className="px-6 py-4.5 font-semibold text-foreground text-sm">{item.name}</td>
                  <td className="px-6 py-4.5 text-xs font-bold text-accent">{item.id}</td>
                  <td className="px-6 py-4.5 text-xs font-semibold text-foreground-secondary">{item.category}</td>
                  <td className="px-6 py-4.5 text-sm font-semibold text-foreground-secondary">{item.stock} {item.unit}</td>
                  <td className="px-6 py-4.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      item.status === "In Stock" ? "bg-success-muted text-success border border-success/20" :
                      item.status === "Low Stock" ? "bg-warning-muted text-warning border border-warning/20" :
                      "bg-danger-muted text-danger border border-danger/20"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4.5 text-sm font-bold text-foreground">{item.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
