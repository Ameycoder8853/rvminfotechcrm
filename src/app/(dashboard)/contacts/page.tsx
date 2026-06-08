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
  Save
} from "lucide-react";
import Modal from "@/components/shared/modal";

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
}

type ViewMode = "list" | "new" | "edit";

export default function ContactsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [currentContact, setCurrentContact] = useState<Partial<Contact>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      handleOpenNewForm();
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
    
    return matchesSearch && matchesStatus;
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

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-fade-in p-2 lg:p-4 bg-background min-h-screen">
      
      {/* -------------------- VIEW MODE: LIST -------------------- */}
      {viewMode === "list" && (
        <>
          {/* Top Header Block */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-muted flex items-center justify-center text-accent">
                <Users size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Contact Management</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleCSVImport}
                className="hidden"
              />
              <button 
                onClick={handleOpenNewForm}
                className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Plus size={16} className="stroke-[3]" />
                <span>Add Contact</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2.5 bg-surface hover:bg-surface-hover border border-border text-foreground-secondary hover:text-foreground rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                <Upload size={15} />
                <span>Import</span>
              </button>
              <button
                onClick={handleCSVExport}
                className="flex items-center gap-2 px-3 py-2.5 bg-surface hover:bg-surface-hover border border-border text-foreground-secondary hover:text-foreground rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                <Download size={15} />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center justify-between bg-surface border border-border rounded-xl p-3 shadow-sm gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Search size={18} className="text-foreground-muted shrink-0 ml-1" />
              <input
                type="text"
                placeholder="Search by name, email, phone or company.."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-foreground placeholder-foreground-muted w-full font-medium"
              />
            </div>
            <div className="relative shrink-0 flex items-center border-l border-border pl-4 gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-transparent outline-none border-none text-sm font-semibold text-foreground-secondary pr-8 cursor-pointer relative"
              >
                <option value="" className="bg-surface">All Contacts</option>
                <option value="lead" className="bg-surface">Lead</option>
                <option value="customer" className="bg-surface">Customer</option>
              </select>
              <ChevronDown size={14} className="text-foreground-muted absolute right-1 pointer-events-none" />
            </div>
          </div>

          {/* Table Section */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 bg-surface border border-border rounded-2xl shadow-sm">
              <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
              <p className="text-sm text-foreground-secondary font-medium">Loading contact database...</p>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-background-secondary/50">
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-foreground-muted">Name</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-foreground-muted">Contact Info</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-foreground-muted">Company</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-foreground-muted">Status</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-foreground-muted">Source</th>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-foreground-muted text-right pr-8">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filtered.map((c) => (
                      <tr key={c._id} className="hover:bg-surface-hover/45 transition-colors">
                        {/* Name Column */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-accent-muted flex items-center justify-center text-xs font-bold text-accent shrink-0 border border-accent/15">
                              {getInitials(c.firstName, c.lastName)}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground text-[14px]">
                                {c.firstName} {c.lastName}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact Info Column */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-xs font-semibold text-foreground-secondary">
                              <Mail size={13} className="text-foreground-muted shrink-0" />
                              <span>{c.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-foreground-secondary">
                              <Phone size={13} className="text-foreground-muted shrink-0" />
                              <span>{c.phone}</span>
                            </div>
                          </div>
                        </td>

                        {/* Company Column */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-xs font-semibold text-foreground-secondary">
                            <Building size={13} className="text-foreground-muted shrink-0" />
                            <span>{c.company || "—"}</span>
                          </div>
                        </td>

                        {/* Status Badge Column */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-warning-muted text-warning border border-warning/20">
                            {c.status}
                          </span>
                        </td>

                        {/* Source Column */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <span className="text-xs font-bold text-foreground-secondary capitalize">
                            {c.source || "website"}
                          </span>
                        </td>

                        {/* Actions Column */}
                        <td className="px-6 py-4.5 whitespace-nowrap text-right pr-8">
                          <div className="flex items-center justify-end gap-3.5">
                            <button 
                              onClick={() => handleOpenEditForm(c)}
                              className="p-1 rounded text-accent hover:bg-accent-muted transition-colors cursor-pointer"
                              title="Edit Contact"
                            >
                              <Edit size={15} className="stroke-[2.5]" />
                            </button>
                            <button 
                              onClick={() => handleDelete(c._id)}
                              className="p-1 rounded text-danger hover:bg-danger-muted transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={15} className="stroke-[2.5]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-20 bg-background-secondary/10">
                          <p className="text-sm font-medium text-foreground-muted">No contacts found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* -------------------- VIEW MODE: ADD NEW / EDIT CONTACT (PAGE LAYOUT) -------------------- */}
      {(viewMode === "new" || viewMode === "edit") && (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-muted flex items-center justify-center text-accent">
                <Users size={22} className="stroke-[2.5]" />
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {viewMode === "new" ? "Add New Contact" : "Edit Contact Details"}
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-hover border border-border text-foreground-secondary rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Back to Contacts</span>
            </button>
          </div>

          {/* Section 1: Contact Information */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="w-8 h-8 rounded-lg bg-accent-muted flex items-center justify-center text-accent">
                <User size={16} />
              </div>
              <h3 className="font-bold text-foreground text-base">Contact Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-2 block">Name *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    required
                    placeholder="First Name"
                    value={currentContact.firstName || ""}
                    onChange={(e) => setCurrentContact({ ...currentContact, firstName: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium"
                  />
                  <input
                    required
                    placeholder="Last Name"
                    value={currentContact.lastName || ""}
                    onChange={(e) => setCurrentContact({ ...currentContact, lastName: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-2 block">Gender</label>
                <select
                  value={currentContact.gender || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, gender: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium"
                >
                  <option value="" className="bg-surface">Select Gender</option>
                  <option value="Male" className="bg-surface">Male</option>
                  <option value="Female" className="bg-surface">Female</option>
                  <option value="Other" className="bg-surface">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-2 block">Mobile *</label>
                <div className="relative flex items-center">
                  <input
                    required
                    placeholder="+1 (555) 987-6543"
                    value={currentContact.phone || ""}
                    onChange={(e) => setCurrentContact({ ...currentContact, phone: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium pr-10"
                  />
                  <Phone size={15} className="absolute right-3.5 text-foreground-muted" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-2 block">Email *</label>
                <input
                  required
                  type="email"
                  placeholder="name@example.com"
                  value={currentContact.email || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, email: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-2 block">Location</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={currentContact.state || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, state: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium"
                >
                  <option value="" className="bg-surface">Select State/Province</option>
                  <option value="Delhi" className="bg-surface">Delhi</option>
                  <option value="Maharashtra" className="bg-surface">Maharashtra</option>
                  <option value="Karnataka" className="bg-surface">Karnataka</option>
                  <option value="Haryana" className="bg-surface">Haryana</option>
                  <option value="Uttar Pradesh" className="bg-surface">Uttar Pradesh</option>
                </select>
                <input
                  placeholder="District"
                  value={currentContact.district || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, district: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium"
                />
                <input
                  placeholder="Sub Location"
                  value={currentContact.subLocation || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, subLocation: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Business Information */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="w-8 h-8 rounded-lg bg-accent-muted flex items-center justify-center text-accent">
                <Building size={16} />
              </div>
              <h3 className="font-bold text-foreground text-base">Business Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-2 block">Department/Designation</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <select
                    value={currentContact.department || ""}
                    onChange={(e) => setCurrentContact({ ...currentContact, department: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium"
                  >
                    <option value="" className="bg-surface">Select Dept</option>
                    <option value="Coding" className="bg-surface">Coding</option>
                    <option value="Marketing" className="bg-surface">Marketing</option>
                    <option value="Sales" className="bg-surface">Sales</option>
                    <option value="Technical" className="bg-surface">Technical</option>
                    <option value="HR" className="bg-surface">HR</option>
                  </select>
                  <select
                    value={currentContact.designation || ""}
                    onChange={(e) => setCurrentContact({ ...currentContact, designation: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium"
                  >
                    <option value="" className="bg-surface">Select Desig</option>
                    <option value="Senior Lead" className="bg-surface">Senior Lead</option>
                    <option value="Manager" className="bg-surface">Manager</option>
                    <option value="Specialist" className="bg-surface">Specialist</option>
                    <option value="Junior Rep" className="bg-surface">Junior Rep</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-2 block">Company</label>
                <div className="relative flex items-center">
                  <input
                    placeholder="Company name"
                    value={currentContact.company || ""}
                    onChange={(e) => setCurrentContact({ ...currentContact, company: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium pr-10"
                  />
                  <Search size={14} className="absolute right-3.5 text-foreground-muted cursor-pointer" />
                </div>
                <span className="text-[10px] text-foreground-muted mt-1.5 block">Search for existing companies</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-2 block">Work Address</label>
                <textarea
                  placeholder="Enter work address"
                  rows={3}
                  value={currentContact.workAddress || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, workAddress: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1 block">Work Phone</label>
                  <input
                    placeholder="Office phone number"
                    value={currentContact.workPhone || ""}
                    onChange={(e) => setCurrentContact({ ...currentContact, workPhone: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1 block">Work Pin Code</label>
                  <input
                    placeholder="Postal code"
                    value={currentContact.workPinCode || ""}
                    onChange={(e) => setCurrentContact({ ...currentContact, workPinCode: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-2 block">Website URL</label>
                <div className="relative flex items-center">
                  <input
                    placeholder="https://example.com"
                    value={currentContact.websiteUrl || ""}
                    onChange={(e) => setCurrentContact({ ...currentContact, websiteUrl: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium pr-10"
                  />
                  <Globe size={15} className="absolute right-3.5 text-foreground-muted" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-2 block">Select Product</label>
                <select
                  value={currentContact.product || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, product: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium"
                >
                  <option value="" className="bg-surface">Select product for future</option>
                  <option value="Software License" className="bg-surface">Software License</option>
                  <option value="Hardware Rack Integration" className="bg-surface">Hardware Rack Integration</option>
                  <option value="AMC Plan Annual" className="bg-surface">AMC Plan Annual</option>
                  <option value="Networking Switch Setup" className="bg-surface">Networking Switch Setup</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Other Details */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="w-8 h-8 rounded-lg bg-accent-muted flex items-center justify-center text-accent">
                <Tag size={16} />
              </div>
              <h3 className="font-bold text-foreground text-base">Other Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-2 block">Category / Sub Category</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    placeholder="Category"
                    value={currentContact.category || ""}
                    onChange={(e) => setCurrentContact({ ...currentContact, category: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium"
                  />
                  <input
                    placeholder="Sub Category"
                    value={currentContact.subCategory || ""}
                    onChange={(e) => setCurrentContact({ ...currentContact, subCategory: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-2 block">Source/Reference</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <select
                    value={currentContact.source || "website"}
                    onChange={(e) => setCurrentContact({ ...currentContact, source: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium"
                  >
                    <option value="website" className="bg-surface">Website</option>
                    <option value="event" className="bg-surface">Event</option>
                    <option value="social media" className="bg-surface">Social Media</option>
                    <option value="referral" className="bg-surface">Referral</option>
                    <option value="cold_call" className="bg-surface">Cold Call</option>
                    <option value="other" className="bg-surface">Other</option>
                  </select>
                  <input
                    placeholder="Reference"
                    value={currentContact.reference || ""}
                    onChange={(e) => setCurrentContact({ ...currentContact, reference: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-2 block">Classification</label>
                <input
                  placeholder="Classification"
                  value={currentContact.classification || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, classification: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-2 block">Group</label>
                <input
                  placeholder="Group"
                  value={currentContact.group || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, group: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-2 block">Zone</label>
                <input
                  placeholder="Zone"
                  value={currentContact.zone || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, zone: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-2 block">Contact Type</label>
                <select
                  value={currentContact.contactType || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, contactType: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium"
                >
                  <option value="" className="bg-surface">Select Contact Type</option>
                  <option value="Client" className="bg-surface">Client</option>
                  <option value="Partner" className="bg-surface">Partner</option>
                  <option value="Vendor" className="bg-surface">Vendor</option>
                  <option value="Other" className="bg-surface">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-2 block">DOB</label>
                <input
                  type="date"
                  value={currentContact.dob || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, dob: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium text-left"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-2 block">Status</label>
                <select
                  value={currentContact.status || "Lead"}
                  onChange={(e) => setCurrentContact({ ...currentContact, status: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium"
                >
                  <option value="Lead" className="bg-surface">Lead</option>
                  <option value="Customer" className="bg-surface">Customer</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-2 block">Assigned To</label>
                <select
                  value={currentContact.assignedTo as any || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, assignedTo: e.target.value as any })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium"
                >
                  <option value="" className="bg-surface">Unassigned</option>
                  {users.map(u => <option key={u._id} value={u._id} className="bg-surface">{u.firstName} {u.lastName}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Add Diary Plan */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="w-8 h-8 rounded-lg bg-accent-muted flex items-center justify-center text-accent">
                <Calendar size={16} />
              </div>
              <h3 className="font-bold text-foreground text-base">Add Diary Plan</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-2 block">Plan Date (dd-mm-yyyy)</label>
                <input
                  type="date"
                  value={currentContact.planDate || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, planDate: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium text-left"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-2 block">Plan Action Type</label>
                <select
                  value={currentContact.planActionType || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, planActionType: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium"
                >
                  <option value="" className="bg-surface">Select Action Type</option>
                  <option value="Call" className="bg-surface">Call</option>
                  <option value="Meeting" className="bg-surface">Meeting</option>
                  <option value="Email" className="bg-surface">Email</option>
                  <option value="Follow Up" className="bg-surface">Follow Up</option>
                  <option value="Task" className="bg-surface">Task</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-2 block">Remarks</label>
                <input
                  placeholder="Add remarks for this plan"
                  value={currentContact.remarks || ""}
                  onChange={(e) => setCurrentContact({ ...currentContact, remarks: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Additional Notes */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-foreground text-base">Additional Notes</h3>
            <textarea
              placeholder="Add any additional information about this contact"
              rows={3}
              value={currentContact.additionalNotes || ""}
              onChange={(e) => setCurrentContact({ ...currentContact, additionalNotes: e.target.value })}
              className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium"
            />
          </div>

          {/* Form Action Controls */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className="flex items-center gap-2 px-6 py-2.5 bg-surface hover:bg-surface-hover border border-border text-foreground-secondary hover:text-foreground rounded-xl text-sm font-semibold transition-all cursor-pointer"
            >
              <XCircle size={15} />
              <span>Cancel</span>
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
      )}
    </div>
  );
}
