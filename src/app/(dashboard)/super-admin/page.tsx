"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Building2, Shield, Loader2, ArrowRight, Globe, Users, ShieldAlert, Lock, Unlock, Search, Check } from "lucide-react";
import Modal from "@/components/shared/modal";

interface Organization {
  _id: string;
  name: string;
  slug: string;
  status: "active" | "suspended";
  createdAt: string;
}

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  roleTier: "super_admin" | "admin" | "senior" | "junior";
  isActive: boolean;
  clerkId: string;
  orgId?: {
    _id: string;
    name: string;
    slug: string;
  };
  phone?: string;
  avatar?: string;
}

export default function SuperAdminPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"companies" | "users">("companies");
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search queries
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [orgSearchQuery, setOrgSearchQuery] = useState("");

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

  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchOrgs();
    fetchUsers();

    // Check if there is an active impersonated organization in sessionStorage/localStorage
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("rvm_impersonate_org_id");
      if (saved) {
        setActiveImpersonatedOrg(saved);
      }
    }
  }, [fetchOrgs, fetchUsers]);

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

  const handleUpdateUserRoleTier = async (userId: string, newRoleTier: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleTier: newRoleTier }),
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update role tier.");
      }
    } catch (error) {
      console.error("Failed to update user role:", error);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update user status.");
      }
    } catch (error) {
      console.error("Failed to toggle user status:", error);
    }
  };

  const autoGenerateSlug = (val: string) => {
    setNewOrgName(val);
    setNewOrgSlug(val.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""));
  };

  // Filters
  const filteredOrgs = organizations.filter((org) => {
    const query = orgSearchQuery.toLowerCase();
    return org.name.toLowerCase().includes(query) || org.slug.toLowerCase().includes(query);
  });

  const filteredUsers = users.filter((u) => {
    const query = userSearchQuery.toLowerCase();
    const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
    const email = (u.email || "").toLowerCase();
    const company = (u.orgId?.name || "Global / Sovereign").toLowerCase();
    return fullName.includes(query) || email.includes(query) || company.includes(query);
  });

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-fade-in text-foreground">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-muted flex items-center justify-center text-accent">
            <Shield size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Super Admin Operations</h1>
            <p className="text-sm text-foreground-secondary">Manage tenant organizations, inspect CRM databases, and manage global user accounts.</p>
          </div>
        </div>
        
        {activeTab === "companies" && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenOrgModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-all active:scale-95 cursor-pointer shadow-md shadow-accent/10"
            >
              <Plus size={16} />
              <span>Register Company</span>
            </button>
          </div>
        )}
      </div>

      {/* Impersonation Warning Banner */}
      {activeImpersonatedOrg && (
        <div className="p-4 bg-warning-muted/15 border border-warning/20 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Building2 className="text-warning w-5 h-5 shrink-0" />
            <p className="text-sm font-semibold text-foreground-secondary">
              ⚠️ <strong className="text-warning">Active Impersonation Context:</strong> You are currently viewing CRM files filtered for organization ID: <code className="bg-surface-active px-1.5 py-0.5 rounded text-xs">{activeImpersonatedOrg}</code>.
            </p>
          </div>
          <button
            onClick={() => handleImpersonate(activeImpersonatedOrg, "")}
            className="px-3.5 py-1.5 bg-surface hover:bg-surface-hover border border-border rounded-lg text-xs font-bold transition-all text-foreground shrink-0 cursor-pointer"
          >
            Clear Context
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-border gap-6">
        <button
          onClick={() => setActiveTab("companies")}
          className={`pb-4 text-sm font-bold relative transition-colors cursor-pointer ${
            activeTab === "companies" ? "text-accent" : "text-foreground-secondary hover:text-foreground"
          }`}
        >
          <div className="flex items-center gap-2">
            <Building2 size={16} />
            <span>Company Registries</span>
          </div>
          {activeTab === "companies" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full animate-fade-in" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-4 text-sm font-bold relative transition-colors cursor-pointer ${
            activeTab === "users" ? "text-accent" : "text-foreground-secondary hover:text-foreground"
          }`}
        >
          <div className="flex items-center gap-2">
            <Users size={16} />
            <span>Global User Profiles</span>
          </div>
          {activeTab === "users" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full animate-fade-in" />
          )}
        </button>
      </div>

      {activeTab === "companies" ? (
        loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
            <p className="text-sm text-foreground-secondary">Syncing company registry...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tenant Registry Listing */}
            <div className="lg:col-span-2 bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="font-bold text-base">Registered CRM Tenants ({filteredOrgs.length})</h3>
                <div className="relative flex items-center max-w-xs w-full">
                  <Search className="absolute left-3 text-foreground-muted w-4 h-4" />
                  <input
                    type="text"
                    value={orgSearchQuery}
                    onChange={(e) => setOrgSearchQuery(e.target.value)}
                    placeholder="Search companies..."
                    className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-xs font-semibold outline-none focus:border-accent text-foreground"
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-background-secondary/35 text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
                      <th className="px-5 py-3.5">Company Name</th>
                      <th className="px-5 py-3.5">Subdomain Slug</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right pr-6">Impersonation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/45 text-sm">
                    {filteredOrgs.map((org) => {
                      const isImpersonating = activeImpersonatedOrg === org._id;
                      return (
                        <tr key={org._id} className="hover:bg-surface-hover/40 transition-colors">
                          <td className="px-5 py-4 font-semibold text-foreground">{org.name}</td>
                          <td className="px-5 py-4 font-medium text-foreground-secondary">{org.slug}.rvmcrm.com</td>
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
                                  ? "bg-warning hover:bg-warning-hover text-black"
                                  : "bg-accent-muted hover:bg-accent text-accent hover:text-white"
                              }`}
                            >
                              <span>{isImpersonating ? "Stop Inspecting" : "Inspect Database"}</span>
                              <ArrowRight size={12} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredOrgs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-16 text-foreground-muted font-medium">
                          No organizations found matching search query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Info & Onboarding panel */}
            <div className="bg-surface border border-border rounded-2xl p-5 space-y-5 h-fit shadow-sm">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Globe className="text-accent w-5 h-5" />
                <span>CRM Distribution Hub</span>
              </h3>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                Registering an organization sets up a completely clean database slice/scope. Once created, you can invite the customer's initial <strong>Company Administrator</strong> via the registration flow or seeding tools.
              </p>
              <div className="p-3 bg-background-secondary/50 rounded-xl space-y-2.5 border border-border">
                <h4 className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Quick Commands</h4>
                <ul className="text-[11px] font-medium space-y-1.5 list-disc list-inside text-foreground-secondary">
                  <li>Create Client Instance</li>
                  <li>Setup SLA boundaries</li>
                  <li>Suspensions block login instantly</li>
                </ul>
              </div>
            </div>
          </div>
        )
      ) : (
        usersLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
            <p className="text-sm text-foreground-secondary">Fetching registered system users...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Directory Registry */}
            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base">Global User Account Directory ({filteredUsers.length})</h3>
                  <p className="text-xs text-foreground-secondary mt-0.5">View profiles, change role tiers, and toggle active status across all companies.</p>
                </div>
                <div className="relative flex items-center max-w-xs w-full">
                  <Search className="absolute left-3 text-foreground-muted w-4 h-4" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search users or companies..."
                    className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-xs font-semibold outline-none focus:border-accent text-foreground"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-background-secondary/35 text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
                      <th className="px-5 py-3.5">User Profile Info</th>
                      <th className="px-5 py-3.5">Assigned CRM Tenant</th>
                      <th className="px-5 py-3.5">Role Tier</th>
                      <th className="px-5 py-3.5">Account Status</th>
                      <th className="px-5 py-3.5 text-right pr-6">Administrative Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/45 text-sm">
                    {filteredUsers.map((user) => {
                      const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "U";
                      return (
                        <tr key={user._id} className="hover:bg-surface-hover/40 transition-colors">
                          <td className="px-5 py-4 flex items-center gap-3">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.firstName} className="w-9 h-9 rounded-xl object-cover border border-border" />
                            ) : (
                              <div className="w-9 h-9 rounded-xl bg-accent-muted text-accent font-bold text-xs flex items-center justify-center">
                                {initials}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-foreground">{user.firstName} {user.lastName}</div>
                              <div className="text-xs text-foreground-secondary">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-5 py-4 font-semibold text-foreground">
                            {user.orgId ? (
                              <div className="flex items-center gap-2">
                                <Building2 size={14} className="text-foreground-secondary" />
                                <span>{user.orgId.name}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-purple-400">
                                <Shield size={14} />
                                <span>Global (Sovereign Context)</span>
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            {user.roleTier === "super_admin" ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                                Super Admin
                              </span>
                            ) : user.roleTier === "admin" ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                Company Admin
                              </span>
                            ) : user.roleTier === "senior" ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                Senior Manager
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                                Junior Rep
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            {user.isActive ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-green-500">
                                <Check size={14} />
                                <span>Active</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-red-500">
                                <ShieldAlert size={14} />
                                <span>Suspended</span>
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right pr-6">
                            <div className="inline-flex items-center gap-3">
                              {/* Change Tier Selector */}
                              <select
                                value={user.roleTier}
                                onChange={(e) => handleUpdateUserRoleTier(user._id, e.target.value)}
                                className="bg-background-secondary border border-border rounded-xl text-xs font-semibold px-2.5 py-1.5 focus:border-accent outline-none text-foreground cursor-pointer"
                              >
                                <option value="super_admin">Super Admin</option>
                                <option value="admin">Company Admin</option>
                                <option value="senior">Senior Manager</option>
                                <option value="junior">Junior Rep</option>
                              </select>

                              {/* Toggle active button */}
                              <button
                                onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  user.isActive
                                    ? "bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white"
                                    : "bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white"
                                }`}
                              >
                                {user.isActive ? (
                                  <>
                                    <Lock size={12} />
                                    <span>Suspend</span>
                                  </>
                                ) : (
                                  <>
                                    <Unlock size={12} />
                                    <span>Activate</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-16 text-foreground-muted font-medium">
                          No users found matching search query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      )}

      {/* Register Organization Modal */}
      <Modal
        isOpen={isOrgModalOpen}
        onClose={() => setIsOrgModalOpen(false)}
        title="Register New Client Organization"
      >
        <form onSubmit={handleOrgSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Company Name</label>
            <input
              required
              value={newOrgName}
              onChange={(e) => autoGenerateSlug(e.target.value)}
              className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none"
              placeholder="e.g. Acme Corporation"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Slug / Subdomain Prefix</label>
            <div className="relative flex items-center">
              <input
                required
                value={newOrgSlug}
                onChange={(e) => setNewOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none pr-32"
                placeholder="acme"
              />
              <span className="absolute right-4 text-xs font-bold text-foreground-muted">.rvmcrm.com</span>
            </div>
            <span className="text-[10px] text-foreground-muted mt-1.5 block">Determines subdomain context isolation route.</span>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setIsOrgModalOpen(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-bold shadow-lg shadow-accent/20 transition-all flex items-center gap-2 cursor-pointer"
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
