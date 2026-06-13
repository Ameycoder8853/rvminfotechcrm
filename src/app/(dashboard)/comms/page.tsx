"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Phone, 
  Mail, 
  Search, 
  Plus, 
  Loader2, 
  Clock, 
  MoreVertical, 
  Calendar, 
  SlidersHorizontal, 
  Download, 
  Sliders, 
  Tag, 
  ChevronDown, 
  ArrowUpDown,
  CheckCircle,
  XCircle,
  HelpCircle,
  Sparkles,
  Trash2
} from "lucide-react";
import StatusBadge from "@/components/shared/status-badge";
import Modal from "@/components/shared/modal";

interface CallRecord {
  _id: string;
  customer?: {
    _id: string;
    firstName: string;
    lastName: string;
    company?: string;
    phone?: string;
    email?: string;
  };
  user?: {
    firstName: string;
    lastName: string;
  };
  type: "inbound" | "outbound" | "missed";
  duration: number; // in seconds
  notes?: string;
  outcome?: string;
  createdAt: string;
}

export default function CommsPage() {
  const [activeTab, setActiveTab] = useState<"calls" | "emails">("calls");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLog, setCurrentLog] = useState<any>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [commsRes, custRes] = await Promise.all([
        fetch(`/api/comms?type=${activeTab}`),
        fetch("/api/contacts")
      ]);

      if (!commsRes.ok || !custRes.ok) {
        throw new Error("Communication sync failed");
      }

      const commsData = await commsRes.json();
      const custData = await custRes.json();
      if (commsData.success) setData(commsData.data);
      if (custData.success) setCustomers(custData.data);
    } catch (error) {
      console.error("Failed to fetch comms:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [fetchData]);

  const handleOpenModal = () => {
    setCurrentLog({
      customer: "",
      type: activeTab === "calls" ? "outbound" : "sent",
      subject: "",
      body: "",
      notes: "",
      duration: 0,
      logType: activeTab === "calls" ? "call" : "email"
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/comms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentLog),
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error("Failed to log comms:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this log entry?")) return;
    try {
      const res = await fetch(`/api/comms/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to delete log entry:", error);
    }
  };

  // Helper: format duration to M:SS or H:MM:SS
  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Helper: derive mock values for Retell dashboard compliance
  const getMockCallDetails = (log: CallRecord) => {
    const timeStr = new Date(log.createdAt).toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }) + " IST";

    // Cost: $0.161 if active, $0.000 if 0 duration
    const cost = log.duration > 0 
      ? `$${(0.08 + (log.duration * 0.0005)).toFixed(3)}` 
      : "$0.000";

    // Session ID format
    const sessionId = `call_${log._id.slice(-24)}`;

    // End Reason & Session Status & User Sentiment
    let endReason = "user hangup";
    let endReasonColor = "#22c55e"; // green
    let sessionStatus = "ended";
    let sessionStatusColor = "#ffffff";
    let sentiment = "Neutral";
    let sentimentColor = "bg-slate-500/10 text-slate-300 border-slate-500/20";

    if (log.type === "missed") {
      endReason = "dial no answer";
      endReasonColor = "#ef4444"; // red
      sessionStatus = "not_connected";
      sessionStatusColor = "#64748b"; // muted gray
      sentiment = "Unknown";
      sentimentColor = "bg-slate-500/10 text-slate-400 border-slate-500/20";
    } else if (log.duration === 0) {
      endReason = "invalid destination";
      endReasonColor = "#f59e0b"; // orange
      sessionStatus = "not_connected";
      sessionStatusColor = "#64748b";
      sentiment = "Unknown";
      sentimentColor = "bg-slate-500/10 text-slate-400 border-slate-500/20";
    } else if (log.duration > 120) {
      sentiment = "Positive";
      sentimentColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    } else if (log.duration < 30) {
      sentiment = "Negative";
      sentimentColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";
    }

    const fromNum = "+16083365070";
    const toNum = log.customer?.phone || "+917588888570";

    return {
      timeStr,
      cost,
      sessionId,
      endReason,
      endReasonColor,
      sessionStatus,
      sessionStatusColor,
      sentiment,
      sentimentColor,
      fromNum,
      toNum
    };
  };

  const filteredData = data.filter((item) => {
    const matchQuery = searchQuery.toLowerCase();
    const customerName = item.customer 
      ? `${item.customer.firstName} ${item.customer.lastName} ${item.customer.company || ""}`.toLowerCase()
      : "";
    const subject = item.subject?.toLowerCase() || "";
    return customerName.includes(matchQuery) || subject.includes(matchQuery);
  });

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-fade-in text-foreground">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-muted border border-accent/20 flex items-center justify-center text-accent shadow-glow">
            {activeTab === "calls" ? <Phone size={20} className="animate-pulse" /> : <Mail size={20} />}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              {activeTab === "calls" ? "Call History" : "Email Communications"}
              <span className="text-[10px] uppercase font-semibold bg-accent-muted text-accent border border-accent/30 px-2 py-0.5 rounded-full tracking-widest flex items-center gap-1">
                <Sparkles size={10} /> Enterprise Live
              </span>
            </h1>
            <p className="text-xs text-foreground-secondary mt-0.5">
              {activeTab === "calls" 
                ? "Monitor live and historical VOIP calls, session costs, and AI user sentiments" 
                : "Manage and audit business-critical outgoing and incoming client emails"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2 text-sm max-w-xs focus-within:border-accent transition-all">
            <Search size={16} className="text-foreground-muted" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-foreground placeholder-foreground-muted w-full"
            />
          </div>

          <button 
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-xs font-semibold tracking-wider uppercase transition-all shadow-lg shadow-accent/25 active:scale-95 shrink-0 cursor-pointer"
          >
            <Plus size={14} />
            <span>Log {activeTab === "calls" ? "Call" : "Email"}</span>
          </button>
        </div>
      </div>

      {/* Retell Tab Selector */}
      <div className="flex items-center gap-1.5 p-1 bg-background-secondary border border-border rounded-xl w-fit">
        <button 
          onClick={() => {
            setActiveTab("calls");
            setData([]);
          }}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === "calls" 
              ? "bg-surface text-accent border border-border shadow-sm" 
              : "text-foreground-muted hover:text-foreground"
          }`}
        >
          <Phone size={14} />
          <span>Call History</span>
        </button>
        <button 
          onClick={() => {
            setActiveTab("emails");
            setData([]);
          }}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === "emails" 
              ? "bg-surface text-accent border border-border shadow-sm" 
              : "text-foreground-muted hover:text-foreground"
          }`}
        >
          <Mail size={14} />
          <span>Emails & Logs</span>
        </button>
      </div>

      {/* Retell-Inspired Call History Page Content */}
      <div className="space-y-4">
        
        {/* Call History Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-surface/50 border border-border rounded-xl p-3">
          
          {/* Left Toolbar */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-surface border border-border hover:bg-surface-hover text-xs font-semibold text-foreground rounded-lg transition-colors cursor-pointer">
              <Calendar size={14} className="text-foreground-secondary" />
              <span>Date Range</span>
              <ChevronDown size={12} className="text-foreground-muted" />
            </button>
            
            <button className="flex items-center gap-2 px-3 py-2 bg-surface border border-border hover:bg-surface-hover text-xs font-semibold text-foreground rounded-lg transition-colors cursor-pointer">
              <SlidersHorizontal size={14} className="text-foreground-secondary" />
              <span>Filter</span>
              <ChevronDown size={12} className="text-foreground-muted" />
            </button>
          </div>

          {/* Right Toolbar */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex items-center bg-surface border border-border rounded-lg p-1">
              <button className="p-1.5 hover:bg-surface-hover rounded text-foreground-muted hover:text-foreground transition-colors cursor-pointer">
                <ArrowUpDown size={13} />
              </button>
            </div>

            <button className="flex items-center gap-1.5 px-3 py-2 bg-surface border border-border hover:bg-surface-hover text-xs font-semibold text-foreground rounded-lg transition-colors cursor-pointer">
              <Download size={14} className="text-foreground-secondary" />
              <span>Export</span>
            </button>

            <button className="flex items-center gap-1.5 px-3 py-2 bg-surface border border-border hover:bg-surface-hover text-xs font-semibold text-foreground rounded-lg transition-colors cursor-pointer">
              <Sliders size={14} className="text-foreground-secondary" />
              <span>Customize View</span>
            </button>

            <button className="flex items-center gap-1.5 px-3 py-2 bg-surface border border-border hover:bg-surface-hover text-xs font-semibold text-foreground rounded-lg transition-colors cursor-pointer">
              <Tag size={14} className="text-foreground-secondary" />
              <span>Custom Attributes</span>
            </button>
          </div>
        </div>

        {/* Call History Table Panel */}
        <div className="bg-surface/30 border border-border rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            
            {activeTab === "calls" ? (
              // Calls Table
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-background-secondary border-b border-border text-foreground-secondary">
                    <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Time</th>
                    <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Duration</th>
                    <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Channel Type</th>
                    <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Cost</th>
                    <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Session ID</th>
                    <th className="px-4 py-3.5 font-bold uppercase tracking-wider">End Reason</th>
                    <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Session Status</th>
                    <th className="px-4 py-3.5 font-bold uppercase tracking-wider">User Sentiment</th>
                    <th className="px-4 py-3.5 font-bold uppercase tracking-wider">From</th>
                    <th className="px-4 py-3.5 font-bold uppercase tracking-wider">To</th>
                    <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface/10">
                  {loading ? (
                    <tr>
                      <td colSpan={11} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-8 h-8 animate-spin text-accent" />
                          <span className="text-foreground-secondary">Synchronizing Call History...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredData.map((log: CallRecord) => {
                    const details = getMockCallDetails(log);
                    return (
                      <tr key={log._id} className="hover:bg-surface-hover/50 transition-colors group">
                        {/* Time */}
                        <td className="px-5 py-4 font-medium text-foreground/90 whitespace-nowrap">
                          {details.timeStr}
                        </td>
                        {/* Duration */}
                        <td className="px-4 py-4 text-foreground-secondary font-semibold">
                          {formatDuration(log.duration)}
                        </td>
                        {/* Channel Type */}
                        <td className="px-4 py-4 text-foreground-muted font-medium">
                          phone_call
                        </td>
                        {/* Cost */}
                        <td className="px-4 py-4 text-accent font-bold">
                          {details.cost}
                        </td>
                        {/* Session ID */}
                        <td className="px-4 py-4 text-foreground-muted font-mono group-hover:text-accent transition-colors">
                          {details.sessionId}
                        </td>
                        {/* End Reason */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: details.endReasonColor }} />
                            <span className="text-foreground-secondary font-medium">{details.endReason}</span>
                          </div>
                        </td>
                        {/* Session Status */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: details.sessionStatusColor }} />
                            <span className="text-foreground-secondary font-medium">{details.sessionStatus}</span>
                          </div>
                        </td>
                        {/* User Sentiment */}
                        <td className="px-4 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${details.sentimentColor}`}>
                            {details.sentiment}
                          </span>
                        </td>
                        {/* From */}
                        <td className="px-4 py-4 text-foreground-muted font-medium whitespace-nowrap">
                          {details.fromNum}
                        </td>
                        {/* To */}
                        <td className="px-4 py-4 text-foreground-muted font-medium whitespace-nowrap">
                          {details.toNum}
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-4 text-right whitespace-nowrap">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(log._id); }}
                            className="p-1.5 rounded-md text-foreground-muted hover:text-danger hover:bg-danger-muted transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Delete log"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredData.length === 0 && !loading && (
                    <tr>
                      <td colSpan={11} className="py-20 text-center text-foreground-muted italic">
                        No calls found. Log a call using the top right button to populate the board!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              // Emails Table
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-background-secondary border-b border-border text-foreground-secondary">
                    <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Recipient / Company</th>
                    <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Sender</th>
                    <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Subject & Preview</th>
                    <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Timestamp</th>
                    <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface/10">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-8 h-8 animate-spin text-accent" />
                          <span className="text-foreground-secondary">Synchronizing Email Logs...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredData.map((log: any) => (
                    <tr key={log._id} className="hover:bg-surface-hover/50 transition-colors group">
                      <td className="px-5 py-4">
                        <p className="font-bold text-foreground/90">
                          {log.customer?.company || `${log.customer?.firstName} ${log.customer?.lastName}`}
                        </p>
                        <p className="text-[10px] text-foreground-muted font-medium mt-0.5">
                          {log.customer?.email}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-foreground-secondary font-medium">
                        {log.user?.firstName} {log.user?.lastName}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-foreground-secondary font-semibold">{log.subject}</p>
                        <p className="text-[10px] text-foreground-muted truncate max-w-sm mt-0.5">{log.body}</p>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={log.status || "sent"} />
                      </td>
                      <td className="px-5 py-4 text-foreground-muted whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(log._id); }}
                          className="p-1.5 rounded-md text-foreground-muted hover:text-danger hover:bg-danger-muted transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Delete log"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredData.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6} className="py-20 text-center text-foreground-muted italic">
                        No email logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

          </div>
        </div>

        {/* Retell-Inspired Premium Pagination Footer */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between text-xs text-foreground-secondary px-2 py-4">
          <div>
            Page 1 of 1 • Total Session: <span className="text-foreground font-bold">{filteredData.length}</span>
          </div>

          <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-0.5">
            <button className="px-2.5 py-1.5 text-foreground-muted/40 hover:text-foreground transition-colors cursor-pointer" disabled>&lt;</button>
            <button className="px-3 py-1 bg-accent hover:bg-accent-hover text-white font-bold rounded-md cursor-pointer">1</button>
            <button className="px-2.5 py-1.5 text-foreground-muted/40 hover:text-foreground transition-colors cursor-pointer" disabled>&gt;</button>
          </div>

          <div className="flex items-center gap-2">
            <span>50 / page</span>
            <div className="p-1 bg-surface border border-border rounded-lg text-foreground-secondary cursor-pointer hover:border-border-hover">
              <ChevronDown size={14} />
            </div>
          </div>
        </div>

      </div>

      {/* Modern Dialog Form for Logging Calls & Emails */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={`Log New ${activeTab === "calls" ? "Call Session" : "Client Email"}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-foreground-secondary uppercase tracking-widest mb-1.5 block">Customer / Lead</label>
            <select 
              required
              value={currentLog?.customer || ""}
              onChange={(e) => setCurrentLog({ ...currentLog, customer: e.target.value })}
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:border-accent outline-none transition-all"
            >
              <option value="" className="bg-surface">Select Customer</option>
              {customers.map(c => (
                <option key={c._id} value={c._id} className="bg-surface">{c.company || `${c.firstName} ${c.lastName}`}</option>
              ))}
            </select>
          </div>

          {activeTab === "calls" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-foreground-secondary uppercase tracking-widest mb-1.5 block">Call Direction</label>
                <select 
                  value={currentLog?.type || "outbound"}
                  onChange={(e) => setCurrentLog({ ...currentLog, type: e.target.value })}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:border-accent outline-none transition-all"
                >
                  <option value="outbound" className="bg-surface">Outbound</option>
                  <option value="inbound" className="bg-surface">Inbound</option>
                  <option value="missed" className="bg-surface">Missed (No Answer)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-foreground-secondary uppercase tracking-widest mb-1.5 block">Duration (seconds)</label>
                <input 
                  type="number"
                  value={currentLog?.duration || 0}
                  onChange={(e) => setCurrentLog({ ...currentLog, duration: parseInt(e.target.value) || 0 })}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:border-accent outline-none transition-all"
                  placeholder="e.g. 120"
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="text-[10px] font-bold text-foreground-secondary uppercase tracking-widest mb-1.5 block">Subject</label>
                <input 
                  required
                  value={currentLog?.subject || ""}
                  onChange={(e) => setCurrentLog({ ...currentLog, subject: e.target.value })}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:border-accent outline-none transition-all"
                  placeholder="Email subject..."
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-foreground-secondary uppercase tracking-widest mb-1.5 block">Body Content</label>
                <textarea 
                  required
                  rows={4}
                  value={currentLog?.body || ""}
                  onChange={(e) => setCurrentLog({ ...currentLog, body: e.target.value })}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:border-accent outline-none resize-none transition-all"
                  placeholder="Type your message here..."
                />
              </div>
            </>
          )}

          <div>
            <label className="text-[10px] font-bold text-foreground-secondary uppercase tracking-widest mb-1.5 block">Conversation Notes / Outcome</label>
            <input 
              value={currentLog?.notes || ""}
              onChange={(e) => setCurrentLog({ ...currentLog, notes: e.target.value })}
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:border-accent outline-none transition-all"
              placeholder="e.g. Discussed proposal, follow up tomorrow"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              className="px-6 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase text-foreground-secondary hover:bg-surface-hover transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-8 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-bold tracking-wider uppercase shadow-lg shadow-accent/25 active:scale-95 transition-all cursor-pointer"
            >
              Save Log
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
