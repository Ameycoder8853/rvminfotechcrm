"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Users, Shield, Loader2, Save, Trash2, UserPlus, CheckCircle, AlertTriangle, Edit } from "lucide-react";
import Modal from "@/components/shared/modal";

interface Team {
  _id: string;
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
  roleTier: "super_admin" | "admin" | "senior" | "junior";
  teamId?: Team;
  parentManager?: { _id: string; firstName: string; lastName: string };
  isActive: boolean;
  permissions?: {
    leads?: "none" | "read" | "write" | "all";
    customers?: "none" | "read" | "write" | "all";
    invoices?: "none" | "read" | "write" | "all";
    tickets?: "none" | "read" | "write" | "all";
  };
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Modal states
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentTeam, setCurrentTeam] = useState<Partial<Team> | null>(null);
  const [currentUserEdit, setCurrentUserEdit] = useState<Partial<UserProfile> | null>(null);

  // Enrollment states
  const [isEnrollMode, setIsEnrollMode] = useState(false);
  const [enrollPassword, setEnrollPassword] = useState("");
  const [enrollPhone, setEnrollPhone] = useState("");

  // Senior manager inside team modal state
  const [enrollSenior, setEnrollSenior] = useState(false);
  const [seniorForm, setSeniorForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: ""
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [teamsRes, usersRes, meRes] = await Promise.all([
        fetch("/api/teams"),
        fetch("/api/users"),
        fetch("/api/users/me")
      ]);

      const teamsData = await teamsRes.json();
      const usersData = await usersRes.json();
      const meData = await meRes.json();

      if (teamsData.success) setTeams(teamsData.data);
      if (usersData.success) setUsers(usersData.data);
      if (meData.success) {
        setCurrentUser(meData.data);
      }
    } catch (error) {
      console.error("Failed to fetch team data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [fetchData]);

  const handleOpenTeamModal = (team: Partial<Team> | null = null) => {
    setCurrentTeam(
      team || {
        name: "",
        description: "",
        permissions: {
          leads: "all",
          customers: "all",
          invoices: "all",
          tickets: "all",
        },
      }
    );
    setEnrollSenior(false);
    setSeniorForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: ""
    });
    setIsTeamModalOpen(true);
  };

  const handleOpenUserModal = (user: Partial<UserProfile> | null = null, forceEnroll: boolean = false) => {
    setIsEnrollMode(forceEnroll || !user);
    setEnrollPassword("");
    setEnrollPhone((user as any)?.phone || "");
    
    const defaultUser: any = {
      firstName: "",
      lastName: "",
      email: "",
      roleTier: "junior",
      teamId: undefined,
      parentManager: undefined,
      permissions: {
        leads: "",
        customers: "",
        invoices: "",
        tickets: "",
      }
    };

    if (user) {
      setCurrentUserEdit({
        ...user,
        permissions: {
          leads: (user as any).permissions?.leads || "",
          customers: (user as any).permissions?.customers || "",
          invoices: (user as any).permissions?.invoices || "",
          tickets: (user as any).permissions?.tickets || "",
        }
      });
    } else {
      setCurrentUserEdit(defaultUser);
    }
    setIsUserModalOpen(true);
  };

  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam) return;

    try {
      setIsSubmitting(true);
      const url = currentTeam._id ? `/api/teams/${currentTeam._id}` : "/api/teams";
      const method = currentTeam._id ? "PATCH" : "POST";

      const payload = {
        ...currentTeam,
        seniorManager: (!currentTeam._id && enrollSenior) ? seniorForm : undefined
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsTeamModalOpen(false);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save team.");
      }
    } catch (error) {
      console.error("Failed to save team:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserEdit) return;

    try {
      setIsSubmitting(true);
      
      const payload = {
        firstName: currentUserEdit.firstName,
        lastName: currentUserEdit.lastName,
        email: currentUserEdit.email,
        roleTier: currentUserEdit.roleTier || "junior",
        teamId: (currentUserEdit.teamId as any)?._id || currentUserEdit.teamId || undefined,
        parentManager: (currentUserEdit.parentManager as any)?._id || currentUserEdit.parentManager || undefined,
        phone: enrollPhone,
        permissions: (currentUserEdit as any).permissions,
      };

      if (isEnrollMode) {
        // Call the programmatic Enrollment API
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
          fetchData();
        } else {
          const errData = await res.json();
          alert(errData.error || "Failed to enroll staff member.");
        }
      } else {
        // Edit existing user
        const url = `/api/users/${currentUserEdit._id}`;
        const res = await fetch(url, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          setIsUserModalOpen(false);
          fetchData();
        } else {
          alert("Failed to save user properties.");
        }
      }
    } catch (error) {
      console.error("Failed to save user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (!confirm("Are you sure you want to delete this custom team?")) return;

    try {
      const res = await fetch(`/api/teams/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to delete team:", error);
    }
  };

  if (!mounted) return null;

  const isSuperAdmin = currentUser?.roleTier === "super_admin";
  const isAdmin = currentUser?.roleTier === "admin" || isSuperAdmin;
  const isSenior = currentUser?.roleTier === "senior" || isSuperAdmin;

  return (
    <div className="space-y-8 animate-fade-in text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Teams & Access Control</h1>
          <p className="text-sm text-foreground-secondary mt-1">
            {isAdmin
              ? "Design custom teams, map dynamic permissions, and assign staff hierarchy."
              : "Invite new junior reps to your team and manage workflows."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {(isAdmin || isSenior) && (
            <button
              onClick={() => handleOpenUserModal(null, true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-all active:scale-95 cursor-pointer"
            >
              <UserPlus size={16} />
              <span>Enroll Staff</span>
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => handleOpenTeamModal()}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface hover:bg-surface-hover border border-border rounded-xl text-sm font-semibold transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={16} />
              <span>Create Team</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
          <p className="text-sm text-foreground-secondary">Syncing dynamic roles...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Teams Grid (Admin View) */}
          <div className="xl:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <Shield className="text-accent w-5 h-5" />
              <h2 className="text-lg font-bold">Dynamic Teams & Permissions</h2>
            </div>
            
            {teams.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 bg-surface border border-border border-dashed rounded-2xl text-center space-y-4 py-12">
                <div className="p-4 bg-accent-muted/15 text-accent rounded-full">
                  <Shield size={32} className="animate-pulse" />
                </div>
                <div className="max-w-xs space-y-1">
                  <h3 className="font-bold text-base text-foreground">No Teams Found</h3>
                  <p className="text-xs text-foreground-secondary leading-relaxed">
                    Create functional divisions (like Sales or Service) to manage dynamic permissions and delegate leads.
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleOpenTeamModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-md shadow-accent/10"
                  >
                    <Plus size={14} />
                    <span>Create Your First Team</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.map((team) => (
                  <div
                    key={team._id}
                    className="bg-surface border border-border rounded-2xl p-5 space-y-4 hover:border-border-hover transition-all group card-hover"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-base">{team.name}</h3>
                        <p className="text-xs text-foreground-secondary mt-1">{team.description || "No description"}</p>
                      </div>
                      {isAdmin && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenTeamModal(team)}
                            className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-active transition-colors"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteTeam(team._id)}
                            className="p-1.5 rounded-lg text-foreground-muted hover:text-danger hover:bg-danger-muted transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-border pt-3 grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground-secondary">Leads</span>
                        <span className="font-semibold text-accent uppercase text-[10px] tracking-widest">{team.permissions.leads}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-foreground-secondary">Customers</span>
                        <span className="font-semibold text-accent uppercase text-[10px] tracking-widest">{team.permissions.customers}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-foreground-secondary">Invoices</span>
                        <span className="font-semibold text-accent uppercase text-[10px] tracking-widest">{team.permissions.invoices}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-foreground-secondary">Tickets</span>
                        <span className="font-semibold text-accent uppercase text-[10px] tracking-widest">{team.permissions.tickets}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Assignments */}
          <div className="bg-surface border border-border rounded-2xl p-5 space-y-6 h-fit">
            <div className="flex items-center gap-2">
              <Users className="text-accent w-5 h-5" />
              <h2 className="text-lg font-bold">Staff Role Directory</h2>
            </div>

            {users.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 border border-border border-dashed rounded-xl text-center space-y-4 py-12">
                <div className="p-4 bg-accent-muted/15 text-accent rounded-full">
                  <Users size={32} />
                </div>
                <div className="max-w-xs space-y-1">
                  <h3 className="font-bold text-sm text-foreground">Directory Empty</h3>
                  <p className="text-[11px] text-foreground-secondary leading-relaxed">
                    No active staff members registered. Invite seniors or juniors to manage workflows.
                  </p>
                </div>
                {(isAdmin || isSenior) && (
                  <button
                    onClick={() => handleOpenUserModal(null, true)}
                    className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-md shadow-accent/10"
                  >
                    <UserPlus size={14} />
                    <span>Enroll Staff Member</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((u) => (
                  <div
                    key={u._id}
                    className="flex items-center justify-between p-3 bg-background-secondary/30 border border-border rounded-xl hover:border-border-hover transition-all group"
                  >
                    <div>
                      <p className="font-semibold text-sm">{u.firstName} {u.lastName}</p>
                      <p className="text-[10px] text-foreground-secondary mt-0.5">{u.email}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-accent-muted text-accent">
                          {u.roleTier}
                        </span>
                        {u.teamId && (
                          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-surface-active text-foreground-secondary">
                            {u.teamId.name}
                          </span>
                        )}
                      </div>
                    </div>
                    {(isAdmin || (isSenior && u.roleTier === "junior")) && (
                      <button
                        onClick={() => handleOpenUserModal(u)}
                        className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-active transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        <Edit size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dynamic Team Creation / Edit Modal */}
      <Modal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        title={currentTeam?._id ? "Configure Team Details" : "Create Custom Team"}
      >
        <form onSubmit={handleTeamSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Team Name</label>
            <input
              required
              value={currentTeam?.name || ""}
              onChange={(e) => setCurrentTeam({ ...currentTeam, name: e.target.value })}
              className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none"
              placeholder="e.g. Outbound Sales"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Description</label>
            <textarea
              value={currentTeam?.description || ""}
              onChange={(e) => setCurrentTeam({ ...currentTeam, description: e.target.value })}
              className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none h-20 resize-none"
              placeholder="Define this custom team's workflow responsibilities..."
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-foreground-muted uppercase tracking-widest border-b border-border pb-2">Dynamic Module Permissions</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-foreground-secondary mb-1 block">Leads Module</label>
                <select
                  value={currentTeam?.permissions?.leads || "all"}
                  onChange={(e) => setCurrentTeam({
                    ...currentTeam!,
                    permissions: { ...currentTeam!.permissions!, leads: e.target.value as any }
                  })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:border-accent outline-none"
                >
                  <option value="none">No Access (Hidden)</option>
                  <option value="read">Read Only</option>
                  <option value="write">Read & Write</option>
                  <option value="all">All Rights (Full Control)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground-secondary mb-1 block">Customers Module</label>
                <select
                  value={currentTeam?.permissions?.customers || "all"}
                  onChange={(e) => setCurrentTeam({
                    ...currentTeam!,
                    permissions: { ...currentTeam!.permissions!, customers: e.target.value as any }
                  })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:border-accent outline-none"
                >
                  <option value="none">No Access (Hidden)</option>
                  <option value="read">Read Only</option>
                  <option value="write">Read & Write</option>
                  <option value="all">All Rights (Full Control)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground-secondary mb-1 block">Invoices Module</label>
                <select
                  value={currentTeam?.permissions?.invoices || "all"}
                  onChange={(e) => setCurrentTeam({
                    ...currentTeam!,
                    permissions: { ...currentTeam!.permissions!, invoices: e.target.value as any }
                  })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:border-accent outline-none"
                >
                  <option value="none">No Access (Hidden)</option>
                  <option value="read">Read Only</option>
                  <option value="write">Read & Write</option>
                  <option value="all">All Rights (Full Control)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground-secondary mb-1 block">Service Tickets</label>
                <select
                  value={currentTeam?.permissions?.tickets || "all"}
                  onChange={(e) => setCurrentTeam({
                    ...currentTeam!,
                    permissions: { ...currentTeam!.permissions!, tickets: e.target.value as any }
                  })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:border-accent outline-none"
                >
                  <option value="none">No Access (Hidden)</option>
                  <option value="read">Read Only</option>
                  <option value="write">Read & Write</option>
                  <option value="all">All Rights (Full Control)</option>
                </select>
              </div>
            </div>
            
            {!currentTeam?._id && (
              <div className="space-y-4 border-t border-border pt-4">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enrollSenior}
                    onChange={(e) => setEnrollSenior(e.target.checked)}
                    className="rounded border-border text-accent focus:ring-accent"
                  />
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Enroll a Team Senior Manager
                  </span>
                </label>

                {enrollSenior && (
                  <div className="p-4 bg-background-secondary/50 border border-border rounded-2xl space-y-4 animate-fade-in text-left">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">First Name</label>
                        <input
                          required
                          value={seniorForm.firstName}
                          onChange={(e) => setSeniorForm({ ...seniorForm, firstName: e.target.value })}
                          className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none"
                          placeholder="e.g. Robert"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Last Name</label>
                        <input
                          required
                          value={seniorForm.lastName}
                          onChange={(e) => setSeniorForm({ ...seniorForm, lastName: e.target.value })}
                          className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none"
                          placeholder="e.g. Downey"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Email Address</label>
                        <input
                          required
                          type="email"
                          value={seniorForm.email}
                          onChange={(e) => setSeniorForm({ ...seniorForm, email: e.target.value })}
                          className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none"
                          placeholder="robert.d@company.com"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Contact Number (Phone)</label>
                        <input
                          required
                          value={seniorForm.phone}
                          onChange={(e) => setSeniorForm({ ...seniorForm, phone: e.target.value })}
                          className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none"
                          placeholder="e.g. +1 555-0199"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Account Password (set by admin)</label>
                      <input
                        required
                        type="password"
                        value={seniorForm.password}
                        onChange={(e) => setSeniorForm({ ...seniorForm, password: e.target.value })}
                        className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none"
                        placeholder="Minimum 8 characters"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setIsTeamModalOpen(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-foreground-secondary hover:text-foreground hover:bg-surface-hover transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-bold shadow-lg shadow-accent/20 transition-all flex items-center gap-2"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              <span>{currentTeam?._id ? "Update Permissions" : "Save Team"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* User Dynamic Team Assignment & Enrollment Modal */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title={isEnrollMode ? "Enroll New Staff Member" : "Edit Staff Hierarchy & Role Assignment"}
      >
        <form onSubmit={handleUserSubmit} className="space-y-4">
          {isEnrollMode ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">First Name</label>
                  <input
                    required
                    value={currentUserEdit?.firstName || ""}
                    onChange={(e) => setCurrentUserEdit({ ...currentUserEdit, firstName: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Last Name</label>
                  <input
                    required
                    value={currentUserEdit?.lastName || ""}
                    onChange={(e) => setCurrentUserEdit({ ...currentUserEdit, lastName: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none"
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
                    value={currentUserEdit?.email || ""}
                    onChange={(e) => setCurrentUserEdit({ ...currentUserEdit, email: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none"
                    placeholder="john.doe@company.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Contact Number (Phone)</label>
                  <input
                    required
                    value={enrollPhone}
                    onChange={(e) => setEnrollPhone(e.target.value)}
                    className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none"
                    placeholder="e.g. +1 555-0199"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Account Password</label>
                <input
                  required
                  type="password"
                  value={enrollPassword}
                  onChange={(e) => setEnrollPassword(e.target.value)}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none"
                  placeholder="Minimum 8 characters"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Staff Member</label>
                <input
                  disabled
                  value={`${currentUserEdit?.firstName || ""} ${currentUserEdit?.lastName || ""}`}
                  className="w-full bg-background-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground-muted outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Contact Number (Phone)</label>
                <input
                  value={enrollPhone}
                  onChange={(e) => setEnrollPhone(e.target.value)}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none"
                  placeholder="e.g. +1 555-0199"
                />
              </div>
            </>
          )}

          {isAdmin ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Access Tier</label>
                  <select
                    value={currentUserEdit?.roleTier || "junior"}
                    onChange={(e) => setCurrentUserEdit({ ...currentUserEdit, roleTier: e.target.value as any })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none"
                  >
                    <option value="junior">Junior (Access to assigned items)</option>
                    <option value="senior">Senior (Team Manager/Lead)</option>
                    <option value="admin">Administrator (Full Access)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Custom Team</label>
                  <select
                    value={(currentUserEdit?.teamId as any)?._id || (currentUserEdit?.teamId as any) || ""}
                    onChange={(e) => setCurrentUserEdit({ ...currentUserEdit, teamId: e.target.value as any })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none"
                  >
                    <option value="">No Team (Standard System Defaults)</option>
                    {teams.map((t) => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-1.5 block">Direct Senior Manager</label>
                <select
                  value={(currentUserEdit?.parentManager as any)?._id || (currentUserEdit?.parentManager as any) || ""}
                  onChange={(e) => setCurrentUserEdit({ ...currentUserEdit, parentManager: e.target.value as any })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none"
                >
                  <option value="">None (Independent Rep)</option>
                  {users.filter(u => u.roleTier === "senior" && u._id !== currentUserEdit?._id).map((mgr) => (
                    <option key={mgr._id} value={mgr._id}>{mgr.firstName} {mgr.lastName} (Senior)</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            isEnrollMode && (
              <div className="p-3.5 bg-accent-muted/10 border border-accent/15 rounded-xl">
                <p className="text-xs font-semibold text-foreground-secondary leading-relaxed">
                  💡 Enrolling a new <strong className="text-accent">Junior Representative</strong> under your direct wing. 
                  They will automatically inherit your team assignment ({teams.find(t => t._id === currentUser?.teamId?.toString())?.name || "assigned team"}) and report directly to you.
                </p>
              </div>
            )
          )}

          {/* Custom permissions override fields for Juniors & Seniors */}
          {(currentUserEdit?.roleTier === "junior" || currentUserEdit?.roleTier === "senior") && (
            <div className="space-y-4 border-t border-border pt-4 text-left">
              <h4 className="text-xs font-bold text-foreground-muted uppercase tracking-widest pb-1">Individual Module Permissions</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground-secondary mb-1 block">Leads Module</label>
                  <select
                    value={(currentUserEdit as any).permissions?.leads || ""}
                    onChange={(e) => setCurrentUserEdit({
                      ...currentUserEdit!,
                      permissions: { ...((currentUserEdit as any).permissions || {}), leads: e.target.value as any }
                    })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:border-accent outline-none"
                  >
                    <option value="">Inherit Team Default</option>
                    <option value="none">No Access (Hidden)</option>
                    <option value="read">Read Only</option>
                    <option value="write">Read & Write</option>
                    <option value="all">All Rights (Full Control)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground-secondary mb-1 block">Customers Module</label>
                  <select
                    value={(currentUserEdit as any).permissions?.customers || ""}
                    onChange={(e) => setCurrentUserEdit({
                      ...currentUserEdit!,
                      permissions: { ...((currentUserEdit as any).permissions || {}), customers: e.target.value as any }
                    })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:border-accent outline-none"
                  >
                    <option value="">Inherit Team Default</option>
                    <option value="none">No Access (Hidden)</option>
                    <option value="read">Read Only</option>
                    <option value="write">Read & Write</option>
                    <option value="all">All Rights (Full Control)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground-secondary mb-1 block">Invoices Module</label>
                  <select
                    value={(currentUserEdit as any).permissions?.invoices || ""}
                    onChange={(e) => setCurrentUserEdit({
                      ...currentUserEdit!,
                      permissions: { ...((currentUserEdit as any).permissions || {}), invoices: e.target.value as any }
                    })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:border-accent outline-none"
                  >
                    <option value="">Inherit Team Default</option>
                    <option value="none">No Access (Hidden)</option>
                    <option value="read">Read Only</option>
                    <option value="write">Read & Write</option>
                    <option value="all">All Rights (Full Control)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground-secondary mb-1 block">Service Tickets</label>
                  <select
                    value={(currentUserEdit as any).permissions?.tickets || ""}
                    onChange={(e) => setCurrentUserEdit({
                      ...currentUserEdit!,
                      permissions: { ...((currentUserEdit as any).permissions || {}), tickets: e.target.value as any }
                    })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:border-accent outline-none"
                  >
                    <option value="">Inherit Team Default</option>
                    <option value="none">No Access (Hidden)</option>
                    <option value="read">Read Only</option>
                    <option value="write">Read & Write</option>
                    <option value="all">All Rights (Full Control)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
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
              <span>{isEnrollMode ? "Enroll Account" : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
