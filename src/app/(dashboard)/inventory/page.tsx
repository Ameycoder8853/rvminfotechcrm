"use client";

import { useState } from "react";
import { Package, Search, Plus, ArrowUpRight, TrendingUp, AlertTriangle, BadgeAlert } from "lucide-react";

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <div className="space-y-6 animate-fade-in p-2 lg:p-4 bg-[#f8f9fc] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Package size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Inventory & Assets</h1>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-all shadow-md active:scale-95 cursor-pointer">
          <Plus size={16} className="stroke-[3]" />
          <span>Add Asset</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total SKU Items</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-2">140 items</h3>
            <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1 mt-1.5">
              <TrendingUp size={12} />
              <span>+4% this week</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Package size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock SKU Alert</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-2">3 SKUs</h3>
            <span className="text-xs font-semibold text-amber-500 flex items-center gap-1 mt-1.5">
              <AlertTriangle size={12} />
              <span>Needs immediate reorder</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <BadgeAlert size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Valuation</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-2">$24,850</h3>
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mt-1.5">
              <ArrowUpRight size={12} />
              <span>Asset valuation model</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600">
            <Package size={22} />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/20">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search inventory assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400 w-full font-medium"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Asset Name</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">SKU Code</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Category</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Stock Qty</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Unit Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-6 py-4.5 font-semibold text-slate-800 text-sm">{item.name}</td>
                  <td className="px-6 py-4.5 text-xs font-bold text-indigo-600">{item.id}</td>
                  <td className="px-6 py-4.5 text-xs font-semibold text-slate-500">{item.category}</td>
                  <td className="px-6 py-4.5 text-sm font-semibold text-slate-700">{item.stock} {item.unit}</td>
                  <td className="px-6 py-4.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      item.status === "In Stock" ? "bg-emerald-50 text-emerald-600 border border-emerald-100/40" :
                      item.status === "Low Stock" ? "bg-amber-50 text-amber-600 border border-amber-100/40" :
                      "bg-red-50 text-red-600 border border-red-100/40"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4.5 text-sm font-bold text-slate-800">{item.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
