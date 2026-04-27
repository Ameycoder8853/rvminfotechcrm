"use client";

import { useState, useEffect } from "react";
import StatusBadge from "@/components/shared/status-badge";
import { Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

// Mock data
const initialLeads = [
  { id: "1", title: "Enterprise Cloud Solution", company: "TechVision Pvt Ltd", contact: "Priya Sharma", value: "₹4,50,000", status: "proposal", source: "website", assignedTo: "Amit", date: "22 Apr 2026" },
  { id: "2", title: "Network Infrastructure", company: "Sunrise Industries", contact: "Rajesh Kumar", value: "₹3,20,000", status: "negotiation", source: "referral", assignedTo: "Priya", date: "20 Apr 2026" },
  { id: "3", title: "Office Automation Suite", company: "CloudNet Solutions", contact: "Sneha Patel", value: "₹2,85,000", status: "qualified", source: "exhibition", assignedTo: "Rajesh", date: "18 Apr 2026" },
  { id: "4", title: "Security System Install", company: "Metro Enterprises", contact: "Vikram Singh", value: "₹1,95,000", status: "contacted", source: "cold_call", assignedTo: "Sneha", date: "16 Apr 2026" },
  { id: "5", title: "Server Upgrade Pack", company: "Apex Digital", contact: "Meera Joshi", value: "₹1,60,000", status: "new", source: "social_media", assignedTo: "Vikram", date: "15 Apr 2026" },
  { id: "6", title: "ERP Integration", company: "DataFlow Systems", contact: "Arjun Mehta", value: "₹5,80,000", status: "won", source: "referral", assignedTo: "Amit", date: "12 Apr 2026" },
  { id: "7", title: "VoIP Phone System", company: "ConnectHub", contact: "Nisha Verma", value: "₹90,000", status: "lost", source: "website", assignedTo: "Priya", date: "10 Apr 2026" },
];

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
  const [leads, setLeads] = useState(initialLeads);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredLeads = leads.filter(
    (l) =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const updatedLeads = Array.from(leads);
    const leadIndex = updatedLeads.findIndex((l) => l.id === draggableId);
    if (leadIndex === -1) return;

    const lead = { ...updatedLeads[leadIndex], status: destination.droppableId };
    
    // Remove from old position and add to new (if sorting within column, but here we mostly care about status change)
    // For a real Kanban, we'd need to handle sorting order too, but for now we update status.
    updatedLeads[leadIndex] = lead;
    setLeads(updatedLeads);

    // TODO: Connect to API to persist change
    console.log(`Moved lead ${draggableId} to ${destination.droppableId}`);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Lead Management</h1>
          <p className="text-sm text-[var(--foreground-secondary)] mt-1">
            Track and manage your sales pipeline
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-[var(--accent)]/20">
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

        {/* View Toggle */}
        <div className="flex items-center bg-[var(--surface)] border border-[var(--border)] rounded-lg p-1">
          <button
            onClick={() => setView("table")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              view === "table"
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setView("kanban")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              view === "kanban"
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
            }`}
          >
            Kanban
          </button>
        </div>
      </div>

      {/* Table View */}
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
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)] hidden lg:table-cell">Assigned</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)] hidden lg:table-cell">Source</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-[var(--foreground)]">{lead.title}</p>
                        <p className="text-xs text-[var(--foreground-muted)] md:hidden">{lead.company}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--foreground-secondary)] hidden md:table-cell">{lead.company}</td>
                    <td className="px-4 py-3 font-semibold text-[var(--foreground)]">{lead.value}</td>
                    <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                    <td className="px-4 py-3 text-[var(--foreground-secondary)] hidden lg:table-cell">{lead.assignedTo}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs px-2 py-1 rounded bg-[var(--background-secondary)] text-[var(--foreground-secondary)] capitalize">
                        {lead.source.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded-md text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-active)] transition-colors"><Eye size={15} /></button>
                        <button className="p-1.5 rounded-md text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-active)] transition-colors"><Edit size={15} /></button>
                        <button className="p-1.5 rounded-md text-[var(--foreground-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-muted)] transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Kanban View */}
      {view === "kanban" && (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-thin scrollbar-thumb-[var(--border)]">
            {kanbanColumns.map((col) => {
              const colLeads = filteredLeads.filter((l) => l.status === col.key);
              return (
                <div
                  key={col.key}
                  className="min-w-[300px] w-[300px] shrink-0 flex flex-col bg-[var(--background-secondary)]/30 rounded-xl border border-[var(--border)] h-[calc(100vh-280px)]"
                >
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)]/50 rounded-t-xl">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                    <span className="text-sm font-bold text-[var(--foreground)]">{col.label}</span>
                    <span className="ml-auto text-xs font-medium text-[var(--foreground-muted)] bg-[var(--surface)] px-2 py-0.5 rounded-full border border-[var(--border)]">
                      {colLeads.length}
                    </span>
                  </div>
                  
                  <Droppable droppableId={col.key}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`p-3 flex-1 overflow-y-auto space-y-3 transition-colors ${
                          snapshot.isDraggingOver ? "bg-[var(--accent-muted)]/5" : ""
                        }`}
                      >
                        {colLeads.map((lead, index) => (
                          <Draggable key={lead.id} draggableId={lead.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 shadow-sm hover:border-[var(--accent)]/50 transition-all group ${
                                  snapshot.isDragging ? "shadow-2xl border-[var(--accent)] ring-2 ring-[var(--accent)]/20 rotate-1 scale-[1.02] z-50" : ""
                                }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="text-sm font-bold text-[var(--foreground)] leading-tight group-hover:text-[var(--accent)] transition-colors">
                                    {lead.title}
                                  </h3>
                                  <GripVertical size={14} className="text-[var(--foreground-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                                </div>
                                <p className="text-xs text-[var(--foreground-secondary)] mb-4">{lead.company}</p>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)] font-semibold">Value</span>
                                    <span className="text-xs font-bold text-[var(--foreground)]">{lead.value}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex flex-col items-end mr-1">
                                      <span className="text-[10px] text-[var(--foreground-muted)]">Owner</span>
                                      <span className="text-[11px] font-medium text-[var(--foreground-secondary)]">{lead.assignedTo}</span>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-xs font-bold text-[var(--accent)] shadow-inner">
                                      {lead.assignedTo.charAt(0)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {colLeads.length === 0 && !snapshot.isDraggingOver && (
                          <div className="flex flex-col items-center justify-center py-10 opacity-40">
                            <div className="w-12 h-12 rounded-full bg-[var(--surface)] border-2 border-dashed border-[var(--border)] flex items-center justify-center mb-2">
                              <Plus size={20} className="text-[var(--foreground-muted)]" />
                            </div>
                            <p className="text-xs text-[var(--foreground-muted)] font-medium">Drop here</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}
    </div>
  );
}
