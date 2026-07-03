"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft,
  User,
  Phone,
  Mail,
  Building,
  MapPin,
  Briefcase,
  Globe,
  Tag,
  Calendar,
  Loader2,
  Save,
  Shield
} from "lucide-react";
import { usePermission } from "@/hooks/use-permission";

interface Contact {
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
  assignedTo?: string;
}

export default function AddContactPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { hasAccess, canWrite, loading: permLoading } = usePermission("customers");

  const [formData, setFormData] = useState<Partial<Contact>>({
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
    assignedTo: "",
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/contacts");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to save contact.");
      }
    } catch (error) {
      console.error("Failed to save contact:", error);
      alert("An error occurred while saving the contact.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (permLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
        <p className="text-sm font-bold text-foreground-muted uppercase tracking-[0.2em]">
          Checking Access...
        </p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-center p-6 space-y-4 bg-background">
        <div className="p-4 bg-danger/10 text-danger rounded-full">
          <Shield size={48} className="animate-pulse" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-foreground">Access Denied</h2>
          <p className="text-sm text-foreground-secondary leading-relaxed">
            You do not have the required permissions to access the Contacts module.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-4 lg:p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-2 pb-2">
        <Link 
          href="/contacts"
          className="flex items-center gap-2 text-foreground-secondary hover:text-foreground text-xs font-semibold transition-colors w-fit"
        >
          <ArrowLeft size={14} />
          <span>Back to Contacts</span>
        </Link>
        <div className="flex items-center gap-3 animate-slide-in-left">
          <User size={28} className="text-accent" />
          <h1 className="text-2xl font-black text-foreground">Add New Contact</h1>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm max-w-4xl mx-auto animate-scale-up">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Contact Information */}
          <div className="p-5 bg-background-tertiary/35 border border-border/55 rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm border-b border-border/40 pb-2 mb-2">
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
                    value={formData.firstName || ""}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value.replace(/[^a-zA-Z\s'-]/g, "") })}
                    className="w-full bg-background-secondary border border-border rounded-xl pl-10! py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
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
                    value={formData.lastName || ""}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value.replace(/[^a-zA-Z\s'-]/g, "") })}
                    className="w-full bg-background-secondary border border-border rounded-xl pl-10! py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Gender</label>
                <select
                  value={formData.gender || ""}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
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
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9+\-\s()]/g, "") })}
                    className="w-full bg-background-secondary border border-border rounded-xl pl-10! py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
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
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value.trim() })}
                    className="w-full bg-background-secondary border border-border rounded-xl pl-10! py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">State/Province</label>
                <select
                  value={formData.state || ""}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors cursor-pointer"
                >
                  <option value="">Select State</option>
                  <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                  <option value="Assam">Assam</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Chandigarh">Chandigarh</option>
                  <option value="Chhattisgarh">Chhattisgarh</option>
                  <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Goa">Goa</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Himachal Pradesh">Himachal Pradesh</option>
                  <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                  <option value="Jharkhand">Jharkhand</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Ladakh">Ladakh</option>
                  <option value="Lakshadweep">Lakshadweep</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Manipur">Manipur</option>
                  <option value="Meghalaya">Meghalaya</option>
                  <option value="Mizoram">Mizoram</option>
                  <option value="Nagaland">Nagaland</option>
                  <option value="Odisha">Odisha</option>
                  <option value="Puducherry">Puducherry</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Sikkim">Sikkim</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Tripura">Tripura</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Uttarakhand">Uttarakhand</option>
                  <option value="West Bengal">West Bengal</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">District</label>
                <input
                  placeholder="Enter district"
                  value={formData.district || ""}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Sub Location</label>
                <input
                  placeholder="Enter sub location"
                  value={formData.subLocation || ""}
                  onChange={(e) => setFormData({ ...formData, subLocation: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Business Information */}
          <div className="p-5 bg-background-tertiary/35 border border-border/55 rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm border-b border-border/40 pb-2 mb-2">
              <Building size={16} className="text-accent" />
              <span>Business Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Department</label>
                <select
                  value={formData.department || ""}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors cursor-pointer"
                >
                  <option value="">Select Department</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Operations">Operations</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="Research & Development">Research & Development</option>
                  <option value="Legal">Legal</option>
                  <option value="Executive">Executive</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Designation</label>
                <select
                  value={formData.designation || ""}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors cursor-pointer"
                >
                  <option value="">Select Designation</option>
                  <option value="CEO">CEO</option>
                  <option value="CTO">CTO</option>
                  <option value="CFO">CFO</option>
                  <option value="Director">Director</option>
                  <option value="Manager">Manager</option>
                  <option value="Team Lead">Team Lead</option>
                  <option value="Executive">Executive</option>
                  <option value="Analyst">Analyst</option>
                  <option value="Coordinator">Coordinator</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Assistant">Assistant</option>
                  <option value="Intern">Intern</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Company</label>
                <div className="relative flex items-center">
                  <Briefcase className="absolute left-3.5 text-foreground-muted" size={16} />
                  <input
                    placeholder="Company name"
                    value={formData.company || ""}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl pl-10! py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
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
                  value={formData.workAddress || ""}
                  onChange={(e) => setFormData({ ...formData, workAddress: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl pl-10! pr-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors resize-none"
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
                    value={formData.workPhone || ""}
                    onChange={(e) => setFormData({ ...formData, workPhone: e.target.value.replace(/[^0-9+\-\s()]/g, "") })}
                    className="w-full bg-background-secondary border border-border rounded-xl pl-10! py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Work Pin Code</label>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-3.5 text-foreground-muted" size={16} />
                  <input
                    placeholder="Postal code"
                    value={formData.workPinCode || ""}
                    onChange={(e) => setFormData({ ...formData, workPinCode: e.target.value.replace(/[^0-9]/g, "") })}
                    className="w-full bg-background-secondary border border-border rounded-xl pl-10! py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
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
                    value={formData.websiteUrl || ""}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl pl-10! py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Select Product</label>
                <select
                  value={formData.product || ""}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors cursor-pointer"
                >
                  <option value="">Select product for future</option>
                  <option value="CRM Software">CRM Software</option>
                  <option value="ERP Solution">ERP Solution</option>
                  <option value="Accounting Tool">Accounting Tool</option>
                  <option value="Marketing Automation">Marketing Automation</option>
                  <option value="Project Management">Project Management</option>
                  <option value="Business Intelligence">Business Intelligence</option>
                  <option value="Custom Development">Custom Development</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Other Details */}
          <div className="p-5 bg-background-tertiary/35 border border-border/55 rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm border-b border-border/40 pb-2 mb-2">
              <Tag size={16} className="text-accent" />
              <span>Other Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Category</label>
                <input
                  placeholder="Category"
                  value={formData.category || ""}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Sub Category</label>
                <input
                  placeholder="Sub Category"
                  value={formData.subCategory || ""}
                  onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Source</label>
                <select
                  value={formData.source || "website"}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors cursor-pointer"
                >
                  <option value="">Select Source</option>
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                  <option value="social media">Social Media</option>
                  <option value="event">Event</option>
                  <option value="cold_call">Cold Call</option>
                  <option value="email campaign">Email Campaign</option>
                  <option value="advertisement">Advertisement</option>
                  <option value="partner">Partner</option>
                  <option value="exhibition">Exhibition</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Reference</label>
                <input
                  placeholder="Enter reference details"
                  value={formData.reference || ""}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Classification</label>
                <input
                  placeholder="Classification"
                  value={formData.classification || ""}
                  onChange={(e) => setFormData({ ...formData, classification: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Group</label>
                <input
                  placeholder="Group"
                  value={formData.group || ""}
                  onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Zone</label>
                <input
                  placeholder="Zone"
                  value={formData.zone || ""}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Contact Type</label>
                <select
                  value={formData.contactType || ""}
                  onChange={(e) => setFormData({ ...formData, contactType: e.target.value })}
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
                  value={formData.dob || ""}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium text-left"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Status</label>
                <select
                  value={formData.status || "Lead"}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
                value={formData.assignedTo || ""}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors cursor-pointer"
              >
                <option value="">Unassigned</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.firstName} {u.lastName}</option>)}
              </select>
            </div>
          </div>

          {/* Section 4: Add Diary Plan */}
          <div className="p-5 bg-background-tertiary/35 border border-border/55 rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm border-b border-border/40 pb-2 mb-2">
              <Calendar size={16} className="text-accent" />
              <span>Add Diary Plan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Plan Date</label>
                <input
                  type="date"
                  value={formData.planDate || ""}
                  onChange={(e) => setFormData({ ...formData, planDate: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium text-left"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Plan Action Type</label>
                <select
                  value={formData.planActionType || ""}
                  onChange={(e) => setFormData({ ...formData, planActionType: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors cursor-pointer"
                >
                  <option value="">Select Action Type</option>
                  <option value="Call">Call</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Email">Email</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Demo">Demo</option>
                  <option value="Presentation">Presentation</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Contract">Contract</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Remarks</label>
              <input
                placeholder="Remarks for this plan"
                value={formData.remarks || ""}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
              />
            </div>
          </div>

          {/* Section 5: Additional Notes */}
          <div className="p-5 bg-background-tertiary/35 border border-border/55 rounded-xl space-y-2">
            <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Additional Notes</label>
            <textarea
              placeholder="Add any additional notes..."
              rows={3}
              value={formData.additionalNotes || ""}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors resize-none"
            />
          </div>

          {/* Form Action Controls */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Link
              href="/contacts"
              className="px-6 py-2.5 bg-surface hover:bg-surface-hover border border-border text-foreground-secondary hover:text-foreground rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center justify-center"
            >
              Cancel
            </Link>
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
              <span>Save Contact</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
