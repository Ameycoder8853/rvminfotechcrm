"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Flame,
  AlertTriangle,
  Calendar,
  Loader2,
  Mail,
  Phone,
  Building2,
  MapPin,
  Briefcase,
  User,
  Globe,
  Share2,
  Users,
  HelpCircle,
  Megaphone,
  Handshake,
  Check,
  Edit,
  Trash2,
  Shield,
} from "lucide-react";
import Modal from "@/components/shared/modal";
import { usePermission } from "@/hooks/use-permission";
import StatusBadge from "@/components/shared/status-badge";

interface Enquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
  location?: string;
  status: string; // new, contacted, replied, closed
  priority: string; // low, medium, high, urgent
  source: string;
  details?: string;
  assignedTo?: { _id: string; firstName: string; lastName: string };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEnquiry, setCurrentEnquiry] = useState<Partial<Enquiry> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEnquiries = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/enquiries");
      const data = await res.json();
      if (data.success) {
        setEnquiries(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch enquiries:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchEnquiries();
    fetchUsers();
  }, [fetchEnquiries, fetchUsers]);

  // Scoped filters
  const filteredEnquiries = enquiries.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.company && e.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.details && e.details.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || e.priority === priorityFilter;
    const matchesSource = sourceFilter === "all" || e.source === sourceFilter;

    return !!(matchesSearch && matchesStatus && matchesPriority && matchesSource);
  });

  // Calculate metrics
  const totalCount = enquiries.length;
  
  const hotLeadsCount = enquiries.filter(
    (e) => e.status === "new" || e.status === "contacted"
  ).length;

  const highPriorityCount = enquiries.filter(
    (e) => e.priority === "high" || e.priority === "urgent"
  ).length;

  const thisMonthCount = enquiries.filter((e) => {
    try {
      const createdDate = new Date(e.createdAt);
      const now = new Date();
      return (
        createdDate.getMonth() === now.getMonth() &&
        createdDate.getFullYear() === now.getFullYear()
      );
    } catch {
      return false;
    }
  }).length;

  const handleOpenModal = (enquiry: Partial<Enquiry> | null = null) => {
    setCurrentEnquiry(
      enquiry || {
        name: "",
        email: "",
        phone: "",
        company: "",
        address: "",
        location: "",
        status: "new",
        priority: "medium",
        source: "website",
        details: "",
      }
    );
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEnquiry) return;

    try {
      setIsSubmitting(true);
      const url = currentEnquiry._id
        ? `/api/enquiries/${currentEnquiry._id}`
        : "/api/enquiries";
      const method = currentEnquiry._id ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentEnquiry),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchEnquiries();
      }
    } catch (error) {
      console.error("Failed to save enquiry:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this enquiry?")) return;

    try {
      const res = await fetch(`/api/enquiries/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchEnquiries();
      }
    } catch (error) {
      console.error("Failed to delete enquiry:", error);
    }
  };

  // Helper date formatter
  const formatEnquiryDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const formatEnquiryTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "N/A";
    }
  };

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
            You do not have the required permissions to access the Customer Enquiries.
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
          <MessageSquare size={28} className="text-[#8b5cf6]" />
          <h1 className="text-2xl font-bold text-foreground">
            Customer Enquiries
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchEnquiries()}
            className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-hover border border-border text-foreground-secondary hover:text-foreground rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>

          {canWrite && (
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-600/20 active:scale-95 cursor-pointer"
            >
              <Plus size={16} />
              <span>Add Enquiry</span>
            </button>
          )}
        </div>
      </div>

      <div className="text-xs text-foreground-secondary font-medium -mt-2">
        {filteredEnquiries.length} enquiries found
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Enquiries */}
        <div className="p-5 bg-[#7c3aed]/5 border border-[#7c3aed]/25 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] font-bold text-[#7c3aed] uppercase tracking-wider mb-1">
              Total Enquiries
            </div>
            <div className="text-2xl font-bold text-foreground">{totalCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center text-[#7c3aed]">
            <MessageSquare size={18} />
          </div>
        </div>

        {/* Hot Leads */}
        <div className="p-5 bg-rose-500/5 border border-rose-500/25 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-1">
              Hot Leads
            </div>
            <div className="text-2xl font-bold text-foreground">{hotLeadsCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
            <Flame size={18} />
          </div>
        </div>

        {/* High Priority */}
        <div className="p-5 bg-amber-500/5 border border-amber-500/25 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">
              High Priority
            </div>
            <div className="text-2xl font-bold text-foreground">{highPriorityCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <AlertTriangle size={18} />
          </div>
        </div>

        {/* This Month */}
        <div className="p-5 bg-emerald-500/5 border border-emerald-500/25 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1">
              This Month
            </div>
            <div className="text-2xl font-bold text-foreground">{thisMonthCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Calendar size={18} />
          </div>
        </div>
      </div>

      {/* Filters Area */}
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search bar */}
          <div className="relative flex items-center flex-1">
            <Search className="absolute left-3.5 text-foreground-muted" size={16} />
            <input
              type="text"
              placeholder="Search by name, email, phone, remarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background-secondary border border-border rounded-xl !pl-10 py-2.5 text-sm text-foreground focus:border-accent outline-none transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Select */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="replied">Replied</option>
              <option value="closed">Closed</option>
            </select>

            {/* Priority Select */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none cursor-pointer"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            {/* Source Select */}
            {showAdvanced && (
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none cursor-pointer transition-all animate-fade-in"
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
            )}

            {/* Show Advanced Toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                showAdvanced
                  ? "bg-accent/10 border-accent text-accent"
                  : "bg-background-secondary border-border text-foreground-secondary hover:text-foreground"
              }`}
            >
              <Filter size={15} />
              <span>{showAdvanced ? "Hide Filters" : "Show Advanced Filters"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enquiries Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
          <p className="text-sm text-foreground-secondary">Loading enquiries...</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background-secondary/30">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-foreground-muted">Customer Information</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-foreground-muted">Company & Address</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-foreground-muted">Status & Details</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-foreground-muted">Location & Manager</th>
                  <th className="text-center px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-foreground-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredEnquiries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-sm text-foreground-secondary">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <MessageSquare size={36} className="text-foreground-muted animate-pulse" />
                        <span className="font-bold text-foreground">No enquiries found</span>
                        <span className="text-xs">Try adjusting your search or filter criteria</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEnquiries.map((enquiry) => {
                    const displaySource = (enquiry.source || "other").replace(/_/g, " ");

                    return (
                      <tr key={enquiry._id} className="hover:bg-surface-hover/40 transition-colors">
                        {/* CUSTOMER INFORMATION */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="font-bold text-foreground text-sm">{enquiry.name}</div>
                            <div className="flex items-center gap-1.5 text-xs text-foreground-secondary">
                              <Mail size={12} className="text-foreground-muted" />
                              <span>{enquiry.email}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-foreground-secondary">
                              <Phone size={12} className="text-foreground-muted" />
                              <span>{enquiry.phone}</span>
                            </div>
                          </div>
                        </td>

                        {/* COMPANY & ADDRESS */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-foreground text-sm">
                              <Building2 size={13} className="text-foreground-muted" />
                              <span>{enquiry.company || "—"}</span>
                            </div>
                            {enquiry.address && (
                              <div className="flex items-start gap-1.5 text-xs text-foreground-secondary max-w-60">
                                <MapPin size={12} className="text-foreground-muted shrink-0 mt-0.5" />
                                <span className="line-clamp-2">{enquiry.address}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* STATUS & DETAILS */}
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <StatusBadge status={enquiry.status} />
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                enquiry.priority === "urgent"
                                  ? "bg-danger/10 text-danger"
                                  : enquiry.priority === "high"
                                  ? "bg-warning/10 text-warning"
                                  : enquiry.priority === "medium"
                                  ? "bg-accent/10 text-accent"
                                  : "bg-foreground-muted/10 text-foreground-secondary"
                              }`}>
                                {enquiry.priority}
                              </span>
                            </div>
                            {enquiry.details && (
                              <div className="text-xs text-foreground-secondary line-clamp-1 max-w-60">
                                {enquiry.details}
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 text-[10px] text-foreground-secondary font-bold uppercase tracking-wider">
                              {renderSourceIcon(enquiry.source)}
                              <span>{displaySource}</span>
                            </div>
                          </div>
                        </td>

                        {/* LOCATION & MANAGER */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-foreground font-semibold">
                              <MapPin size={12} className="text-foreground-muted" />
                              <span>{enquiry.location || "—"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-foreground-secondary">
                              <User size={12} className="text-foreground-muted" />
                              <span>
                                {enquiry.assignedTo
                                  ? `${enquiry.assignedTo.firstName} ${enquiry.assignedTo.lastName}`
                                  : "Unassigned"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* ACTIONS */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2.5">
                            {canWrite ? (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenModal(enquiry);
                                  }}
                                  className="w-8 h-8 rounded-full flex items-center justify-center bg-accent-muted/25 hover:bg-accent-muted/50 border border-accent/15 text-accent transition-all cursor-pointer"
                                  title="Edit Enquiry"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(enquiry._id);
                                  }}
                                  className="w-8 h-8 rounded-full flex items-center justify-center bg-danger-muted/25 hover:bg-danger-muted/50 border border-danger/15 text-danger transition-all cursor-pointer"
                                  title="Delete Enquiry"
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

      {/* Add/Edit Enquiry Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentEnquiry?._id ? "Edit Enquiry" : "Add New Enquiry"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Card */}
          <div className="p-4 bg-background-tertiary/35 border border-border/55 rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <User size={16} className="text-[#8b5cf6]" />
              <span>Customer Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">
                  Customer Name <span className="text-danger">*</span>
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 text-foreground-muted" size={16} />
                  <input
                    required
                    value={currentEnquiry?.name || ""}
                    onChange={(e) => setCurrentEnquiry({ ...currentEnquiry, name: e.target.value.replace(/[^a-zA-Z\s'-]/g, "") })}
                    className="w-full bg-background-secondary border border-border rounded-xl !pl-10 !pr-10 py-2.5 text-sm text-foreground focus:border-accent outline-none transition-colors"
                    placeholder="Enter customer name"
                  />
                  {currentEnquiry?.name && (
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
                    value={currentEnquiry?.email || ""}
                    onChange={(e) => setCurrentEnquiry({ ...currentEnquiry, email: e.target.value.trim() })}
                    className="w-full bg-background-secondary border border-border rounded-xl !pl-10 py-2.5 text-sm text-foreground focus:border-accent outline-none transition-colors"
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">
                Phone Number <span className="text-danger">*</span>
              </label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3.5 text-foreground-muted" size={16} />
                <input
                  required
                  type="tel"
                  value={currentEnquiry?.phone || ""}
                  onChange={(e) => setCurrentEnquiry({ ...currentEnquiry, phone: e.target.value.replace(/[^0-9+\-\s()]/g, "") })}
                  className="w-full bg-background-secondary border border-border rounded-xl !pl-10 py-2.5 text-sm text-foreground focus:border-accent outline-none transition-colors"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          {/* Company Card */}
          <div className="p-4 bg-background-tertiary/35 border border-border/55 rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <Building2 size={16} className="text-[#8b5cf6]" />
              <span>Company & Location</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">
                  Company Name
                </label>
                <div className="relative flex items-center">
                  <Building2 className="absolute left-3.5 text-foreground-muted" size={16} />
                  <input
                    value={currentEnquiry?.company || ""}
                    onChange={(e) => setCurrentEnquiry({ ...currentEnquiry, company: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl !pl-10 py-2.5 text-sm text-foreground focus:border-accent outline-none transition-colors"
                    placeholder="Enter company name"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">
                  Location (City/Area)
                </label>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-3.5 text-foreground-muted" size={16} />
                  <input
                    value={currentEnquiry?.location || ""}
                    onChange={(e) => setCurrentEnquiry({ ...currentEnquiry, location: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl !pl-10 py-2.5 text-sm text-foreground focus:border-accent outline-none transition-colors"
                    placeholder="Enter location"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">
                Address
              </label>
              <div className="relative flex items-center">
                <MapPin className="absolute left-3.5 text-foreground-muted" size={16} />
                <input
                  value={currentEnquiry?.address || ""}
                  onChange={(e) => setCurrentEnquiry({ ...currentEnquiry, address: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl !pl-10 py-2.5 text-sm text-foreground focus:border-accent outline-none transition-colors"
                  placeholder="Enter complete address"
                />
              </div>
            </div>
          </div>

          {/* Details / Source / Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">
                Status
              </label>
              <select
                value={currentEnquiry?.status || "new"}
                onChange={(e) => setCurrentEnquiry({ ...currentEnquiry, status: e.target.value })}
                className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none transition-colors cursor-pointer"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="replied">Replied</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">
                Priority
              </label>
              <select
                value={currentEnquiry?.priority || "medium"}
                onChange={(e) => setCurrentEnquiry({ ...currentEnquiry, priority: e.target.value })}
                className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none transition-colors cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">
                Source
              </label>
              <select
                value={currentEnquiry?.source || "website"}
                onChange={(e) => setCurrentEnquiry({ ...currentEnquiry, source: e.target.value })}
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

          <div>
            <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">
              Assigned Manager
            </label>
            <select
              value={currentEnquiry?.assignedTo?._id || (currentEnquiry?.assignedTo as any) || ""}
              onChange={(e) => setCurrentEnquiry({ ...currentEnquiry, assignedTo: e.target.value as any })}
              className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none transition-colors cursor-pointer"
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.firstName} {u.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">
              Remarks & Details
            </label>
            <textarea
              rows={2}
              value={currentEnquiry?.details || ""}
              onChange={(e) => setCurrentEnquiry({ ...currentEnquiry, details: e.target.value })}
              className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none transition-colors resize-none"
              placeholder="Enter remarks or enquiry details"
            />
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
              className="px-8 py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-xl text-sm font-semibold shadow-lg shadow-violet-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              <span>{currentEnquiry?._id ? "Update Enquiry" : "Create Enquiry"}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
