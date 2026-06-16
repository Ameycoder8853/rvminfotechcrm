"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Plus, Building2, Shield, Loader2, ArrowRight, Globe, Users, 
  ShieldAlert, Lock, Unlock, Search, Check, Edit, Trash2, 
  Mail, PhoneCall, CheckCircle, AlertCircle
} from "lucide-react";
import Modal from "@/components/shared/modal";

interface Organization {
  _id: string;
  name: string;
  slug: string;
  status: "active" | "suspended";
  createdAt: string;
}

interface Team {
  _id: string;
  orgId: string | { _id: string; name: string };
  name: string;
  description: string;
  permissions: {
    leads: "none" | "read" | "write" | "all";
    customers: "none" | "read" | "write" | "all";
    invoices: "none" | "read" | "write" | "all";
    tickets: "none" | "read" | "write" | "all";
  };
}

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  roleTier: "super_admin" | "admin" | "senior" | "junior" | "none";
  isActive: boolean;
  clerkId: string;
  orgId?: {
    _id: string;
    name: string;
    slug: string;
  };
  teamId?: Team;
  parentManager?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  phone?: string;
  avatar?: string;
}

export default function SuperAdminPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"companies" | "users" | "teams">("companies");
  
  // Impersonation state
  const [activeImpersonatedOrg, setActiveImpersonatedOrg] = useState<string | null>(null);

  // Search queries
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [orgSearchQuery, setOrgSearchQuery] = useState("");
  const [teamSearchQuery, setTeamSearchQuery] = useState("");

  // Modals state
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states: Organization
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgSlug, setNewOrgSlug] = useState("");

  // Form states: User Enroll/Edit
  const [currentUserEdit, setCurrentUserEdit] = useState<Partial<UserProfile> | null>(null);
  const [isEnrollMode, setIsEnrollMode] = useState(false);
  const [enrollPassword, setEnrollPassword] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedParentId, setSelectedParentId] = useState("");

  // Form states: Team Create/Edit
  const [currentTeamEdit, setCurrentTeamEdit] = useState<Partial<Team> | null>(null);

  const fetchOrgs = useCallback(async () => {
    try {
      const res = await fetch("/api/organizations");
      const data = await res.json();
      if (data.success) {
        setOrganizations(data.data);
      }
    } catch (error) {
      console.error("Failed to load organizations:", error);
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

  const fetchTeams = useCallback(async () => {
    try {
      setTeamsLoading(true);
      const res = await fetch("/api/teams");
      const data = await res.json();
      if (data.success) {
        setTeams(data.data);
      }
    } catch (error) {
      console.error("Failed to load teams:", error);
    } finally {
      setTeamsLoading(false);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchOrgs(), fetchUsers(), fetchTeams()]);
    setLoading(false);
  }, [fetchOrgs, fetchUsers, fetchTeams]);

  useEffect(() => {
    setMounted(true);
    fetchAllData();

    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("rvm_impersonate_org_id");
      if (saved) {
        setActiveImpersonatedOrg(saved);
      }
    }
  }, [fetchAllData]);

  // IMPERSONATION
  const handleImpersonate = (orgId: string, orgName: string) => {
    if (typeof window !== "undefined") {
      if (activeImpersonatedOrg === orgId) {
        sessionStorage.removeItem("rvm_impersonate_org_id");
        sessionStorage.removeItem("rvm_impersonate_org_name");
        setActiveImpersonatedOrg(null);
        alert("Impersonation cleared. Viewing global logs.");
      } else {
        sessionStorage.setItem("rvm_impersonate_org_id", orgId);
        sessionStorage.setItem("rvm_impersonate_org_name", orgName);
        setActiveImpersonatedOrg(orgId);
        alert(`Now impersonating context: ${orgName}. Database requests will filter to this company.`);
      }
      window.location.reload();
    }
  };

  // ORGANIZATION ACTIONS
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

  const autoGenerateSlug = (val: string) => {
    setNewOrgName(val);
    setNewOrgSlug(val.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""));
  };

  // USER PROFILE ACTIONS
  const handleOpenUserModal = (user: UserProfile | null = null) => {
    if (user) {
      setIsEnrollMode(false);
      setCurrentUserEdit(user);
      setSelectedOrgId(user.orgId?._id || "");
      setSelectedTeamId(user.teamId?._id || "");
      setSelectedParentId(user.parentManager?._id || "");
      setEnrollPassword("");
    } else {
      setIsEnrollMode(true);
      setCurrentUserEdit({
        firstName: "",
        lastName: "",
        email: "",
        roleTier: "junior",
        role: "sales",
        phone: "",
      });
      setSelectedOrgId("");
      setSelectedTeamId("");
      setSelectedParentId("");
      setEnrollPassword("");
    }
    setIsUserModalOpen(true);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserEdit) return;

    try {
      setIsSubmitting(true);
      const payload: Record<string, any> = {
        firstName: currentUserEdit.firstName,
        lastName: currentUserEdit.lastName,
        email: currentUserEdit.email,
        phone: currentUserEdit.phone,
        roleTier: currentUserEdit.roleTier,
        role: currentUserEdit.roleTier === "admin" || currentUserEdit.roleTier === "super_admin" ? "admin" : currentUserEdit.role,
        orgId: selectedOrgId || null,
        teamId: selectedTeamId || null,
        parentManager: selectedParentId || null,
      };

      if (isEnrollMode) {
        // Create user
        const res = await fetch("/api/users/enroll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            password: enrollPassword,
          }),
        });

        if (res.ok) {
          setIsUserModalOpen(false);
          fetchAllData();
        } else {
          const err = await res.json();
          alert(err.error || "Failed to enroll user.");
        }
      } else {
        // Edit user
        const res = await fetch(`/api/users/${currentUserEdit._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          setIsUserModalOpen(false);
          fetchAllData();
        } else {
          const err = await res.json();
          alert(err.error || "Failed to update user.");
        }
      }
    } catch (error) {
      console.error("Error saving user:", error);
    } finally {
      setIsSubmitting(false);
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
      console.error("Failed to toggle status:", error);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you absolutely sure you want to permanently delete the user ${email}?\nThis will remove them from the database and delete their authentication credentials in Clerk. This action CANNOT be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        alert("User account and authentication profile deleted successfully.");
        fetchAllData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete user.");
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  // TEAM ACTIONS
  const handleOpenTeamModal = (team: Team | null = null) => {
    if (team) {
      setCurrentTeamEdit(team);
      setSelectedOrgId(typeof team.orgId === "object" ? team.orgId._id : team.orgId);
    } else {
      setCurrentTeamEdit({
        name: "",
        description: "",
        permissions: {
          leads: "all",
          customers: "all",
          invoices: "all",
          tickets: "all"
        }
      });
      setSelectedOrgId("");
    }
    setIsTeamModalOpen(true);
  };

  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeamEdit) return;

    try {
      setIsSubmitting(true);
      const url = currentTeamEdit._id ? `/api/teams/${currentTeamEdit._id}` : "/api/teams";
      const method = currentTeamEdit._id ? "PATCH" : "POST";

      const payload = {
        name: currentTeamEdit.name,
        description: currentTeamEdit.description,
        permissions: currentTeamEdit.permissions,
        orgId: selectedOrgId
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsTeamModalOpen(false);
        fetchTeams();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save team.");
      }
    } catch (error) {
      console.error("Error saving team:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTeam = async (teamId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the team "${name}"?`)) return;

    try {
      const res = await fetch(`/api/teams/${teamId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchTeams();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete team.");
      }
    } catch (error) {
      console.error("Failed to delete team:", error);
    }
  };

  // SEARCH FILTERS
  const filteredOrgs = organizations.filter((org) => {
    const query = orgSearchQuery.toLowerCase();
    return org.name.toLowerCase().includes(query) || org.slug.toLowerCase().includes(query);
  });

  const filteredUsers = users.filter((u) => {
    const query = userSearchQuery.toLowerCase();
    const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
    const email = (u.email || "").toLowerCase();
    const orgName = (u.orgId?.name || "Sovereign").toLowerCase();
    const teamName = (u.teamId?.name || "No Team").toLowerCase();
    return fullName.includes(query) || email.includes(query) || orgName.includes(query) || teamName.includes(query);
  });

  const filteredTeams = teams.filter((t) => {
    const query = teamSearchQuery.toLowerCase();
    const name = t.name.toLowerCase();
    const desc = (t.description || "").toLowerCase();
    const orgName = (typeof t.orgId === "object" ? t.orgId.name : 
      organizations.find(o => o._id === t.orgId)?.name || "").toLowerCase();
    return name.includes(query) || desc.includes(query) || orgName.includes(query);
  });

  // Dynamic dropdown lists matching selected organization context
  const availableTeams = selectedOrgId 
    ? teams.filter(t => (typeof t.orgId === "object" ? t.orgId._id : t.orgId) === selectedOrgId)
    : [];

  const availableSeniors = selectedOrgId
    ? users.filter(u => u.orgId?._id === selectedOrgId && (u.roleTier === "senior" || u.roleTier === "admin"))
    : [];

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
            <h1 className="text-2xl font-bold tracking-tight">Super Admin Control Hub</h1>
            <p className="text-sm text-foreground-secondary">Manage organizations, enroll and assign users to teams, edit permission schemes, and restrict direct customer scoping.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {activeTab === "companies" && (
            <button
              onClick={handleOpenOrgModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-all active:scale-95 cursor-pointer shadow-md shadow-accent/10"
            >
              <Plus size={16} />
              <span>Register Company</span>
            </button>
          )}
          {activeTab === "users" && (
            <button
              onClick={() => handleOpenUserModal(null)}
              className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-all active:scale-95 cursor-pointer shadow-md shadow-accent/10"
            >
              <Plus size={16} />
              <span>Enroll User Profile</span>
            </button>
          )}
          {activeTab === "teams" && (
            <button
              onClick={() => handleOpenTeamModal(null)}
              className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-all active:scale-95 cursor-pointer shadow-md shadow-accent/10"
            >
              <Plus size={16} />
              <span>Create Dynamic Team</span>
            </button>
          )}
        </div>
      </div>

      {/* Impersonation Warning Banner */}
      {activeImpersonatedOrg && (
        <div className="p-4 bg-warning-muted/15 border border-warning/20 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Building2 className="text-warning w-5 h-5 shrink-0" />
            <p className="text-sm font-semibold text-foreground-secondary">
              ⚠️ <strong className="text-warning">Active Impersonation Context:</strong> You are currently inspecting data scoped strictly to organization ID: <code className="bg-surface-active px-1.5 py-0.5 rounded text-xs">{activeImpersonatedOrg}</code>.
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
        <button
          onClick={() => setActiveTab("teams")}
          className={`pb-4 text-sm font-bold relative transition-colors cursor-pointer ${
            activeTab === "teams" ? "text-accent" : "text-foreground-secondary hover:text-foreground"
          }`}
        >
          <div className="flex items-center gap-2">
            <Shield size={16} />
            <span>Global Teams & Access</span>
          </div>
          {activeTab === "teams" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full animate-fade-in" />
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
          <p className="text-sm text-foreground-secondary font-semibold">Loading control configurations...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: COMPANIES */}
          {activeTab === "companies" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

              <div className="bg-surface border border-border rounded-2xl p-5 space-y-5 h-fit shadow-sm">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Globe className="text-accent w-5 h-5" />
                  <span>CRM Tenant Hub</span>
                </h3>
                <p className="text-xs text-foreground-secondary leading-relaxed">
                  Tenant organizations segregate client databases completely. Registering a company generates an isolated space where teams, staff members, leads, and orders reside.
                </p>
                <div className="p-4 bg-background rounded-xl space-y-2 border border-border">
                  <div className="flex gap-2 text-warning items-center text-xs font-bold uppercase tracking-wider mb-1">
                    <AlertCircle size={14} />
                    <span>Scoping Policy</span>
                  </div>
                  <p className="text-[11px] text-foreground-secondary leading-relaxed">
                    By default, your account is configured to see <strong>zero client database rows</strong>. To view data, click <strong>Inspect Database</strong> on any organization to filter lead and contact lists to that company.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER PROFILES */}
          {activeTab === "users" && (
            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base">Global User Account Directory ({filteredUsers.length})</h3>
                  <p className="text-xs text-foreground-secondary mt-0.5">Edit credentials, assign organizations, customize role access tiers, and suspend or delete profiles.</p>
                </div>
                <div className="relative flex items-center max-w-xs w-full">
                  <Search className="absolute left-3 text-foreground-muted w-4 h-4" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search users, email, company, team..."
                    className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-xs font-semibold outline-none focus:border-accent text-foreground"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-background-secondary/35 text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
                      <th className="px-5 py-3.5">User Profile</th>
                      <th className="px-5 py-3.5">Assigned Organization & Team</th>
                      <th className="px-5 py-3.5">Access Tier</th>
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
                              <div className="font-semibold text-foreground flex items-center gap-1.5">
                                <span>{user.firstName} {user.lastName}</span>
                              </div>
                              <div className="text-xs text-foreground-secondary flex items-center gap-1 mt-0.5">
                                <Mail size={12} className="text-foreground-muted" />
                                <span>{user.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            {user.orgId ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                                  <Building2 size={13} className="text-foreground-secondary" />
                                  <span>{user.orgId.name}</span>
                                </div>
                                <div className="text-xs text-foreground-secondary">
                                  Team: <span className="font-medium text-foreground">{user.teamId?.name || "None Assigned"}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-purple-400 font-semibold">
                                <Shield size={13} />
                                <span>Global (Sovereign)</span>
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            {user.roleTier === "super_admin" ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                                Super Admin
                              </span>
                            ) : user.roleTier === "admin" ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                Company Admin
                              </span>
                            ) : user.roleTier === "senior" ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                Senior Manager
                              </span>
                            ) : user.roleTier === "junior" ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                                Junior Rep
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                Pending Access
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
                            <div className="inline-flex items-center gap-2">
                              {/* Edit Action */}
                              <button
                                onClick={() => handleOpenUserModal(user)}
                                className="p-2 bg-surface hover:bg-surface-hover border border-border hover:border-border-hover rounded-xl text-foreground-secondary hover:text-foreground transition-all cursor-pointer"
                                title="Edit Profile settings"
                              >
                                <Edit size={14} />
                              </button>

                              {/* Toggle active button */}
                              <button
                                onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                                className={`inline-flex items-center gap-1 px-3 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  user.isActive
                                    ? "bg-red-500/5 hover:bg-red-500/10 border-red-500/15 hover:border-red-500/30 text-red-500"
                                    : "bg-green-500/5 hover:bg-green-500/10 border-green-500/15 hover:border-green-500/30 text-green-500"
                                }`}
                              >
                                {user.isActive ? <Lock size={12} /> : <Unlock size={12} />}
                                <span>{user.isActive ? "Suspend" : "Activate"}</span>
                              </button>

                              {/* Delete Action */}
                              <button
                                onClick={() => handleDeleteUser(user._id, user.email)}
                                className="p-2 bg-red-500/5 hover:bg-red-500 hover:text-white border border-red-500/15 hover:border-red-500 rounded-xl text-red-500 transition-all cursor-pointer animate-fade-in"
                                title="Delete user account"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-16 text-foreground-muted font-medium">
                          No user profiles found matching search query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: DYNAMIC TEAMS */}
          {activeTab === "teams" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="font-bold text-base">Global Enterprise Teams ({filteredTeams.length})</h3>
                  <div className="relative flex items-center max-w-xs w-full">
                    <Search className="absolute left-3 text-foreground-muted w-4 h-4" />
                    <input
                      type="text"
                      value={teamSearchQuery}
                      onChange={(e) => setTeamSearchQuery(e.target.value)}
                      placeholder="Search teams..."
                      className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-xs font-semibold outline-none focus:border-accent text-foreground"
                    />
                  </div>
                </div>

                {filteredTeams.length === 0 ? (
                  <div className="bg-surface border border-border rounded-2xl p-12 text-center text-foreground-muted font-medium">
                    No teams found matching search criteria.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTeams.map((team) => {
                      const orgName = typeof team.orgId === "object" ? team.orgId.name : 
                        organizations.find(o => o._id === team.orgId)?.name || "Default Organization";
                      return (
                        <div
                          key={team._id}
                          className="bg-surface border border-border rounded-2xl p-5 space-y-4 hover:border-border-hover transition-all group relative card-hover"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-bold text-base text-foreground">{team.name}</h3>
                              <p className="text-xs text-foreground-secondary font-medium mt-1 flex items-center gap-1">
                                <Building2 size={12} className="text-foreground-muted" />
                                <span>{orgName}</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleOpenTeamModal(team)}
                                className="p-1.5 bg-background border border-border hover:bg-surface-active rounded-lg text-foreground-secondary hover:text-foreground transition-all cursor-pointer"
                              >
                                <Edit size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteTeam(team._id, team.name)}
                                className="p-1.5 bg-red-500/5 border border-red-500/15 hover:bg-red-500 rounded-lg text-red-500 hover:text-white transition-all cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-foreground-secondary leading-relaxed line-clamp-2">{team.description || "No description provided."}</p>

                          <div className="border-t border-border/60 pt-3 grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-medium">
                            <div className="flex items-center justify-between">
                              <span className="text-foreground-secondary">Leads</span>
                              <span className="font-bold text-accent uppercase text-[10px] tracking-wider">{team.permissions.leads}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-foreground-secondary">Customers</span>
                              <span className="font-bold text-accent uppercase text-[10px] tracking-wider">{team.permissions.customers}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-foreground-secondary">Invoices</span>
                              <span className="font-bold text-accent uppercase text-[10px] tracking-wider">{team.permissions.invoices}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-foreground-secondary">Tickets</span>
                              <span className="font-bold text-accent uppercase text-[10px] tracking-wider">{team.permissions.tickets}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-surface border border-border rounded-2xl p-5 space-y-4 h-fit shadow-sm">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Shield size={18} className="text-accent" />
                  <span>Dynamic Access Control</span>
                </h3>
                <p className="text-xs text-foreground-secondary leading-relaxed">
                  Teams map out functional groups (e.g. "Sales", "Support") inside an organization. Members of a team inherit its dynamic module permissions (leads, invoices, tickets, customers) as access rules.
                </p>
                <div className="p-3.5 bg-background rounded-xl border border-border space-y-2.5">
                  <h4 className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Dynamic Scopes</h4>
                  <ul className="text-[11px] font-medium space-y-1.5 list-disc list-inside text-foreground-secondary">
                    <li><strong>None:</strong> Module is hidden from sidebar.</li>
                    <li><strong>Read:</strong> Users can inspect but not create.</li>
                    <li><strong>Write:</strong> Read, write, and configure.</li>
                    <li><strong>All:</strong> Owner rights, logs, exports.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL 1: REGISTER ORGANIZATION */}
      <Modal
        isOpen={isOrgModalOpen}
        onClose={() => setIsOrgModalOpen(false)}
        title="Register New Client Organization"
      >
        <form onSubmit={handleOrgSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block font- Outfit">Company Name</label>
            <input
              required
              value={newOrgName}
              onChange={(e) => autoGenerateSlug(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none"
              placeholder="Acme Corporation"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Subdomain Prefix Slug</label>
            <div className="relative flex items-center">
              <input
                required
                value={newOrgSlug}
                onChange={(e) => setNewOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none pr-32"
                placeholder="acme"
              />
              <span className="absolute right-4 text-xs font-bold text-foreground-muted">.rvmcrm.com</span>
            </div>
            <span className="text-[10px] text-foreground-muted mt-1.5 block">Determines subdomain URL prefix. Must contain only lowercase alphanumeric characters.</span>
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

      {/* MODAL 2: USER PROFILE ENROLL/EDIT */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title={isEnrollMode ? "Enroll Staff Account" : "Edit User Profile settings"}
      >
        <form onSubmit={handleUserSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">First Name</label>
              <input
                required
                value={currentUserEdit?.firstName || ""}
                onChange={(e) => setCurrentUserEdit({ ...currentUserEdit!, firstName: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none"
                placeholder="John"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Last Name</label>
              <input
                required
                value={currentUserEdit?.lastName || ""}
                onChange={(e) => setCurrentUserEdit({ ...currentUserEdit!, lastName: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Email Address</label>
              <input
                required
                type="email"
                disabled={!isEnrollMode}
                value={currentUserEdit?.email || ""}
                onChange={(e) => setCurrentUserEdit({ ...currentUserEdit!, email: e.target.value })}
                className="w-full bg-background disabled:bg-surface-active border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none"
                placeholder="john.doe@company.com"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Phone Number</label>
              <input
                value={currentUserEdit?.phone || ""}
                onChange={(e) => setCurrentUserEdit({ ...currentUserEdit!, phone: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none"
                placeholder="e.g. +1 555-0199"
              />
            </div>
          </div>

          {isEnrollMode && (
            <div>
              <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Initial Password</label>
              <input
                required
                type="password"
                value={enrollPassword}
                onChange={(e) => setEnrollPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none"
                placeholder="Minimum 8 characters"
              />
            </div>
          )}

          <div className="border-t border-border pt-3 mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block font-medium">Access Tier</label>
              <select
                value={currentUserEdit?.roleTier || "junior"}
                onChange={(e) => setCurrentUserEdit({ ...currentUserEdit!, roleTier: e.target.value as any })}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none cursor-pointer"
              >
                <option value="none">None (Access Blocked)</option>
                <option value="junior">Junior Rep (Confined context)</option>
                <option value="senior">Senior Manager (Team scope)</option>
                <option value="admin">Company Administrator (Full Tenant)</option>
                <option value="super_admin">Super Admin (Global Scope)</option>
              </select>
            </div>
            {currentUserEdit?.roleTier !== "super_admin" && (
              <div>
                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Functional Role</label>
                <select
                  value={currentUserEdit?.role || "sales"}
                  onChange={(e) => setCurrentUserEdit({ ...currentUserEdit!, role: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none cursor-pointer"
                >
                  <option value="sales">Sales Representative</option>
                  <option value="service_tech">Service Technician</option>
                  <option value="field_agent">Field Agent</option>
                </select>
              </div>
            )}
          </div>

          {currentUserEdit?.roleTier !== "super_admin" && (
            <div className="space-y-4 border-t border-border pt-4 mt-3 animate-fade-in">
              <h4 className="text-xs font-bold text-foreground-muted uppercase tracking-widest">Client Organization Assignments</h4>
              
              <div>
                <label className="text-xs font-bold text-foreground-secondary mb-1.5 block">Select Tenant Company</label>
                <select
                  value={selectedOrgId}
                  onChange={(e) => {
                    setSelectedOrgId(e.target.value);
                    setSelectedTeamId("");
                    setSelectedParentId("");
                  }}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none cursor-pointer"
                >
                  <option value="">None / Global (Orphaned)</option>
                  {organizations.map(o => (
                    <option key={o._id} value={o._id}>{o.name}</option>
                  ))}
                </select>
              </div>

              {selectedOrgId && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                  <div>
                    <label className="text-xs font-bold text-foreground-secondary mb-1.5 block">Assign Team</label>
                    <select
                      value={selectedTeamId}
                      onChange={(e) => setSelectedTeamId(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:border-accent outline-none cursor-pointer"
                    >
                      <option value="">No Team</option>
                      {availableTeams.map(t => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground-secondary mb-1.5 block">Senior Supervisor / Manager</label>
                    <select
                      value={selectedParentId}
                      onChange={(e) => setSelectedParentId(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:border-accent outline-none cursor-pointer"
                    >
                      <option value="">No Supervisor (Reports directly to Admin)</option>
                      {availableSeniors
                        .filter(u => u._id !== currentUserEdit?._id)
                        .map(u => (
                          <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.roleTier})</option>
                        ))
                      }
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-5">
            <button
              type="button"
              onClick={() => setIsUserModalOpen(false)}
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
              <span>{isEnrollMode ? "Enroll User" : "Save Properties"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: TEAM CREATE/EDIT */}
      <Modal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        title={currentTeamEdit?._id ? "Configure Dynamic Team" : "Create Dynamic Team"}
      >
        <form onSubmit={handleTeamSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Select Tenant Company</label>
            <select
              required
              disabled={!!currentTeamEdit?._id}
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="w-full bg-background disabled:bg-surface-active border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none cursor-pointer"
            >
              <option value="" disabled>Choose an organization...</option>
              {organizations.map(o => (
                <option key={o._id} value={o._id}>{o.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Team Name</label>
              <input
                required
                value={currentTeamEdit?.name || ""}
                onChange={(e) => setCurrentTeamEdit({ ...currentTeamEdit!, name: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none"
                placeholder="Acme Support division"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Description</label>
              <textarea
                value={currentTeamEdit?.description || ""}
                onChange={(e) => setCurrentTeamEdit({ ...currentTeamEdit!, description: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-4 py-2 text-xs text-foreground focus:border-accent outline-none h-16 resize-none"
                placeholder="Workflow responsibilities for members of this team..."
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-foreground-muted uppercase tracking-wider border-b border-border pb-1.5">Module Permission Schemes</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-foreground-secondary mb-1 block">Leads</label>
                <select
                  value={currentTeamEdit?.permissions?.leads || "all"}
                  onChange={(e) => setCurrentTeamEdit({
                    ...currentTeamEdit!,
                    permissions: { ...currentTeamEdit!.permissions!, leads: e.target.value as any }
                  })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:border-accent outline-none cursor-pointer"
                >
                  <option value="none font-semibold">Hidden</option>
                  <option value="read">Read Only</option>
                  <option value="write">Write Only</option>
                  <option value="all">Full Rights</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground-secondary mb-1 block">Customers</label>
                <select
                  value={currentTeamEdit?.permissions?.customers || "all"}
                  onChange={(e) => setCurrentTeamEdit({
                    ...currentTeamEdit!,
                    permissions: { ...currentTeamEdit!.permissions!, customers: e.target.value as any }
                  })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:border-accent outline-none cursor-pointer"
                >
                  <option value="none">Hidden</option>
                  <option value="read">Read Only</option>
                  <option value="write">Write Only</option>
                  <option value="all">Full Rights</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground-secondary mb-1 block">Invoices</label>
                <select
                  value={currentTeamEdit?.permissions?.invoices || "all"}
                  onChange={(e) => setCurrentTeamEdit({
                    ...currentTeamEdit!,
                    permissions: { ...currentTeamEdit!.permissions!, invoices: e.target.value as any }
                  })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:border-accent outline-none cursor-pointer"
                >
                  <option value="none">Hidden</option>
                  <option value="read">Read Only</option>
                  <option value="write">Write Only</option>
                  <option value="all">Full Rights</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground-secondary mb-1 block">Service Tickets</label>
                <select
                  value={currentTeamEdit?.permissions?.tickets || "all"}
                  onChange={(e) => setCurrentTeamEdit({
                    ...currentTeamEdit!,
                    permissions: { ...currentTeamEdit!.permissions!, tickets: e.target.value as any }
                  })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:border-accent outline-none cursor-pointer"
                >
                  <option value="none">Hidden</option>
                  <option value="read">Read Only</option>
                  <option value="write">Write Only</option>
                  <option value="all">Full Rights</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
            <button
              type="button"
              onClick={() => setIsTeamModalOpen(false)}
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
              <span>{currentTeamEdit?._id ? "Update Team" : "Save Team"}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
