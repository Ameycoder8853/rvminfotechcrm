"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Plus, Building2, Shield, Loader2, ArrowRight, Globe, Users, 
  ShieldAlert, Lock, Unlock, Search, Check, Edit, Trash2, 
  Mail, PhoneCall, CheckCircle, AlertCircle, ChevronDown, ChevronUp,
  Settings, Key, Eye
} from "lucide-react";
import Modal from "@/components/shared/modal";

interface Organization {
  _id: string;
  name: string;
  slug: string;
  status: "active" | "suspended";
  dbConnectionString?: string;
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

// Safely normalizes ObjectId and populated organization references to plain strings
const getOrgIdStr = (orgId: any): string => {
  if (!orgId) return "";
  if (typeof orgId === "object") {
    return (orgId._id || orgId).toString();
  }
  return orgId.toString();
};

export default function SuperAdminPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeImpersonatedOrg, setActiveImpersonatedOrg] = useState<string | null>(null);

  // Expanded organizations state
  const [expandedOrgs, setExpandedOrgs] = useState<Record<string, boolean>>({});

  // Unified global search query
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states: Organization Create/Edit
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgSlug, setNewOrgSlug] = useState("");
  const [orgStatus, setOrgStatus] = useState<"active" | "suspended">("active");
  const [newOrgDbString, setNewOrgDbString] = useState("");

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
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  }, []);

  const fetchTeams = useCallback(async () => {
    try {
      const res = await fetch("/api/teams");
      const data = await res.json();
      if (data.success) {
        setTeams(data.data);
      }
    } catch (error) {
      console.error("Failed to load teams:", error);
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

  // IMPERSONATION (Inspect database)
  const handleImpersonate = (orgId: string, orgName: string) => {
    if (typeof window !== "undefined") {
      if (activeImpersonatedOrg === orgId) {
        sessionStorage.removeItem("rvm_impersonate_org_id");
        sessionStorage.removeItem("rvm_impersonate_org_name");
        document.cookie = "rvm_impersonate_org_id=; path=/; max-age=0";
        setActiveImpersonatedOrg(null);
        alert("Impersonation cleared. Viewing global database.");
      } else {
        sessionStorage.setItem("rvm_impersonate_org_id", orgId);
        sessionStorage.setItem("rvm_impersonate_org_name", orgName);
        document.cookie = `rvm_impersonate_org_id=${orgId}; path=/; max-age=31536000`; // 1 year
        setActiveImpersonatedOrg(orgId);
        alert(`Now impersonating context: ${orgName}. Database requests will filter to this company.`);
      }
      window.location.reload();
    }
  };

  // ORGANIZATION ACTIONS
  const handleOpenOrgModal = (org: Organization | null = null) => {
    if (org) {
      setEditingOrgId(org._id);
      setNewOrgName(org.name);
      setNewOrgSlug(org.slug);
      setOrgStatus(org.status);
      setNewOrgDbString(org.dbConnectionString || "");
    } else {
      setEditingOrgId(null);
      setNewOrgName("");
      setNewOrgSlug("");
      setOrgStatus("active");
      setNewOrgDbString("");
    }
    setIsOrgModalOpen(true);
  };

  const handleOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName || !newOrgSlug) return;

    try {
      setIsSubmitting(true);
      const url = editingOrgId ? `/api/organizations/${editingOrgId}` : "/api/organizations";
      const method = editingOrgId ? "PATCH" : "POST";
      const body: Record<string, any> = { 
        name: newOrgName, 
        slug: newOrgSlug, 
        dbConnectionString: newOrgDbString 
      };
      if (editingOrgId) {
        body.status = orgStatus;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setIsOrgModalOpen(false);
        setEditingOrgId(null);
        fetchAllData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save organization.");
      }
    } catch (error) {
      console.error("Failed to submit organization:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOrg = async (orgId: string, name: string) => {
    if (!confirm(`Are you absolutely sure you want to permanently delete the organization "${name}"?\nThis will remove the organization, delete all associated teams, and unassign all associated users. This action CANNOT be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/organizations/${orgId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        alert("Organization and associated components deleted successfully.");
        fetchAllData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete organization.");
      }
    } catch (error) {
      console.error("Failed to delete organization:", error);
    }
  };

  const autoGenerateSlug = (val: string) => {
    setNewOrgName(val);
    if (!editingOrgId) {
      setNewOrgSlug(val.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""));
    }
  };

  // USER PROFILE ACTIONS
  const handleOpenUserModal = (user: UserProfile | null = null, defaultOrgId: string = "") => {
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
        roleTier: defaultOrgId ? "junior" : "super_admin",
        role: defaultOrgId ? "sales" : "admin",
        phone: "",
      });
      setSelectedOrgId(defaultOrgId);
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
        parentManager: currentUserEdit.roleTier === "junior" ? (selectedParentId || null) : null,
      };

      if (isEnrollMode) {
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
    if (!confirm(`Are you absolutely sure you want to permanently delete the user ${email}?\nThis will remove them from the database and delete their Clerk account. This action CANNOT be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        alert("User account deleted successfully.");
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
  const handleOpenTeamModal = (team: Team | null = null, defaultOrgId: string = "") => {
    if (team) {
      setCurrentTeamEdit(team);
      setSelectedOrgId(getOrgIdStr(team.orgId));
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
      setSelectedOrgId(defaultOrgId);
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
        fetchAllData();
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
        fetchAllData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete team.");
      }
    } catch (error) {
      console.error("Failed to delete team:", error);
    }
  };

  // HIERARCHICAL FILTERS
  const toggleOrgCollapse = (orgId: string) => {
    setExpandedOrgs(prev => ({
      ...prev,
      [orgId]: !prev[orgId]
    }));
  };

  const expandAllOrgs = () => {
    setExpandedOrgs({});
  };

  const collapseAllOrgs = () => {
    const next: Record<string, boolean> = {};
    organizations.forEach((o) => {
      next[o._id] = true;
    });
    setExpandedOrgs(next);
  };

  const getTeamsForOrg = (orgId: string) => {
    const orgTeams = teams.filter((t) => getOrgIdStr(t.orgId) === orgId);
    if (!searchQuery) return orgTeams;
    const query = searchQuery.toLowerCase();
    return orgTeams.filter((t) => t.name.toLowerCase().includes(query) || (t.description || "").toLowerCase().includes(query));
  };

  const getUsersForOrg = (orgId: string | null) => {
    const orgUsers = users.filter((u) => {
      const userOrgId = u.orgId ? getOrgIdStr(u.orgId) : null;
      return userOrgId === orgId;
    });
    if (!searchQuery) return orgUsers;
    const query = searchQuery.toLowerCase();
    return orgUsers.filter((u) => {
      const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
      const email = (u.email || "").toLowerCase();
      return fullName.includes(query) || email.includes(query);
    });
  };

  // Filter organizations shown based on search query
  const filteredOrgs = organizations.filter((org) => {
    const query = searchQuery.toLowerCase();
    const orgMatches = org.name.toLowerCase().includes(query) || org.slug.toLowerCase().includes(query);
    if (orgMatches) return true;

    // Check if any team under this org matches
    const matchingTeams = getTeamsForOrg(org._id);
    if (matchingTeams.length > 0) return true;

    // Check if any user under this org matches
    const matchingUsers = getUsersForOrg(org._id);
    if (matchingUsers.length > 0) return true;

    return false;
  });

  const globalUnassignedUsers = getUsersForOrg(null);

  // Dynamic dropdown lists matching selected organization context in Modals
  const availableTeams = selectedOrgId 
    ? teams.filter(t => getOrgIdStr(t.orgId) === selectedOrgId)
    : [];

  const availableSeniors = selectedOrgId
    ? users.filter(u => u.orgId && getOrgIdStr(u.orgId) === selectedOrgId && (u.roleTier === "senior" || u.roleTier === "admin"))
    : [];

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-fade-in text-foreground">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-muted flex items-center justify-center text-accent">
            <Shield size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Super Admin Control Hub</h1>
            <p className="text-sm text-foreground-secondary">Manage organizations, and edit their nested teams and users hierarchically.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenOrgModal(null)}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-all active:scale-95 cursor-pointer shadow-md shadow-accent/10"
          >
            <Plus size={16} />
            <span>Register Company</span>
          </button>
          <button
            onClick={() => handleOpenUserModal(null, "")}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface hover:bg-surface-hover border border-border text-foreground rounded-xl text-sm font-semibold transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            <Plus size={16} />
            <span>Enroll Global Admin</span>
          </button>
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

      {/* Search and Expand/Collapse Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex items-center max-w-md w-full bg-surface border border-border rounded-xl">
          <Search className="absolute left-3.5 text-foreground-muted w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search companies, slugs, teams, and user profiles..."
            className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:border-accent text-foreground placeholder-foreground-muted border-none shadow-none"
            style={{ backgroundColor: "transparent" }}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={expandAllOrgs}
            className="px-3.5 py-2 bg-surface hover:bg-surface-hover border border-border rounded-xl text-xs font-bold transition-all text-foreground cursor-pointer"
          >
            Expand All
          </button>
          <button
            onClick={collapseAllOrgs}
            className="px-3.5 py-2 bg-surface hover:bg-surface-hover border border-border rounded-xl text-xs font-bold transition-all text-foreground cursor-pointer"
          >
            Collapse All
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
          <p className="text-sm text-foreground-secondary font-semibold">Loading control configurations...</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* HIERARCHICAL ORGANIZATIONS LIST */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <Building2 size={18} className="text-foreground-muted" />
              <span>CRM Tenant Registry ({filteredOrgs.length})</span>
            </h2>

            {filteredOrgs.map((org) => {
              const isCollapsed = expandedOrgs[org._id] === true;
              const orgTeams = getTeamsForOrg(org._id);
              const orgUsers = getUsersForOrg(org._id);
              const isImpersonating = activeImpersonatedOrg === org._id;

              return (
                <div 
                  key={org._id} 
                  className={`bg-surface border rounded-2xl overflow-hidden shadow-sm transition-all duration-200 ${
                    isImpersonating ? "border-warning/50 ring-1 ring-warning/20 bg-warning/5" : "border-border"
                  }`}
                >
                  {/* Collapsible Header */}
                  <div 
                    onClick={() => toggleOrgCollapse(org._id)}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-surface-hover/30 select-none transition-colors border-b border-border/40"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div 
                        className={`p-2 rounded-lg ${
                          isImpersonating ? "bg-warning/10 text-warning" : "bg-accent-muted text-accent"
                        }`}
                      >
                        <Building2 size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-foreground truncate">{org.name}</h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                            org.status === "active" 
                              ? "bg-green-500/10 text-green-500 border border-green-500/20" 
                              : "bg-red-500/10 text-red-500 border border-red-500/20"
                          }`}>
                            {org.status}
                          </span>
                        </div>
                        <p className="text-xs text-foreground-secondary font-medium mt-0.5 flex flex-wrap items-center gap-y-1">
                          <span>Slug: <span className="text-foreground font-bold">{org.slug}.rvmcrm.com</span></span>
                          <span className="mx-2">•</span>
                          <span>{orgTeams.length} Teams</span>
                          <span className="mx-2">•</span>
                          <span>{orgUsers.length} Users</span>
                          {org.dbConnectionString && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-500 font-bold text-[9px] uppercase tracking-wider">Custom DB Cluster</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Org Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 sm:self-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleImpersonate(org._id, org.name)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isImpersonating
                            ? "bg-warning text-black hover:bg-warning-hover font-extrabold"
                            : "bg-accent-muted text-accent hover:bg-accent hover:text-white"
                        }`}
                        title="Impersonate organization to inspect its database"
                      >
                        <Eye size={12} />
                        <span>{isImpersonating ? "Stop Inspecting" : "Inspect DB"}</span>
                      </button>

                      <button
                        onClick={() => handleOpenOrgModal(org)}
                        className="p-2 bg-surface border border-border hover:border-border-hover text-foreground-secondary hover:text-foreground rounded-lg transition-all cursor-pointer"
                        title="Edit organization registry details"
                      >
                        <Edit size={13} />
                      </button>

                      <button
                        onClick={() => handleDeleteOrg(org._id, org.name)}
                        className="p-2 bg-red-500/5 border border-red-500/15 hover:bg-red-500 rounded-lg text-red-500 hover:text-white transition-all cursor-pointer"
                        title="Delete organization registry"
                      >
                        <Trash2 size={13} />
                      </button>

                      <div className="pl-1 text-foreground-muted">
                        {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Content */}
                  {!isCollapsed && (
                    <div className="p-4 sm:p-6 bg-background-secondary/10 space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* TEAMS NESTED SECTION */}
                        <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
                          <div className="flex items-center justify-between border-b border-border pb-3">
                            <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                              <Shield size={15} className="text-foreground-secondary" />
                              <span>Organization Teams ({orgTeams.length})</span>
                            </h4>
                            <button
                              onClick={() => handleOpenTeamModal(null, org._id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/10 hover:bg-accent text-accent hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                            >
                              <Plus size={11} />
                              <span>Add Team</span>
                            </button>
                          </div>

                          {orgTeams.length === 0 ? (
                            <p className="text-xs text-foreground-muted py-6 text-center">No teams registered under this organization.</p>
                          ) : (
                            <div className="space-y-3 max-h-75 overflow-y-auto pr-1">
                              {orgTeams.map((team) => (
                                <div key={team._id} className="p-3 bg-background border border-border/80 rounded-xl hover:border-border transition-all flex items-start justify-between gap-3 group">
                                  <div className="min-w-0 flex-1">
                                    <h5 className="font-bold text-xs text-foreground truncate">{team.name}</h5>
                                    <p className="text-[11px] text-foreground-secondary leading-normal line-clamp-2 mt-0.5">{team.description || "No description provided."}</p>
                                    <div className="flex flex-wrap gap-x-2.5 gap-y-1 mt-2 text-[9px] font-extrabold uppercase text-accent tracking-wider">
                                      <span>Leads: {team.permissions.leads}</span>
                                      <span className="text-border">•</span>
                                      <span>Cust: {team.permissions.customers}</span>
                                      <span className="text-border">•</span>
                                      <span>Inv: {team.permissions.invoices}</span>
                                      <span className="text-border">•</span>
                                      <span>Tkt: {team.permissions.tickets}</span>
                                    </div>
                                  </div>
                                  {/* Action buttons are always visible on mobile/tablet, and hover-triggered on desktop */}
                                  <div className="flex items-center gap-1 shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => handleOpenTeamModal(team)}
                                      className="p-1.5 hover:bg-surface border border-transparent hover:border-border rounded text-foreground-secondary hover:text-foreground transition-all cursor-pointer"
                                    >
                                      <Edit size={11} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTeam(team._id, team.name)}
                                      className="p-1.5 hover:bg-red-500/10 rounded text-red-500 transition-all cursor-pointer"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* USERS NESTED SECTION */}
                        <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
                          <div className="flex items-center justify-between border-b border-border pb-3">
                            <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                              <Users size={15} className="text-foreground-secondary" />
                              <span>Organization Users ({orgUsers.length})</span>
                            </h4>
                            <button
                              onClick={() => handleOpenUserModal(null, org._id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/10 hover:bg-accent text-accent hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                            >
                              <Plus size={11} />
                              <span>Enroll User</span>
                            </button>
                          </div>

                          {orgUsers.length === 0 ? (
                            <p className="text-xs text-foreground-muted py-6 text-center">No users enrolled under this organization.</p>
                          ) : (
                            <div className="space-y-3 max-h-75 overflow-y-auto pr-1">
                              {orgUsers.map((user) => {
                                const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "U";
                                const teamName = user.teamId && typeof user.teamId === "object" ? user.teamId.name : "";
                                return (
                                  <div key={user._id} className="p-3 bg-background border border-border/80 rounded-xl hover:border-border transition-all flex items-center justify-between gap-3 group">
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                      {user.avatar ? (
                                        <img src={user.avatar} alt={user.firstName} className="w-8 h-8 rounded-lg object-cover border border-border shrink-0" />
                                      ) : (
                                        <div className="w-8 h-8 rounded-lg bg-accent-muted text-accent font-bold text-[10px] flex items-center justify-center shrink-0">
                                          {initials}
                                        </div>
                                      )}
                                      <div className="min-w-0 flex-1">
                                        <h5 className="font-bold text-xs text-foreground truncate">{user.firstName} {user.lastName}</h5>
                                        <p className="text-[10px] text-foreground-secondary truncate leading-none mt-0.5">{user.email}</p>
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
                                          {user.roleTier === "admin" ? (
                                            <span className="inline-flex items-center px-1.5 py-0.2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 rounded text-[8px] font-bold uppercase">Admin</span>
                                          ) : user.roleTier === "senior" ? (
                                            <span className="inline-flex items-center px-1.5 py-0.2 bg-blue-500/10 text-blue-400 border border-blue-500/15 rounded text-[8px] font-bold uppercase">Senior (Mngr)</span>
                                          ) : user.roleTier === "junior" ? (
                                            <span className="inline-flex items-center px-1.5 py-0.2 bg-slate-500/10 text-slate-400 border border-slate-500/15 rounded text-[8px] font-bold uppercase">Junior (Rep)</span>
                                          ) : (
                                            <span className="inline-flex items-center px-1.5 py-0.2 bg-yellow-500/10 text-yellow-500 border border-yellow-500/15 rounded text-[8px] font-bold uppercase">No Access</span>
                                          )}
                                          {teamName && (
                                            <span className="text-[9px] text-foreground-muted font-medium truncate">
                                              Team: <span className="font-semibold text-foreground-secondary">{teamName}</span>
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Action buttons are always visible on mobile/tablet, and hover-triggered on desktop */}
                                    <div className="flex items-center gap-1 shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={() => handleOpenUserModal(user)}
                                        className="p-1.5 hover:bg-surface border border-transparent hover:border-border rounded text-foreground-secondary hover:text-foreground transition-all cursor-pointer"
                                        title="Edit profile & permissions"
                                      >
                                        <Edit size={11} />
                                      </button>
                                      <button
                                        onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                                        className="p-1.5 hover:bg-surface border border-transparent hover:border-border rounded text-foreground-secondary hover:text-foreground transition-all cursor-pointer"
                                        title={user.isActive ? "Suspend User" : "Activate User"}
                                      >
                                        {user.isActive ? <Lock size={11} className="text-red-400" /> : <Unlock size={11} className="text-green-400" />}
                                      </button>
                                      <button
                                        onClick={() => handleDeleteUser(user._id, user.email)}
                                        className="p-1.5 hover:bg-red-500/10 rounded text-red-500 transition-all cursor-pointer"
                                        title="Permanently Delete User"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  )}

                </div>
              );
            })}

            {filteredOrgs.length === 0 && (
              <div className="bg-surface border border-border rounded-2xl p-12 text-center text-foreground-secondary font-medium">
                No organizations found matching search criteria.
              </div>
            )}
          </div>

          {/* GLOBAL / UNASSIGNED SYSTEM USERS SECTION */}
          {globalUnassignedUsers.length > 0 && (
            <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <Shield size={18} className="text-purple-400" />
                  <span>Global System Admins & Unassigned Users ({globalUnassignedUsers.length})</span>
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-[10px] font-bold uppercase tracking-wider text-foreground-muted bg-background-secondary/20">
                      <th className="px-4 py-3">Profile</th>
                      <th className="px-4 py-3">Access Tier</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/45 text-xs font-semibold">
                    {globalUnassignedUsers.map((user) => {
                      const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "U";
                      return (
                        <tr key={user._id} className="hover:bg-surface-hover/20 transition-colors">
                          <td className="px-4 py-3.5 flex items-center gap-2.5">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.firstName} className="w-8 h-8 rounded-lg object-cover border border-border shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-accent-muted text-accent font-bold text-[10px] flex items-center justify-center shrink-0">
                                {initials}
                              </div>
                            )}
                            <div>
                              <div className="text-foreground">{user.firstName} {user.lastName}</div>
                              <div className="text-[10px] text-foreground-secondary font-medium mt-0.5">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            {user.roleTier === "super_admin" ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_8px_rgba(168,85,247,0.1)]">
                                Super Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                Pending Org
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            {user.isActive ? (
                              <span className="text-green-500 inline-flex items-center gap-1">
                                <Check size={12} />
                                <span>Active</span>
                              </span>
                            ) : (
                              <span className="text-red-500 inline-flex items-center gap-1">
                                <ShieldAlert size={12} />
                                <span>Suspended</span>
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right pr-6">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenUserModal(user)}
                                className="p-1.5 hover:bg-surface border border-transparent hover:border-border rounded-lg text-foreground-secondary hover:text-foreground transition-all cursor-pointer"
                              >
                                <Edit size={12} />
                              </button>
                              <button
                                onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                                className="p-1.5 hover:bg-surface border border-transparent hover:border-border rounded-lg text-foreground-secondary hover:text-foreground transition-all cursor-pointer"
                              >
                                {user.isActive ? <Lock size={12} className="text-red-400" /> : <Unlock size={12} className="text-green-400" />}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user._id, user.email)}
                                className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-500 transition-all cursor-pointer"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* MODAL 1: REGISTER/EDIT ORGANIZATION */}
      <Modal
        isOpen={isOrgModalOpen}
        onClose={() => {
          setIsOrgModalOpen(false);
          setEditingOrgId(null);
        }}
        title={editingOrgId ? "Edit Organization Registry" : "Register New Client Organization"}
      >
        <form onSubmit={handleOrgSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Company Name</label>
            <input
              required
              value={newOrgName}
              onChange={(e) => autoGenerateSlug(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-semibold"
              placeholder="Acme Corporation"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Subdomain Prefix Slug</label>
            <div className="relative flex items-center">
              <input
                required
                disabled={!!editingOrgId}
                value={newOrgSlug}
                onChange={(e) => setNewOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                className="w-full bg-background disabled:bg-surface-active border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none pr-32 font-semibold"
                placeholder="acme"
              />
              <span className="absolute right-4 text-xs font-bold text-foreground-muted">.rvmcrm.com</span>
            </div>
            <span className="text-[10px] text-foreground-muted mt-1.5 block">Determines subdomain URL prefix. Must contain only lowercase alphanumeric characters.</span>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Custom MongoDB Connection String (Optional)</label>
            <input
              value={newOrgDbString}
              onChange={(e) => setNewOrgDbString(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-semibold font-mono"
              placeholder="mongodb+srv://user:pass@cluster.mongodb.net/dbname"
            />
            <span className="text-[10px] text-foreground-muted mt-1.5 block">Leave blank to use the default shared database cluster.</span>
          </div>

          {editingOrgId && (
            <div>
              <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Organization Status</label>
              <select
                value={orgStatus}
                onChange={(e) => setOrgStatus(e.target.value as any)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none cursor-pointer font-semibold"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setIsOrgModalOpen(false);
                setEditingOrgId(null);
              }}
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
              <span>{editingOrgId ? "Save Changes" : "Register Instance"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: USER PROFILE ENROLL/EDIT */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title={isEnrollMode ? "Enroll Client Account" : "Edit User Profile settings"}
      >
        <form onSubmit={handleUserSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">First Name</label>
              <input
                required
                value={currentUserEdit?.firstName || ""}
                onChange={(e) => setCurrentUserEdit({ ...currentUserEdit!, firstName: e.target.value.replace(/[^a-zA-Z\s'-]/g, "") })}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-semibold"
                placeholder="John"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Last Name</label>
              <input
                required
                value={currentUserEdit?.lastName || ""}
                onChange={(e) => setCurrentUserEdit({ ...currentUserEdit!, lastName: e.target.value.replace(/[^a-zA-Z\s'-]/g, "") })}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-semibold"
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
                onChange={(e) => setCurrentUserEdit({ ...currentUserEdit!, email: e.target.value.trim() })}
                className="w-full bg-background disabled:bg-surface-active border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-semibold"
                placeholder="john.doe@company.com"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Phone Number</label>
              <input
                value={currentUserEdit?.phone || ""}
                onChange={(e) => setCurrentUserEdit({ ...currentUserEdit!, phone: e.target.value.replace(/[^0-9+\-\s()]/g, "") })}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-semibold"
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
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-semibold"
                placeholder="Minimum 8 characters"
              />
            </div>
          )}

          <div className="border-t border-border pt-3 mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Access Tier</label>
              <select
                value={currentUserEdit?.roleTier || "junior"}
                onChange={(e) => setCurrentUserEdit({ ...currentUserEdit!, roleTier: e.target.value as any })}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none cursor-pointer font-semibold"
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
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none cursor-pointer font-semibold"
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
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none cursor-pointer font-semibold"
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
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:border-accent outline-none cursor-pointer font-semibold"
                    >
                      <option value="">No Team</option>
                      {availableTeams.map(t => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  {currentUserEdit?.roleTier === "junior" && (
                    <div>
                      <label className="text-xs font-bold text-foreground-secondary mb-1.5 block">Senior Supervisor / Manager</label>
                      <select
                        value={selectedParentId}
                        onChange={(e) => setSelectedParentId(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:border-accent outline-none cursor-pointer font-semibold"
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
                  )}
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
        title={currentTeamEdit?._id ? "Configure Team" : "Create New Team"}
      >
        <form onSubmit={handleTeamSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Select Tenant Company</label>
            <select
              required
              disabled={!!currentTeamEdit?._id}
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="w-full bg-background disabled:bg-surface-active border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none cursor-pointer font-semibold"
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
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-semibold"
                placeholder="Acme Sales Division"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Description</label>
              <textarea
                value={currentTeamEdit?.description || ""}
                onChange={(e) => setCurrentTeamEdit({ ...currentTeamEdit!, description: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-4 py-2 text-xs text-foreground focus:border-accent outline-none h-16 resize-none font-semibold"
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
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:border-accent outline-none cursor-pointer font-semibold"
                >
                  <option value="none">Hidden</option>
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
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:border-accent outline-none cursor-pointer font-semibold"
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
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:border-accent outline-none cursor-pointer font-semibold"
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
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:border-accent outline-none cursor-pointer font-semibold"
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
