"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import StatusBadge from "@/components/shared/status-badge";
import { Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2, GripVertical, Loader2, Upload, Download, Shield, User, Mail, Building2, Phone, Globe, MapPin, Check, PhoneCall, Activity, Share2, Users, HelpCircle, Briefcase, Handshake, Megaphone } from "lucide-react";
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
  { key: "won", label: "Won", color: "#22c55e" },
  { key: "lost", label: "Lost", color: "#ef4444" },
];

type ViewMode = "table" | "kanban";

export default function LeadsPage() {
  const [view, setView] = useState<ViewMode>("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLead, setCurrentLead] = useState<Partial<Lead> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper functions for date and time formatting
  const formatLeadDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
    } catch {
      return "N/A";
    }
  };

  const formatLeadTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    } catch {
      return "N/A";
    }
  };

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

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.company && l.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (l.email && l.email.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    const matchesSource = sourceFilter === "all" || l.source === sourceFilter;
    
    return !!(matchesSearch && matchesStatus && matchesSource);
  });

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div className="flex items-center gap-3">
          <PhoneCall size={28} className="text-accent" />
          <h1 className="text-2xl font-bold text-foreground">
            Leads <span className="text-foreground-secondary">({filteredLeads.length})</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsAnalyticsOpen(true)}
            className="flex items-center gap-2 text-sm font-semibold text-foreground-secondary hover:text-foreground transition-colors cursor-pointer"
          >
            <Activity size={16} />
            <span>Source Analytics</span>
          </button>
          
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
                className="flex items-center gap-2 px-3.5 py-2 bg-surface hover:bg-surface-hover border border-border text-foreground-secondary hover:text-foreground rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                title="Import from CSV"
              >
                <Upload size={15} />
                <span className="hidden md:inline">Import CSV</span>
              </button>
            </>
          )}
          
          <button
            onClick={handleCSVExport}
            className="flex items-center gap-2 px-3.5 py-2 bg-surface hover:bg-surface-hover border border-border text-foreground-secondary hover:text-foreground rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            title="Export to CSV"
          >
            <Download size={15} />
            <span className="hidden md:inline">Export CSV</span>
          </button>

          {canWrite && (
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-accent/20 active:scale-95 cursor-pointer"
            >
              <Plus size={16} />
              <span>Add Lead</span>
            </button>
          )}

          <div className="flex items-center bg-surface border border-border rounded-xl p-1 text-xs">
            <button 
              onClick={() => setView("table")} 
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${view === "table" ? "bg-accent text-white" : "text-foreground-secondary hover:text-foreground"}`}
            >
              Table
            </button>
            <button 
              onClick={() => setView("kanban")} 
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${view === "kanban" ? "bg-accent text-white" : "text-foreground-secondary hover:text-foreground"}`}
            >
              Kanban
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
          <Filter size={16} className="text-foreground-secondary" />
          <span>Advanced Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Search Input */}
          <div>
            <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">
              Search Leads
            </label>
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 text-foreground-muted" size={16} />
              <input
                type="text"
                placeholder="Name, email, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background-secondary border border-border rounded-xl !pl-10 py-2.5 text-sm text-foreground focus:border-accent outline-none transition-colors"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none cursor-pointer transition-colors"
            >
              <option value="all">All Statuses</option>
              {kanbanColumns.map((col) => (
                <option key={col.key} value={col.key}>
                  {col.label}
                </option>
              ))}
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">
              Source
            </label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none cursor-pointer transition-colors"
            >
              <option value="all">All Sources</option>
              <option value="website">Website</option>
              <option value="referral">Referral</option>
              <option value="cold_call">Cold Call</option>
              <option value="social_media">Social Media</option>
              <option value="email_campaign">Email Campaign</option>
              <option value="trade_show">Trade Show</option>
              <option value="partner">Partner</option>
              <option value="direct_mail">Direct Mail</option>
              <option value="other">Other</option>
            </select>
          </div>
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
            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
              {/* Table Card Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background-secondary/20">
                <span className="font-bold text-foreground text-sm">Lead Details</span>
                <span className="text-xs text-foreground-secondary font-medium">
                  Showing <strong className="text-foreground">{filteredLeads.length}</strong> leads
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-background-secondary/30">
                      <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-foreground-muted">Contact</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-foreground-muted">Company</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-foreground-muted">Status</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-foreground-muted">Source</th>
                      <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-foreground-muted">Created</th>
                      <th className="text-center px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-foreground-muted">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-sm text-foreground-secondary">
                          No leads found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.map((lead) => {
                        const renderSourceIcon = (src: string) => {
                          const iconClass = "text-foreground-muted shrink-0";
                          switch (src) {
                            case "website":
                              return <Globe size={14} className={iconClass} />;
                            case "cold_call":
                              return <Phone size={14} className={iconClass} />;
                            case "referral":
                              return <Users size={14} className={iconClass} />;
                            case "social_media":
                              return <Share2 size={14} className={iconClass} />;
                            case "email_campaign":
                              return <Mail size={14} className={iconClass} />;
                            case "trade_show":
                              return <Megaphone size={14} className={iconClass} />;
                            case "partner":
                              return <Handshake size={14} className={iconClass} />;
                            case "direct_mail":
                              return <Mail size={14} className={iconClass} />;
                            default:
                              return <HelpCircle size={14} className={iconClass} />;
                          }
                        };

                        const displaySource = (lead.source || "other").replace(/_/g, " ");

                        return (
                          <tr key={lead._id} className="hover:bg-surface-hover/40 transition-colors">
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <div className="font-bold text-foreground text-sm">{lead.title}</div>
                                {lead.email && (
                                  <div className="flex items-center gap-1.5 text-xs text-foreground-secondary">
                                    <Mail size={12} className="text-foreground-muted" />
                                    <span>{lead.email}</span>
                                  </div>
                                )}
                                {lead.phone && (
                                  <div className="flex items-center gap-1.5 text-xs text-foreground-secondary">
                                    <Phone size={12} className="text-foreground-muted" />
                                    <span>{lead.phone}</span>
                                  </div>
                                )}
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-accent-muted/20 border border-accent/15 flex items-center justify-center text-accent">
                                  <Briefcase size={14} />
                                </div>
                                <div className="space-y-0.5">
                                  <div className="font-bold text-foreground text-sm">
                                    {lead.company || "—"}
                                  </div>
                                  {lead.company && (
                                    <div className="text-[10px] font-semibold text-foreground-secondary uppercase tracking-wider">
                                      Corporate Client
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <StatusBadge status={lead.status} />
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-xs text-foreground font-semibold capitalize">
                                {renderSourceIcon(lead.source)}
                                <span>{displaySource}</span>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="space-y-0.5 text-xs">
                                <div className="font-bold text-foreground">
                                  {formatLeadDate(lead.createdAt)}
                                </div>
                                <div className="text-foreground-secondary font-medium">
                                  {formatLeadTime(lead.createdAt)}
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2.5">
                                {canWrite ? (
                                  <>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleOpenModal(lead); }} 
                                      className="w-8 h-8 rounded-full flex items-center justify-center bg-accent-muted/25 hover:bg-accent-muted/50 border border-accent/15 text-accent transition-all cursor-pointer"
                                      title="Edit Lead"
                                    >
                                      <Edit size={14} />
                                    </button>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleDelete(lead._id); }} 
                                      className="w-8 h-8 rounded-full flex items-center justify-center bg-danger-muted/25 hover:bg-danger-muted/50 border border-danger/15 text-danger transition-all cursor-pointer"
                                      title="Delete Lead"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-foreground-muted text-xs">—</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
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
                    className="w-full bg-background-secondary border border-border rounded-xl !pl-10 !pr-10 py-2.5 text-sm text-foreground focus:border-accent outline-none transition-colors"
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
                    className="w-full bg-background-secondary border border-border rounded-xl !pl-10 py-2.5 text-sm text-foreground focus:border-accent outline-none transition-colors"
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
                    className="w-full bg-background-secondary border border-border rounded-xl !pl-10 py-2.5 text-sm text-foreground focus:border-accent outline-none transition-colors"
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
                    className="w-full bg-background-secondary border border-border rounded-xl !pl-10 py-2.5 text-sm text-foreground focus:border-accent outline-none transition-colors"
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
                className="w-full bg-background-secondary border border-border rounded-xl !pl-10 py-2.5 text-sm text-foreground focus:border-accent outline-none transition-colors"
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
                className="w-full bg-background-secondary border border-border rounded-xl !pl-10 pr-4 py-2.5 text-sm text-foreground focus:border-accent outline-none transition-colors resize-none"
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
                <option value="email_campaign">Email Campaign</option>
                <option value="trade_show">Trade Show</option>
                <option value="partner">Partner</option>
                <option value="direct_mail">Direct Mail</option>
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

      {/* Source Analytics Modal */}
      <Modal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        title="Source Analytics"
      >
        <div className="space-y-6">
          <p className="text-xs text-foreground-secondary leading-relaxed">
            Breakdown of active leads grouped by their acquisition channel.
          </p>
          <div className="space-y-4">
            {Object.entries(
              leads.reduce((acc, lead) => {
                const src = lead.source || "other";
                acc[src] = (acc[src] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([source, count]) => {
              const total = leads.length || 1;
              const percentage = Math.round((count / total) * 100);
              const displayLabel = source.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
              
              return (
                <div key={source} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{displayLabel}</span>
                    <span className="text-foreground-secondary font-medium">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-background-secondary rounded-full overflow-hidden border border-border">
                    <div 
                      className="h-full bg-accent rounded-full transition-all duration-500" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
    </div>
  );
}
