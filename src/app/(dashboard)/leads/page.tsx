"use client";

import { useState, useEffect, useCallback } from "react";
import StatusBadge from "@/components/shared/status-badge";
import { Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2, GripVertical, Loader2 } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import Modal from "@/components/shared/modal";

interface Lead {
  _id: string;
  title: string;
  company?: string;
  contact?: string;
  value: number;
  status: string;
  source: string;
  assignedTo?: { _id: string; firstName: string; lastName: string };
  priority: string;
  createdAt: string;
}

const kanbanColumns = [
  { key: "new", label: "New", color: "#3b82f6" },
  { key: "contacted", label: "Contacted", color: "#f59e0b" },
  { key: "qualified", label: "Qualified", color: "#6366f1" },
  { key: "proposal", label: "Proposal", color: "#a855f7" },
  { key: "negotiation", label: "Negotiation", color: "#ec4899" },
  { key: "won", label: "Won", color: "#22c55e" },
  { key: "lost", label: "Lost", color: "#ef4444" },
];

type ViewMode = "table" | "kanban";

export default function LeadsPage() {
  const [view, setView] = useState<ViewMode>("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLead, setCurrentLead] = useState<Partial<Lead> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/leads");
      const data = await res.json();
      if (data.success) {
        setLeads(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchLeads();
    fetchUsers();
  }, [fetchLeads, fetchUsers]);

  const filteredLeads = leads.filter(
    (l) =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Optimistic update
    const updatedLeads = Array.from(leads);
    const leadIndex = updatedLeads.findIndex((l) => l._id === draggableId);
    if (leadIndex === -1) return;

    const lead = { ...updatedLeads[leadIndex], status: destination.droppableId };
    updatedLeads[leadIndex] = lead;
    setLeads(updatedLeads);

    try {
      await fetch(`/api/leads/${draggableId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: destination.droppableId }),
      });
    } catch (error) {
      console.error("Failed to update lead status:", error);
      fetchLeads(); // Revert on failure
    }
  };

  const handleOpenModal = (lead: Partial<Lead> | null = null) => {
    setCurrentLead(lead || {
      title: "",
      company: "",
      value: 0,
      status: "new",
      source: "website",
      priority: "medium",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLead) return;

    try {
      setIsSubmitting(true);
      const url = currentLead._id ? `/api/leads/${currentLead._id}` : "/api/leads";
      const method = currentLead._id ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentLead),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchLeads();
      }
    } catch (error) {
      console.error("Failed to save lead:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;

    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchLeads();
      }
    } catch (error) {
      console.error("Failed to delete lead:", error);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Lead Management</h1>
          <p className="text-sm text-[var(--foreground-secondary)] mt-1">
            Track and manage your sales pipeline with real data
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-[var(--accent)]/20 active:scale-95"
        >
          <Plus size={18} />
          <span>Add Lead</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 flex-1 sm:w-72">
            <Search size={16} className="text-[var(--foreground-muted)]" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] w-full"
            />
          </div>
          <button className="p-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:border-[var(--border-hover)] transition-colors">
            <Filter size={16} />
          </button>
        </div>

        <div className="flex items-center bg-[var(--surface)] border border-[var(--border)] rounded-lg p-1">
          <button onClick={() => setView("table")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === "table" ? "bg-[var(--accent)] text-white" : "text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"}`}>Table</button>
          <button onClick={() => setView("kanban")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === "kanban" ? "bg-[var(--accent)] text-white" : "text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"}`}>Kanban</button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin mb-4" />
          <p className="text-sm text-[var(--foreground-secondary)]">Loading pipeline...</p>
        </div>
      ) : (
        <>
          {view === "table" && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--background-secondary)]/50">
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Lead</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)] hidden md:table-cell">Company</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Value</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)] hidden lg:table-cell text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr key={lead._id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)] transition-colors">
                        <td className="px-4 py-3 font-medium text-[var(--foreground)]">{lead.title}</td>
                        <td className="px-4 py-3 text-[var(--foreground-secondary)] hidden md:table-cell">{lead.company}</td>
                        <td className="px-4 py-3 font-semibold text-[var(--foreground)]">₹{lead.value.toLocaleString()}</td>
                        <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleOpenModal(lead)} className="p-1.5 rounded-md text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-active)] transition-colors"><Edit size={15} /></button>
                            <button onClick={() => handleDelete(lead._id)} className="p-1.5 rounded-md text-[var(--foreground-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-muted)] transition-colors"><Trash2 size={15} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {view === "kanban" && (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-thin scrollbar-thumb-[var(--border)]">
                {kanbanColumns.map((col) => {
                  const colLeads = filteredLeads.filter((l) => l.status === col.key);
                  return (
                    <div key={col.key} className="min-w-[300px] w-[300px] shrink-0 flex flex-col bg-[var(--background-secondary)]/30 rounded-xl border border-[var(--border)] h-[calc(100vh-280px)]">
                      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)]/50 rounded-t-xl">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                        <span className="text-sm font-bold text-[var(--foreground)]">{col.label}</span>
                        <span className="ml-auto text-xs font-medium text-[var(--foreground-muted)] bg-[var(--surface)] px-2 py-0.5 rounded-full border border-[var(--border)]">{colLeads.length}</span>
                      </div>
                      <Droppable droppableId={col.key}>
                        {(provided, snapshot) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} className={`p-3 flex-1 overflow-y-auto space-y-3 transition-colors ${snapshot.isDraggingOver ? "bg-[var(--accent-muted)]/5" : ""}`}>
                            {colLeads.map((lead, index) => (
                              <Draggable key={lead._id} draggableId={lead._id} index={index}>
                                {(provided, snapshot) => (
                                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 shadow-sm hover:border-[var(--accent)]/50 transition-all group ${snapshot.isDragging ? "shadow-2xl border-[var(--accent)] ring-2 ring-[var(--accent)]/20 rotate-1 scale-[1.02] z-50" : ""}`}>
                                    <div className="flex items-start justify-between mb-1">
                                      <h3 className="text-sm font-bold text-[var(--foreground)] leading-tight group-hover:text-[var(--accent)] transition-colors">{lead.title}</h3>
                                      <GripVertical size={14} className="text-[var(--foreground-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <p className="text-xs text-[var(--foreground-secondary)] mb-3">{lead.company}</p>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-bold text-[var(--foreground)]">₹{lead.value.toLocaleString()}</span>
                                      <div className="flex items-center gap-1">
                                        <button onClick={() => handleOpenModal(lead)} className="p-1 rounded-md text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"><Edit size={13} /></button>
                                        <button onClick={() => handleDelete(lead._id)} className="p-1 rounded-md text-[var(--foreground-muted)] hover:text-[var(--danger)] transition-colors"><Trash2 size={13} /></button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  );
                })}
              </div>
            </DragDropContext>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentLead?._id ? "Edit Lead" : "Add New Lead"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Title</label>
            <input 
              required
              value={currentLead?.title || ""}
              onChange={(e) => setCurrentLead({ ...currentLead, title: e.target.value })}
              className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              placeholder="e.g. Server Upgrade"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Company</label>
              <input 
                value={currentLead?.company || ""}
                onChange={(e) => setCurrentLead({ ...currentLead, company: e.target.value })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
                placeholder="Client name"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Value (₹)</label>
              <input 
                type="number"
                value={currentLead?.value || 0}
                onChange={(e) => setCurrentLead({ ...currentLead, value: Number(e.target.value) })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Status</label>
              <select 
                value={currentLead?.status || "new"}
                onChange={(e) => setCurrentLead({ ...currentLead, status: e.target.value })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              >
                {kanbanColumns.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Assigned To</label>
              <select 
                value={(currentLead?.assignedTo as any)?._id || (currentLead?.assignedTo as any) || ""}
                onChange={(e) => setCurrentLead({ ...currentLead, assignedTo: e.target.value as any })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              >
                <option value="">Unassigned</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.firstName} {u.lastName}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-bold shadow-lg shadow-[var(--accent)]/20 transition-all flex items-center gap-2"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              <span>{currentLead?._id ? "Update Lead" : "Save Lead"}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
