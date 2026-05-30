"use client";

import { useState } from "react";
import { Megaphone, Search, Plus, TrendingUp, DollarSign, Target } from "lucide-react";

export default function MarketingPage() {
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <div className="space-y-6 animate-fade-in p-2 lg:p-4 bg-[#f8f9fc] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Megaphone size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Marketing Campaigns</h1>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-all shadow-md active:scale-95 cursor-pointer">
          <Plus size={16} className="stroke-[3]" />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Campaigns</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-2">3 Campaigns</h3>
            <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1 mt-1.5">
              <TrendingUp size={12} />
              <span>Running successfully</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Megaphone size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Ad Spend</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-2">$5,600</h3>
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mt-1.5">
              <span>Within budget constraints</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <DollarSign size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Leads Acquired</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-2">590 Leads</h3>
            <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1 mt-1.5">
              <Target size={12} />
              <span>~ $9.49 CAC average</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Target size={22} />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/20">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400 w-full font-medium"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Campaign Name</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Marketing Channel</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Ad Spend</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Leads Acquired</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Conversion Rate</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-6 py-4.5 font-semibold text-slate-800 text-sm">{c.name}</td>
                  <td className="px-6 py-4.5 text-xs font-semibold text-slate-500">{c.channel}</td>
                  <td className="px-6 py-4.5 text-sm font-semibold text-slate-700">{c.spend}</td>
                  <td className="px-6 py-4.5 text-sm font-semibold text-slate-700">{c.leads}</td>
                  <td className="px-6 py-4.5 text-sm font-bold text-indigo-600">{c.conversion}</td>
                  <td className="px-6 py-4.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      c.status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100/40" :
                      c.status === "Paused" ? "bg-amber-50 text-amber-600 border border-amber-100/40" :
                      "bg-slate-50 text-slate-600 border border-slate-200/40"
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
