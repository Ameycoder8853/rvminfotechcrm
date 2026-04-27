"use client";

import { useState, useEffect, useCallback } from "react";
import { Phone, Mail, Search, Plus, Loader2, Clock, CheckCircle2, XCircle, MoreVertical, MessageSquare } from "lucide-react";
import StatusBadge from "@/components/shared/status-badge";
import Modal from "@/components/shared/modal";

export default function CommsPage() {
  const [activeTab, setActiveTab] = useState<"calls" | "emails">("calls");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);

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

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Communications</h1>
          <p className="text-sm text-[var(--foreground-secondary)] mt-1">Manage customer interactions via call and email</p>
        </div>
        <button 
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-[var(--accent)]/20"
        >
          <Plus size={18} /><span>Log {activeTab === "calls" ? "Call" : "Email"}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[var(--background-secondary)] rounded-xl w-fit">
        <button 
          onClick={() => setActiveTab("calls")}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "calls" ? "bg-[var(--surface)] text-[var(--accent)] shadow-sm" : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"}`}
        >
          <Phone size={16} /><span>Call App</span>
        </button>
        <button 
          onClick={() => setActiveTab("emails")}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "emails" ? "bg-[var(--surface)] text-[var(--accent)] shadow-sm" : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"}`}
        >
          <Mail size={16} /><span>Email</span>
        </button>
      </div>

      {/* Log History */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--background-secondary)]/50">
                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Customer</th>
                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Staff Member</th>
                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">{activeTab === "calls" ? "Duration" : "Subject"}</th>
                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Status</th>
                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr><td colSpan={5} className="py-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--accent)]" /></td></tr>
              ) : data.map((log) => (
                <tr key={log._id} className="hover:bg-[var(--surface-hover)] transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-[var(--foreground)]">{log.customer?.company || `${log.customer?.firstName} ${log.customer?.lastName}`}</p>
                    <p className="text-[10px] text-[var(--foreground-muted)] font-medium">{log.customer?.phone || log.customer?.email}</p>
                  </td>
                  <td className="px-6 py-4 text-[var(--foreground-secondary)] font-medium">{log.user?.firstName} {log.user?.lastName}</td>
                  <td className="px-6 py-4">
                    {activeTab === "calls" ? (
                      <span className="text-[var(--foreground-secondary)] font-bold">{Math.floor(log.duration / 60)}m {log.duration % 60}s</span>
                    ) : (
                      <span className="text-[var(--foreground-secondary)] font-medium truncate max-w-[200px] block">{log.subject}</span>
                    )}
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={log.type || log.status} /></td>
                  <td className="px-6 py-4 text-[var(--foreground-muted)] text-xs font-medium">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {data.length === 0 && !loading && (
                <tr><td colSpan={5} className="py-20 text-center text-[var(--foreground-muted)] italic">No communication logs found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Log ${activeTab === "calls" ? "Call" : "Email"}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Customer</label>
            <select 
              required
              value={currentLog?.customer || ""}
              onChange={(e) => setCurrentLog({ ...currentLog, customer: e.target.value })}
              className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
            >
              <option value="">Select Customer</option>
              {customers.map(c => (
                <option key={c._id} value={c._id}>{c.company || `${c.firstName} ${c.lastName}`}</option>
              ))}
            </select>
          </div>
          {activeTab === "calls" ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Type</label>
                <select 
                  value={currentLog?.type || "outbound"}
                  onChange={(e) => setCurrentLog({ ...currentLog, type: e.target.value })}
                  className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
                >
                  <option value="outbound">Outbound</option>
                  <option value="inbound">Inbound</option>
                  <option value="missed">Missed</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Duration (seconds)</label>
                <input 
                  type="number"
                  value={currentLog?.duration || 0}
                  onChange={(e) => setCurrentLog({ ...currentLog, duration: parseInt(e.target.value) })}
                  className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Subject</label>
                <input 
                  required
                  value={currentLog?.subject || ""}
                  onChange={(e) => setCurrentLog({ ...currentLog, subject: e.target.value })}
                  className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
                  placeholder="Email subject..."
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Body</label>
                <textarea 
                  required
                  rows={4}
                  value={currentLog?.body || ""}
                  onChange={(e) => setCurrentLog({ ...currentLog, body: e.target.value })}
                  className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none resize-none"
                  placeholder="Type your message here..."
                />
              </div>
            </>
          )}
          <div className="flex justify-end gap-3 pt-4">
             <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-[var(--foreground-secondary)] hover:bg-[var(--surface-hover)]">Cancel</button>
             <button type="submit" className="px-8 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-bold shadow-lg shadow-[var(--accent)]/20 transition-all">Save Log</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
