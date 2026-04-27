"use client";

import { useState, useEffect, useCallback } from "react";
import StatusBadge from "@/components/shared/status-badge";
import { Plus, Search, AlertCircle, Eye, Edit, CheckCircle, Loader2, Trash2 } from "lucide-react";
import Modal from "@/components/shared/modal";

interface Ticket {
  _id: string;
  ticketNumber: string;
  customer?: { _id: string; firstName: string; lastName: string; company: string };
  title: string;
  category: string;
  priority: string;
  status: string;
  assignedTech?: { _id: string; firstName: string; lastName: string };
  createdAt: string;
}

const priorityColors: Record<string, string> = {
  critical: "var(--danger)",
  high: "#f59e0b",
  medium: "var(--info)",
  low: "var(--foreground-muted)",
};

export default function TicketsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [techs, setTechs] = useState<any[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<Partial<Ticket> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [ticketsRes, customersRes, usersRes] = await Promise.all([
        fetch("/api/tickets"),
        fetch("/api/contacts"),
        fetch("/api/users"),
      ]);
      
      const ticketsData = await ticketsRes.json();
      const customersData = await customersRes.json();
      const usersData = await usersRes.json();

      if (ticketsData.success) setTickets(ticketsData.data);
      if (customersData.success) setCustomers(customersData.data);
      if (usersData.success) setTechs(usersData.data);
    } catch (error) {
      console.error("Failed to fetch ticket data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [fetchData]);

  const filtered = tickets.filter(
    (t) => 
      t.ticketNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.customer?.company?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (ticket: Partial<Ticket> | null = null) => {
    setCurrentTicket(ticket || {
      title: "",
      category: "service_request",
      priority: "medium",
      status: "open",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTicket) return;

    try {
      setIsSubmitting(true);
      const url = currentTicket._id ? `/api/tickets/${currentTicket._id}` : "/api/tickets";
      const method = currentTicket._id ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentTicket),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error("Failed to save ticket:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this ticket?")) return;
    try {
      const res = await fetch(`/api/tickets/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to delete ticket:", error);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Service Tickets</h1>
          <p className="text-sm text-[var(--foreground-secondary)] mt-1">Manage real complaints and service requests</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-[var(--accent)]/20 active:scale-95"
        >
          <Plus size={18} />
          <span>New Ticket</span>
        </button>
      </div>

      {/* Priority Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {["critical", "high", "medium", "low"].map((p) => {
          const count = tickets.filter(t => t.priority === p).length;
          return (
            <div key={p} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: priorityColors[p] }} />
              <div>
                <p className="text-lg font-bold text-[var(--foreground)]">{count}</p>
                <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">{p}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 max-w-sm">
        <Search size={16} className="text-[var(--foreground-muted)]" />
        <input type="text" placeholder="Search tickets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] w-full" />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin mb-4" />
          <p className="text-sm text-[var(--foreground-secondary)]">Loading tickets...</p>
        </div>
      ) : (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--background-secondary)]/50">
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Ticket</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)] hidden md:table-cell">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Issue</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Priority</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ticket) => (
                  <tr key={ticket._id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={14} style={{ color: priorityColors[ticket.priority] }} />
                        <span className="font-bold text-[var(--foreground)] text-xs">{ticket.ticketNumber}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--foreground-secondary)] hidden md:table-cell">{ticket.customer?.company || "No Company"}</td>
                    <td className="px-4 py-3 text-[var(--foreground-secondary)] max-w-[200px] truncate font-medium">{ticket.title}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold capitalize" style={{ color: priorityColors[ticket.priority] }}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={ticket.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleOpenModal(ticket)} className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-active)] transition-colors"><Edit size={16} /></button>
                        {ticket.status !== "resolved" && (
                          <button onClick={() => handleUpdateStatus(ticket._id, "resolved")} className="p-1.5 rounded-lg text-[var(--success)] hover:bg-[var(--success-muted)] transition-colors" title="Resolve"><CheckCircle size={16} /></button>
                        )}
                        <button onClick={() => handleDelete(ticket._id)} className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-muted)] transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-[var(--foreground-muted)] italic">No tickets found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ticket Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentTicket?._id ? `Edit Ticket ${currentTicket.ticketNumber}` : "Open New Ticket"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Issue Title</label>
            <input 
              required
              value={currentTicket?.title || ""}
              onChange={(e) => setCurrentTicket({ ...currentTicket, title: e.target.value })}
              className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              placeholder="e.g. Printer not working"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Customer</label>
            <select 
              value={(currentTicket?.customer as any)?._id || (currentTicket?.customer as any) || ""}
              onChange={(e) => setCurrentTicket({ ...currentTicket, customer: e.target.value as any })}
              className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
            >
              <option value="">Select Customer</option>
              {customers.map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName} ({c.company})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Category</label>
              <select 
                value={currentTicket?.category || "service_request"}
                onChange={(e) => setCurrentTicket({ ...currentTicket, category: e.target.value })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              >
                <option value="complaint">Complaint</option>
                <option value="service_request">Service Request</option>
                <option value="installation">Installation</option>
                <option value="general">General</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Priority</label>
              <select 
                value={currentTicket?.priority || "medium"}
                onChange={(e) => setCurrentTicket({ ...currentTicket, priority: e.target.value })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Assign Technician</label>
            <select 
              value={(currentTicket?.assignedTech as any)?._id || (currentTicket?.assignedTech as any) || ""}
              onChange={(e) => setCurrentTicket({ ...currentTicket, assignedTech: e.target.value as any })}
              className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
            >
              <option value="">Unassigned</option>
              {techs.map(t => <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-all">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-bold shadow-lg shadow-[var(--accent)]/20 transition-all flex items-center gap-2">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              <span>{currentTicket?._id ? "Update Ticket" : "Open Ticket"}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
