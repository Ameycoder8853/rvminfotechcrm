"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Building2, Shield, Loader2, Save, Trash2, ArrowRight, CheckCircle, ExternalLink, Globe } from "lucide-react";
import Modal from "@/components/shared/modal";

interface Organization {
  _id: string;
  name: string;
  slug: string;
  status: "active" | "suspended";
  createdAt: string;
}

export default function SuperAdminPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgSlug, setNewOrgSlug] = useState("");

  // Impersonation state
  const [activeImpersonatedOrg, setActiveImpersonatedOrg] = useState<string | null>(null);

  const fetchOrgs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/organizations");
      const data = await res.json();
      if (data.success) {
        setOrganizations(data.data);
      }
    } catch (error) {
      console.error("Failed to load organizations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchOrgs();

    // Check if there is an active impersonated organization in sessionStorage/localStorage
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("rvm_impersonate_org_id");
      if (saved) {
        setActiveImpersonatedOrg(saved);
      }
    }
  }, [fetchOrgs]);

  const handleOpenOrgModal = () => {
    setNewOrgName("");
    setNewOrgSlug("");
    setIsOrgModalOpen(true);
  };

  const handleOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName || !newOrgSlug) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newOrgName, slug: newOrgSlug }),
      });

      if (res.ok) {
        setIsOrgModalOpen(false);
        fetchOrgs();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create organization.");
      }
    } catch (error) {
      console.error("Failed to submit organization:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImpersonate = (orgId: string, orgName: string) => {
    if (typeof window !== "undefined") {
      if (activeImpersonatedOrg === orgId) {
        // Clear impersonation
        sessionStorage.removeItem("rvm_impersonate_org_id");
        sessionStorage.removeItem("rvm_impersonate_org_name");
        setActiveImpersonatedOrg(null);
        alert("Impersonation cleared. Viewing global logs.");
      } else {
        // Set impersonation
        sessionStorage.setItem("rvm_impersonate_org_id", orgId);
        sessionStorage.setItem("rvm_impersonate_org_name", orgName);
        setActiveImpersonatedOrg(orgId);
        alert(`Now impersonating context: ${orgName}. Database requests will filter to this company.`);
      }
      window.location.reload(); // Reload context
    }
  };

  const autoGenerateSlug = (val: string) => {
    setNewOrgName(val);
    setNewOrgSlug(val.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""));
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-fade-in text-[var(--foreground)]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-muted)] flex items-center justify-center text-[var(--accent)]">
            <Shield size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Super Admin Operations</h1>
            <p className="text-sm text-[var(--foreground-secondary)]">Manage tenant organizations and inspect CRM instances.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenOrgModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-semibold transition-all active:scale-95 cursor-pointer shadow-md shadow-[var(--accent)]/10"
          >
            <Plus size={16} />
            <span>Register Company</span>
          </button>
        </div>
      </div>

      {/* Impersonation Warning Banner */}
      {activeImpersonatedOrg && (
        <div className="p-4 bg-[var(--warning-muted)]/15 border border-[var(--warning)]/20 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Building2 className="text-[var(--warning)] w-5 h-5 shrink-0" />
            <p className="text-sm font-semibold text-[var(--foreground-secondary)]">
              ⚠️ <strong className="text-[var(--warning)]">Active Impersonation Context:</strong> You are currently viewing CRM files filtered for organization ID: <code className="bg-[var(--surface-active)] px-1.5 py-0.5 rounded text-xs">{activeImpersonatedOrg}</code>.
            </p>
          </div>
          <button
            onClick={() => handleImpersonate(activeImpersonatedOrg, "")}
            className="px-3.5 py-1.5 bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] rounded-lg text-xs font-bold transition-all text-[var(--foreground)] shrink-0 cursor-pointer"
          >
            Clear Context
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin mb-4" />
          <p className="text-sm text-[var(--foreground-secondary)]">Syncing company registry...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Tenant Registry Listing */}
          <div className="lg:col-span-2 bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="font-bold text-base">Registered CRM Tenants ({organizations.length})</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--background-secondary)]/35 text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                    <th className="px-5 py-3.5">Company Name</th>
                    <th className="px-5 py-3.5">Subdomain Slug</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right pr-6">Impersonation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]/45 text-sm">
                  {organizations.map((org) => {
                    const isImpersonating = activeImpersonatedOrg === org._id;
                    return (
                      <tr key={org._id} className="hover:bg-[var(--surface-hover)]/40 transition-colors">
                        <td className="px-5 py-4 font-semibold text-[var(--foreground)]">{org.name}</td>
                        <td className="px-5 py-4 font-medium text-[var(--foreground-secondary)]">{org.slug}.rvmcrm.com</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                            {org.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right pr-6">
                          <button
                            onClick={() => handleImpersonate(org._id, org.name)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isImpersonating
                                ? "bg-[var(--warning)] hover:bg-[var(--warning-hover)] text-black"
                                : "bg-[var(--accent-muted)] hover:bg-[var(--accent)] text-[var(--accent)] hover:text-white"
                            }`}
                          >
                            <span>{isImpersonating ? "Stop Inspecting" : "Inspect Database"}</span>
                            <ArrowRight size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {organizations.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-16 text-[var(--foreground-muted)] font-medium">
                        No organizations found. Register your first customer company!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Info & Onboarding panel */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 space-y-5 h-fit shadow-sm">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Globe className="text-[var(--accent)] w-5 h-5" />
              <span>CRM Distribution Hub</span>
            </h3>
            <p className="text-xs text-[var(--foreground-secondary)] leading-relaxed">
              Registering an organization sets up a completely clean database slice/scope. Once created, you can invite the customer's initial <strong>Company Administrator</strong> via the registration flow or seeding tools.
            </p>
            <div className="p-3 bg-[var(--background-secondary)]/50 rounded-xl space-y-2.5 border border-[var(--border)]">
              <h4 className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider">Quick Commands</h4>
              <ul className="text-[11px] font-medium space-y-1.5 list-disc list-inside text-[var(--foreground-secondary)]">
                <li>Create Client Instance</li>
                <li>Setup SLA boundaries</li>
                <li>Suspensions block login instantly</li>
              </ul>
            </div>
          </div>

        </div>
      )}

      {/* Register Organization Modal */}
      <Modal
        isOpen={isOrgModalOpen}
        onClose={() => setIsOrgModalOpen(false)}
        title="Register New Client Organization"
      >
        <form onSubmit={handleOrgSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Company Name</label>
            <input
              required
              value={newOrgName}
              onChange={(e) => autoGenerateSlug(e.target.value)}
              className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              placeholder="e.g. Acme Corporation"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Slug / Subdomain Prefix</label>
            <div className="relative flex items-center">
              <input
                required
                value={newOrgSlug}
                onChange={(e) => setNewOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none pr-32"
                placeholder="acme"
              />
              <span className="absolute right-4 text-xs font-bold text-[var(--foreground-muted)]">.rvmcrm.com</span>
            </div>
            <span className="text-[10px] text-[var(--foreground-muted)] mt-1.5 block">Determines subdomain context isolation route.</span>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setIsOrgModalOpen(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-bold shadow-lg shadow-[var(--accent)]/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              <span>Register Instance</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
