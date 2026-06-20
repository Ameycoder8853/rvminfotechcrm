"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import StatusBadge from "@/components/shared/status-badge";
import { Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2, GripVertical, Loader2, Upload, Download, Shield, User, Mail, Building2, Phone, Globe, MapPin, Check } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import Modal from "@/components/shared/modal";
import { usePermission } from "@/hooks/use-permission";

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
  email?: string;
  phone?: string;
  webAddress?: string;
  address?: string;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/leads");
      const data = await res.json();
      if (data.success) {
        const mapped = data.data.map((l: any) => ({
          ...l,
          company: l.company || l.customer?.company || "",
        }));
        setLeads(mapped);
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

  useEffect(() => {
    if (!mounted) return;
    const params = new URLSearchParams(window.location.search);
    const action = params.get("action");
    if (action === "add") {
      handleOpenModal();
      const url = new URL(window.location.href);
      url.searchParams.delete("action");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, [mounted]);

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
      email: "",
      phone: "",
      webAddress: "",
      address: "",
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

  // Client-Side CSV Import Engine for Leads
  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        const lines = text.split(/\r?\n/);
        if (lines.length === 0) return alert("Empty CSV file!");

        // Parse CSV headers
        const parseCSVLine = (lineText: string): string[] => {
          const result: string[] = [];
          let inQuotes = false;
          let currentVal = "";
          for (let i = 0; i < lineText.length; i++) {
            const char = lineText[i];
            if (char === '"') {
              if (inQuotes && lineText[i + 1] === '"') {
                currentVal += '"';
                i++; // Skip next quote
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              result.push(currentVal.trim());
              currentVal = "";
            } else {
              currentVal += char;
            }
          }
          result.push(currentVal.trim());
          return result;
        };

        const headers = parseCSVLine(lines[0]);
        const parsedRows: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const matches = parseCSVLine(line);
          const row: any = {};
          headers.forEach((header, index) => {
            const val = matches[index] !== undefined ? matches[index] : "";
            row[header] = val;
          });
          parsedRows.push(row);
        }

        // Map and normalize CSV columns to DB Lead fields
        const normalized = parsedRows.map((row) => ({
          title: row.title || row["Title"] || row["Lead Name"] || "Imported Lead",
          company: row.company || row["Company"] || row["client name"] || "",
          value: Number(row.value || row["Value"] || row["Amount"] || 0),
          status: row.status || row["Status"] || "new",
          source: row.source || row["Source"] || "website",
          priority: row.priority || row["Priority"] || "medium",
          email: row.email || row["Email"] || row["Email Address"] || "",
          phone: row.phone || row["Phone"] || row["Phone Number"] || "",
          webAddress: row.webAddress || row["Web Address"] || row["Website"] || "",
          address: row.address || row["Address"] || "",
        }));

        if (normalized.length === 0) return alert("No valid rows found in CSV!");

        setLoading(true);
        const res = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(normalized),
        });

        if (res.ok) {
          alert(`Successfully imported ${normalized.length} leads!`);
          fetchLeads();
        } else {
          alert("Failed to import CSV data.");
        }
      } catch (err) {
        console.error("CSV Import error:", err);
        alert("Error parsing CSV. Please check formatting.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
  };

  // Client-Side CSV Export Engine for Leads
  const handleCSVExport = () => {
    if (filteredLeads.length === 0) return alert("No lead records to export!");

    const headers = ["Title", "Company", "Value", "Status", "Source", "Priority", "Email", "Phone", "Web Address", "Address", "Assigned To"];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...filteredLeads.map((l) =>
          [
            `"${l.title || ""}"`,
            `"${l.company || ""}"`,
            l.value || 0,
            `"${l.status || "new"}"`,
            `"${l.source || "website"}"`,
            `"${l.priority || "medium"}"`,
            `"${l.email || ""}"`,
            `"${l.phone || ""}"`,
            `"${l.webAddress || ""}"`,
            `"${l.address || ""}"`,
            `"${l.assignedTo ? `${l.assignedTo.firstName} ${l.assignedTo.lastName}` : "Unassigned"}"`,
          ].join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leads_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const { hasAccess, canWrite, loading: permLoading } = usePermission("leads");

  if (!mounted || permLoading) {
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
            You do not have the required permissions to access the Leads module. 
            Please contact your organization administrator to request access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lead Management</h1>
          <p className="text-sm text-foreground-secondary mt-1">
            Track and manage your sales pipeline with real data
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canWrite && (
            <>
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleCSVImport}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 bg-surface hover:bg-surface-hover border border-border text-foreground-secondary hover:text-foreground rounded-lg text-sm font-medium transition-colors"
                title="Import from CSV"
              >
                <Upload size={16} />
                <span className="hidden md:inline">Import CSV</span>
              </button>
            </>
          )}
          <button
            onClick={handleCSVExport}
            className="flex items-center gap-2 px-3 py-2 bg-surface hover:bg-surface-hover border border-border text-foreground-secondary hover:text-foreground rounded-lg text-sm font-medium transition-colors"
            title="Export to CSV"
          >
            <Download size={16} />
            <span className="hidden md:inline">Export CSV</span>
          </button>
          {canWrite && (
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-accent/20 active:scale-95"
            >
              <Plus size={18} />
              <span>Add Lead</span>
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2 flex-1 sm:w-72">
            <Search size={16} className="text-foreground-muted" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-foreground placeholder-foreground-muted w-full"
            />
          </div>
          <button className="p-2.5 bg-surface border border-border rounded-lg text-foreground-secondary hover:text-foreground hover:border-border-hover transition-colors">
            <Filter size={16} />
          </button>
        </div>

        <div className="flex items-center bg-surface border border-border rounded-lg p-1">
          <button onClick={() => setView("table")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === "table" ? "bg-accent text-white" : "text-foreground-secondary hover:text-foreground"}`}>Table</button>
          <button onClick={() => setView("kanban")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === "kanban" ? "bg-accent text-white" : "text-foreground-secondary hover:text-foreground"}`}>Kanban</button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
          <p className="text-sm text-foreground-secondary">Loading pipeline...</p>
        </div>
      ) : (
        <>
          {view === "table" && (
            <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-background-secondary/50">
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-foreground-muted">Lead</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-foreground-muted hidden md:table-cell">Company</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-foreground-muted">Value</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-foreground-muted">Status</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-foreground-muted hidden lg:table-cell text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr key={lead._id} className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{lead.title}</td>
                        <td className="px-4 py-3 text-foreground-secondary hidden md:table-cell">{lead.company}</td>
                        <td className="px-4 py-3 font-semibold text-foreground">₹{lead.value.toLocaleString()}</td>
                        <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                        <td className="px-4 py-3 text-right">
                          {canWrite ? (
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={(e) => { e.stopPropagation(); handleOpenModal(lead); }} className="p-1.5 rounded-md text-foreground-muted hover:text-foreground hover:bg-surface-active transition-colors"><Edit size={15} /></button>
                              <button onClick={(e) => { e.stopPropagation(); handleDelete(lead._id); }} className="p-1.5 rounded-md text-foreground-muted hover:text-danger hover:bg-danger-muted transition-colors"><Trash2 size={15} /></button>
                            </div>
                          ) : (
                            <span className="text-foreground-muted text-xs">—</span>
                          )}
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
              <div className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-thin scrollbar-thumb-border">
                {kanbanColumns.map((col) => {
                  const colLeads = filteredLeads.filter((l) => l.status === col.key);
                  return (
                    <div key={col.key} className="min-w-75 w-75 shrink-0 flex flex-col bg-background-secondary/30 rounded-xl border border-border h-[calc(100vh-280px)]">
                      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface/50 rounded-t-xl">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                        <span className="text-sm font-bold text-foreground">{col.label}</span>
                        <span className="ml-auto text-xs font-medium text-foreground-muted bg-surface px-2 py-0.5 rounded-full border border-border">{colLeads.length}</span>
                      </div>
                      <Droppable droppableId={col.key}>
                        {(provided, snapshot) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} className={`p-3 flex-1 overflow-y-auto space-y-3 transition-colors ${snapshot.isDraggingOver ? "bg-accent-muted/5" : ""}`}>
                            {colLeads.map((lead, index) => (
                              <Draggable key={lead._id} draggableId={lead._id} index={index} isDragDisabled={!canWrite}>
                                {(provided, snapshot) => (
                                  <div ref={provided.innerRef} {...provided.draggableProps} className={`bg-surface border border-border rounded-lg p-4 shadow-sm hover:border-accent/50 transition-all group ${snapshot.isDragging ? "shadow-2xl border-accent ring-2 ring-accent/20 rotate-1 scale-[1.02] z-50" : ""}`}>
                                    <div className="flex items-start justify-between mb-1">
                                      <h3 className="text-sm font-bold text-foreground leading-tight group-hover:text-accent transition-colors">{lead.title}</h3>
                                      {canWrite && (
                                        <div {...provided.dragHandleProps} className="p-1 -m-1 cursor-grab active:cursor-grabbing text-foreground-muted opacity-40 group-hover:opacity-100 transition-opacity">
                                          <GripVertical size={14} />
                                        </div>
                                      )}
                                    </div>
                                    <p className="text-xs text-foreground-secondary mb-3">{lead.company}</p>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-bold text-foreground">₹{lead.value.toLocaleString()}</span>
                                      {canWrite && (
                                        <div className="flex items-center gap-1">
                                          <button onClick={(e) => { e.stopPropagation(); handleOpenModal(lead); }} className="p-1 rounded-md text-foreground-muted hover:text-foreground transition-colors"><Edit size={13} /></button>
                                          <button onClick={(e) => { e.stopPropagation(); handleDelete(lead._id); }} className="p-1 rounded-md text-foreground-muted hover:text-danger transition-colors"><Trash2 size={13} /></button>
                                        </div>
                                      )}
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
          {/* Personal Information Section */}
          <div className="p-4 bg-background-tertiary/35 border border-border/55 rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <User size={16} className="text-accent" />
              <span>Personal Information</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">
                  Full Name <span className="text-danger">*</span>
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 text-foreground-muted" size={16} />
                  <input 
                    required
                    value={currentLead?.title || ""}
                    onChange={(e) => setCurrentLead({ ...currentLead, title: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl pl-10 pr-10 py-2.5 text-sm text-foreground focus:border-accent outline-none transition-colors"
                    placeholder="Enter full name"
                  />
                  {currentLead?.title && (
                    <Check className="absolute right-3.5 text-success" size={16} />
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">
                  Email Address <span className="text-danger">*</span>
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 text-foreground-muted" size={16} />
                  <input 
                    required
                    type="email"
                    value={currentLead?.email || ""}
                    onChange={(e) => setCurrentLead({ ...currentLead, email: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl pl-10 py-2.5 text-sm text-foreground focus:border-accent outline-none transition-colors"
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Company Information Section */}
          <div className="p-4 bg-background-tertiary/35 border border-border/55 rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <Building2 size={16} className="text-accent" />
              <span>Company Information</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">
                  Company Name
                </label>
                <div className="relative flex items-center">
                  <Building2 className="absolute left-3.5 text-foreground-muted" size={16} />
                  <input 
                    value={currentLead?.company || ""}
                    onChange={(e) => setCurrentLead({ ...currentLead, company: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl pl-10 py-2.5 text-sm text-foreground focus:border-accent outline-none transition-colors"
                    placeholder="Enter company name"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">
                  Phone Number
                </label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-3.5 text-foreground-muted" size={16} />
                  <input 
                    type="tel"
                    value={currentLead?.phone || ""}
                    onChange={(e) => setCurrentLead({ ...currentLead, phone: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl pl-10 py-2.5 text-sm text-foreground focus:border-accent outline-none transition-colors"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Web Address */}
          <div>
            <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">
              Web Address <span className="text-danger">*</span>
            </label>
            <div className="relative flex items-center">
              <Globe className="absolute left-3.5 text-foreground-muted" size={16} />
              <input 
                required
                type="url"
                value={currentLead?.webAddress || ""}
                onChange={(e) => setCurrentLead({ ...currentLead, webAddress: e.target.value })}
                className="w-full bg-background-secondary border border-border rounded-xl pl-10 py-2.5 text-sm text-foreground focus:border-accent outline-none transition-colors"
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">
              Address <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 text-foreground-muted" size={16} />
              <textarea 
                required
                rows={3}
                value={currentLead?.address || ""}
                onChange={(e) => setCurrentLead({ ...currentLead, address: e.target.value })}
                className="w-full bg-background-secondary border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:border-accent outline-none transition-colors resize-none"
                placeholder="Enter complete address"
              />
            </div>
          </div>

          {/* Status & Source Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">
                Status
              </label>
              <select 
                value={currentLead?.status || "new"}
                onChange={(e) => setCurrentLead({ ...currentLead, status: e.target.value })}
                className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none transition-colors cursor-pointer"
              >
                {kanbanColumns.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">
                Source
              </label>
              <select 
                value={currentLead?.source || "website"}
                onChange={(e) => setCurrentLead({ ...currentLead, source: e.target.value })}
                className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none transition-colors cursor-pointer"
              >
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="cold_call">Cold Call</option>
                <option value="social_media">Social Media</option>
                <option value="exhibition">Exhibition</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50 mt-6">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2.5 bg-background-secondary border border-border text-foreground hover:bg-surface-hover rounded-xl text-sm font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold shadow-lg shadow-accent/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              <span>{currentLead?._id ? "Update Lead" : "Create Lead"}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
