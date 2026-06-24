"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  Building, 
  Loader2, 
  Upload, 
  Download,
  Users,
  ChevronDown,
  ArrowLeft,
  User,
  Heart,
  Globe,
  MapPin,
  Tag,
  Calendar,
  XCircle,
  Save,
  Shield,
  Filter,
  Briefcase,
  HelpCircle,
  Share2,
  Megaphone,
  Handshake
} from "lucide-react";
import Modal from "@/components/shared/modal";
import { usePermission } from "@/hooks/use-permission";
import StatusBadge from "@/components/shared/status-badge";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  city?: string;
  status: string;
  source: string;
  gender?: string;
  state?: string;
  district?: string;
  subLocation?: string;
  department?: string;
  designation?: string;
  workAddress?: string;
  workPhone?: string;
  workPinCode?: string;
  websiteUrl?: string;
  product?: string;
  category?: string;
  subCategory?: string;
  reference?: string;
  classification?: string;
  group?: string;
  zone?: string;
  contactType?: string;
  dob?: string;
  planDate?: string;
  planActionType?: string;
  remarks?: string;
  additionalNotes?: string;
  assignedTo?: { _id: string; firstName: string; lastName: string };
  createdAt?: string;
}

type ViewMode = "list" | "new" | "edit";

export default function ContactsPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
 
  // Form states
  const [currentContact, setCurrentContact] = useState<Partial<Contact>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { hasAccess, canWrite, loading: permLoading } = usePermission("customers");

  // Helper functions for date and time formatting
  const formatContactDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
    } catch {
      return "N/A";
    }
  };

  const formatContactTime = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    } catch {
      return "N/A";
    }
  };

  const renderSourceIcon = (src: string) => {
    const iconClass = "text-foreground-muted shrink-0";
    const normalizedSrc = (src || "").toLowerCase();
    switch (normalizedSrc) {
      case "website":
        return <Globe size={14} className={iconClass} />;
      case "cold_call":
      case "cold call":
        return <Phone size={14} className={iconClass} />;
      case "referral":
        return <Users size={14} className={iconClass} />;
      case "social media":
      case "social_media":
        return <Share2 size={14} className={iconClass} />;
      case "email_campaign":
      case "email campaign":
        return <Mail size={14} className={iconClass} />;
      case "trade_show":
      case "trade show":
        return <Megaphone size={14} className={iconClass} />;
      case "partner":
        return <Handshake size={14} className={iconClass} />;
      default:
        return <HelpCircle size={14} className={iconClass} />;
    }
  };

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/contacts");
      const data = await res.json();
      if (data.success) {
        setContacts(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
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
    fetchContacts();
    fetchUsers();
  }, [fetchContacts, fetchUsers]);

  // URL search params trigger
  useEffect(() => {
    if (!mounted) return;
    const params = new URLSearchParams(window.location.search);
    const action = params.get("action");
    if (action === "add") {
      router.push("/contacts/new");
      const url = new URL(window.location.href);
      url.searchParams.delete("action");
      window.history.replaceState({}, "", url.pathname + url.search);
    } else if (action === "import") {
      fileInputRef.current?.click();
      const url = new URL(window.location.href);
      url.searchParams.delete("action");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, [mounted]);

  const filtered = contacts.filter((c) => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      fullName.includes(query) ||
      c.company?.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query) ||
      c.phone?.toLowerCase().includes(query);
      
    const matchesStatus = statusFilter === "" || c.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSource = sourceFilter === "" || c.source?.toLowerCase() === sourceFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  const handleOpenNewForm = () => {
    setCurrentContact({
      firstName: "",
      lastName: "",
      company: "",
      email: "",
      phone: "",
      city: "",
      status: "Lead",
      source: "website",
      gender: "",
      state: "",
      district: "",
      subLocation: "",
      department: "",
      designation: "",
      workAddress: "",
      workPhone: "",
      workPinCode: "",
      websiteUrl: "",
      product: "",
      category: "",
      subCategory: "",
      reference: "",
      classification: "",
      group: "",
      zone: "",
      contactType: "",
      dob: "",
      planDate: "",
      planActionType: "",
      remarks: "",
      additionalNotes: "",
      assignedTo: undefined,
    });
    setViewMode("new");
  };

  const handleOpenEditForm = (contact: Contact) => {
    setCurrentContact({
      ...contact,
      assignedTo: (contact.assignedTo as any)?._id || contact.assignedTo || undefined,
    });
    setViewMode("edit");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentContact) return;

    try {
      setIsSubmitting(true);
      const url = currentContact._id ? `/api/contacts/${currentContact._id}` : "/api/contacts";
      const method = currentContact._id ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentContact),
      });

      if (res.ok) {
        setViewMode("list");
        fetchContacts();
      }
    } catch (error) {
      console.error("Failed to save contact:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    try {
      const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchContacts();
      }
    } catch (error) {
      console.error("Failed to delete contact:", error);
    }
  };

  // CSV Import
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

        const normalized = parsedRows.map((row) => ({
          firstName: row.firstName || row["first name"] || row["First Name"] || "Imported",
          lastName: row.lastName || row["last name"] || row["Last Name"] || "",
          company: row.company || row["Company"] || row["company name"] || "",
          email: row.email || row["Email"] || row["email address"] || "",
          phone: row.phone || row["Phone"] || row["phone number"] || "",
          city: row.city || row["City"] || row["city name"] || "",
          status: row.status || row["Status"] || "Lead",
          source: row.source || row["Source"] || "website",
        }));

        if (normalized.length === 0) return alert("No valid rows found in CSV!");

        setLoading(true);
        const res = await fetch("/api/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(normalized),
        });

        if (res.ok) {
          alert(`Successfully imported ${normalized.length} contacts!`);
          fetchContacts();
        } else {
          alert("Failed to import CSV data.");
        }
      } catch (err) {
        console.error("CSV Import error:", err);
        alert("Error parsing CSV.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // CSV Export
  const handleCSVExport = () => {
    if (filtered.length === 0) return alert("No contact records to export!");

    const headers = ["First Name", "Last Name", "Company", "Email", "Phone", "Status", "Source", "City"];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...filtered.map((c) =>
          [
            `"${c.firstName || ""}"`,
            `"${c.lastName || ""}"`,
            `"${c.company || ""}"`,
            `"${c.email || ""}"`,
            `"${c.phone || ""}"`,
            `"${c.status || "Lead"}"`,
            `"${c.source || "website"}"`,
            `"${c.city || ""}"`,
          ].join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `contacts_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getInitials = (firstName: string, lastName: string) => {
    const f = firstName ? firstName.charAt(0).toUpperCase() : "";
    const l = lastName ? lastName.charAt(0).toUpperCase() : "";
    return `${f}${l}` || "C";
  };

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
            You do not have the required permissions to access the Contacts module. 
            Please contact your organization administrator to request access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-2 lg:p-4 bg-background min-h-screen">
      
      {/* -------------------- VIEW MODE: LIST -------------------- */}
      {viewMode === "list" && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
            <div className="flex items-center gap-3">
              <Users size={28} className="text-accent" />
              <h1 className="text-2xl font-bold text-foreground">
                Contacts <span className="text-foreground-secondary">({filtered.length})</span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleCSVImport}
                className="hidden"
              />
              {canWrite && (
                <>
                  <Link 
                    href="/contacts/new"
                    className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Plus size={16} className="stroke-[3]" />
                    <span>Add Contact</span>
                  </Link>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2.5 bg-surface hover:bg-surface-hover border border-border text-foreground-secondary hover:text-foreground rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <Upload size={15} />
                    <span>Import</span>
                  </button>
                </>
              )}
              <button
                onClick={handleCSVExport}
                className="flex items-center gap-2 px-3 py-2.5 bg-surface hover:bg-surface-hover border border-border text-foreground-secondary hover:text-foreground rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                <Download size={15} />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <Filter size={16} className="text-foreground-secondary" />
              <span>Advanced Filters</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Search Contacts */}
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">
                  Search Contacts
                </label>
                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 text-foreground-muted" size={16} />
                  <input
                    type="text"
                    placeholder="Name, email, phone, company..."
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
                  <option value="">All Statuses</option>
                  <option value="lead">Lead</option>
                  <option value="customer">Customer</option>
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
                  <option value="">All Sources</option>
                  <option value="website">Website</option>
                  <option value="event">Event</option>
                  <option value="social media">Social Media</option>
                  <option value="referral">Referral</option>
                  <option value="cold_call">Cold Call</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Section */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 bg-surface border border-border rounded-2xl shadow-sm">
              <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
              <p className="text-sm text-foreground-secondary font-medium">Loading contact database...</p>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
              {/* Table Card Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background-secondary/20">
                <span className="font-bold text-foreground text-sm">Contact Details</span>
                <span className="text-xs text-foreground-secondary font-medium">
                  Showing <strong className="text-foreground">{filtered.length}</strong> contacts
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
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-sm text-foreground-secondary">
                          No contacts found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((c) => {
                        const displaySource = (c.source || "other").replace(/_/g, " ");

                        return (
                          <tr key={c._id} className="hover:bg-surface-hover/40 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-accent-muted flex items-center justify-center text-xs font-bold text-accent shrink-0 border border-accent/15">
                                  {getInitials(c.firstName, c.lastName)}
                                </div>
                                <div className="space-y-1">
                                  <div className="font-bold text-foreground text-sm">
                                    {c.firstName} {c.lastName}
                                  </div>
                                  {c.email && (
                                    <div className="flex items-center gap-1.5 text-xs text-foreground-secondary">
                                      <Mail size={12} className="text-foreground-muted" />
                                      <span>{c.email}</span>
                                    </div>
                                  )}
                                  {c.phone && (
                                    <div className="flex items-center gap-1.5 text-xs text-foreground-secondary">
                                      <Phone size={12} className="text-foreground-muted" />
                                      <span>{c.phone}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-accent-muted/20 border border-accent/15 flex items-center justify-center text-accent">
                                  <Briefcase size={14} />
                                </div>
                                <div className="space-y-0.5">
                                  <div className="font-bold text-foreground text-sm">
                                    {c.company || "—"}
                                  </div>
                                  {c.company && (
                                    <div className="text-[10px] font-semibold text-foreground-secondary uppercase tracking-wider">
                                      Corporate Client
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <StatusBadge status={(c.status || "Lead").toLowerCase()} />
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-xs text-foreground font-semibold capitalize">
                                {renderSourceIcon(c.source)}
                                <span>{displaySource}</span>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="space-y-0.5 text-xs">
                                <div className="font-bold text-foreground">
                                  {formatContactDate(c.createdAt)}
                                </div>
                                <div className="text-foreground-secondary font-medium">
                                  {formatContactTime(c.createdAt)}
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2.5">
                                {canWrite ? (
                                  <>
                                    <button 
                                      onClick={() => handleOpenEditForm(c)}
                                      className="w-8 h-8 rounded-full flex items-center justify-center bg-accent-muted/25 hover:bg-accent-muted/50 border border-accent/15 text-accent transition-all cursor-pointer"
                                      title="Edit Contact"
                                    >
                                      <Edit size={14} />
                                    </button>
                                    <button 
                                      onClick={() => handleDelete(c._id)}
                                      className="w-8 h-8 rounded-full flex items-center justify-center bg-danger-muted/25 hover:bg-danger-muted/50 border border-danger/15 text-danger transition-all cursor-pointer"
                                      title="Delete Contact"
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
        </>
      )}

      {/* -------------------- VIEW MODE: EDIT CONTACT (MODAL LAYOUT) -------------------- */}
      <Modal
        isOpen={viewMode === "edit"}
        onClose={() => setViewMode("list")}
        title="Edit Contact Details"
        className="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5 max-h-[75vh] overflow-y-auto pr-2 scrollbar-thin">
          {/* Section 1: Contact Information */}
          <div className="p-4 bg-background-tertiary/35 border border-border/55 rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <User size={16} className="text-accent" />
              <span>Contact Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">
                  First Name <span className="text-danger">*</span>
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 text-foreground-muted" size={16} />
                  <input
                    required
                    placeholder="Enter first name"
                    value={currentContact.firstName || ""}
                    onChange={(e) => setCurrentContact({ ...currentContact, firstName: e.target.value.replace(/[^a-zA-Z\s'-]/g, "") })}
                    className="w-full bg-background-secondary border border-border rounded-xl !pl-10 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">
                  Last Name <span className="text-danger">*</span>
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 text-foreground-muted" size={16} />
                  <input
                    required
                    placeholder="Enter last name"
                    value={currentContact.lastName || ""}
                    onChange={(e) => setCurrentContact({ ...currentContact, lastName: e.target.value.replace(/[^a-zA-Z\s'-]/g, "") })}
                    className="w-full bg-background-secondary border border-border rounded-xl !pl-10 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Gender</label>
                <select
                  value={currentContact.gender || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, gender: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors cursor-pointer"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">
                  Mobile <span className="text-danger">*</span>
                </label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-3.5 text-foreground-muted" size={16} />
                  <input
                    required
                    placeholder="Enter mobile number"
                    value={currentContact.phone || ""}
                    onChange={(e) => setCurrentContact({ ...currentContact, phone: e.target.value.replace(/[^0-9+\-\s()]/g, "") })}
                    className="w-full bg-background-secondary border border-border rounded-xl !pl-10 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
                  />
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
                    placeholder="Enter email address"
                    value={currentContact.email || ""}
                    onChange={(e) => setCurrentContact({ ...currentContact, email: e.target.value.trim() })}
                    className="w-full bg-background-secondary border border-border rounded-xl !pl-10 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">State/Province</label>
                <select
                  value={currentContact.state || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, state: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors cursor-pointer"
                >
                  <option value="">Select State</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">District</label>
                <input
                  placeholder="Enter district"
                  value={currentContact.district || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, district: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Sub Location</label>
                <input
                  placeholder="Enter sub location"
                  value={currentContact.subLocation || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, subLocation: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Business Information */}
          <div className="p-4 bg-background-tertiary/35 border border-border/55 rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <Building size={16} className="text-accent" />
              <span>Business Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Department</label>
                <select
                  value={currentContact.department || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, department: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors cursor-pointer"
                >
                  <option value="">Select Dept</option>
                  <option value="Coding">Coding</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Technical">Technical</option>
                  <option value="HR">HR</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Designation</label>
                <select
                  value={currentContact.designation || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, designation: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors cursor-pointer"
                >
                  <option value="">Select Desig</option>
                  <option value="Senior Lead">Senior Lead</option>
                  <option value="Manager">Manager</option>
                  <option value="Specialist">Specialist</option>
                  <option value="Junior Rep">Junior Rep</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Company</label>
                <div className="relative flex items-center">
                  <Briefcase className="absolute left-3.5 text-foreground-muted" size={16} />
                  <input
                    placeholder="Company name"
                    value={currentContact.company || ""}
                    onChange={(e) => setCurrentContact({ ...currentContact, company: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl !pl-10 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Work Address</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 text-foreground-muted" size={16} />
                <textarea
                  placeholder="Enter office work address"
                  rows={2}
                  value={currentContact.workAddress || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, workAddress: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl !pl-10 pr-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Work Phone</label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-3.5 text-foreground-muted" size={16} />
                  <input
                    placeholder="Office phone number"
                    value={currentContact.workPhone || ""}
                    onChange={(e) => setCurrentContact({ ...currentContact, workPhone: e.target.value.replace(/[^0-9+\-\s()]/g, "") })}
                    className="w-full bg-background-secondary border border-border rounded-xl !pl-10 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Work Pin Code</label>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-3.5 text-foreground-muted" size={16} />
                  <input
                    placeholder="Postal code"
                    value={currentContact.workPinCode || ""}
                    onChange={(e) => setCurrentContact({ ...currentContact, workPinCode: e.target.value.replace(/[^0-9]/g, "") })}
                    className="w-full bg-background-secondary border border-border rounded-xl !pl-10 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Website URL</label>
                <div className="relative flex items-center">
                  <Globe className="absolute left-3.5 text-foreground-muted" size={16} />
                  <input
                    placeholder="https://example.com"
                    value={currentContact.websiteUrl || ""}
                    onChange={(e) => setCurrentContact({ ...currentContact, websiteUrl: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl !pl-10 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Select Product</label>
                <select
                  value={currentContact.product || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, product: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors cursor-pointer"
                >
                  <option value="">Select product</option>
                  <option value="Software License">Software License</option>
                  <option value="Hardware Rack Integration">Hardware Rack Integration</option>
                  <option value="AMC Plan Annual">AMC Plan Annual</option>
                  <option value="Networking Switch Setup">Networking Switch Setup</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Other Details */}
          <div className="p-4 bg-background-tertiary/35 border border-border/55 rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <Tag size={16} className="text-accent" />
              <span>Other Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Category</label>
                <input
                  placeholder="Category"
                  value={currentContact.category || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, category: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Sub Category</label>
                <input
                  placeholder="Sub Category"
                  value={currentContact.subCategory || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, subCategory: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Source</label>
                <select
                  value={currentContact.source || "website"}
                  onChange={(e) => setCurrentContact({ ...currentContact, source: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors cursor-pointer"
                >
                  <option value="website">Website</option>
                  <option value="event">Event</option>
                  <option value="social media">Social Media</option>
                  <option value="referral">Referral</option>
                  <option value="cold_call">Cold Call</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Reference</label>
                <input
                  placeholder="Enter reference details"
                  value={currentContact.reference || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, reference: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Classification</label>
                <input
                  placeholder="Classification"
                  value={currentContact.classification || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, classification: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Group</label>
                <input
                  placeholder="Group"
                  value={currentContact.group || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, group: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Zone</label>
                <input
                  placeholder="Zone"
                  value={currentContact.zone || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, zone: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Contact Type</label>
                <select
                  value={currentContact.contactType || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, contactType: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors cursor-pointer"
                >
                  <option value="">Select Contact Type</option>
                  <option value="Client">Client</option>
                  <option value="Partner">Partner</option>
                  <option value="Vendor">Vendor</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">DOB</label>
                <input
                  type="date"
                  value={currentContact.dob || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, dob: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium text-left"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Status</label>
                <select
                  value={currentContact.status || "Lead"}
                  onChange={(e) => setCurrentContact({ ...currentContact, status: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors cursor-pointer"
                >
                  <option value="Lead">Lead</option>
                  <option value="Customer">Customer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Assigned To</label>
              <select
                value={currentContact.assignedTo as any || ""}
                onChange={(e) => setCurrentContact({ ...currentContact, assignedTo: e.target.value as any })}
                className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors cursor-pointer"
              >
                <option value="">Unassigned</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.firstName} {u.lastName}</option>)}
              </select>
            </div>
          </div>

          {/* Section 4: Add Diary Plan */}
          <div className="p-4 bg-background-tertiary/35 border border-border/55 rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <Calendar size={16} className="text-accent" />
              <span>Add Diary Plan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Plan Date</label>
                <input
                  type="date"
                  value={currentContact.planDate || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, planDate: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium text-left"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Plan Action Type</label>
                <select
                  value={currentContact.planActionType || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, planActionType: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors cursor-pointer"
                >
                  <option value="">Select Action Type</option>
                  <option value="Call">Call</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Email">Email</option>
                  <option value="Follow Up">Follow Up</option>
                  <option value="Task">Task</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Remarks</label>
              <input
                placeholder="Remarks for this plan"
                value={currentContact.remarks || ""}
                onChange={(e) => setCurrentContact({ ...currentContact, remarks: e.target.value })}
                className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
              />
            </div>
          </div>

          {/* Section 5: Additional Notes */}
          <div className="p-4 bg-background-tertiary/35 border border-border/55 rounded-xl space-y-2">
            <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Additional Notes</label>
            <textarea
              placeholder="Add any additional notes..."
              rows={2}
              value={currentContact.additionalNotes || ""}
              onChange={(e) => setCurrentContact({ ...currentContact, additionalNotes: e.target.value })}
              className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors resize-none"
            />
          </div>

          {/* Form Action Controls */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50 mt-6">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className="px-6 py-2.5 bg-surface hover:bg-surface-hover border border-border text-foreground-secondary hover:text-foreground rounded-xl text-sm font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}
              <span>{currentContact._id ? "Update Details" : "Save Contact"}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
