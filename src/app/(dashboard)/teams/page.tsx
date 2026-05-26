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
  roleTier: "admin" | "senior" | "junior";
  teamId?: Team;
  parentManager?: { _id: string; firstName: string; lastName: string };
  isActive: boolean;
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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [teamsRes, usersRes] = await Promise.all([
        fetch("/api/teams"),
        fetch("/api/users"),
      ]);

      const teamsData = await teamsRes.json();
      const usersData = await usersRes.json();

      if (teamsData.success) setTeams(teamsData.data);
      if (usersData.success) {
        setUsers(usersData.data);
        // Find currently logged-in user (simulate or look for matching session user)
        // For simplicity, we can treat the first admin or the logged-in user context
        // In full production, this is loaded from `/api/users/me` or auth session
        const adminUser = usersData.data.find((u: any) => u.roleTier === "admin") || usersData.data[0];
        setCurrentUser(adminUser || null);
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
    setIsTeamModalOpen(true);
  };

  const handleOpenUserModal = (user: Partial<UserProfile> | null = null) => {
    setCurrentUserEdit(
      user || {
        firstName: "",
        lastName: "",
        email: "",
        roleTier: "junior",
        teamId: undefined,
        parentManager: undefined,
      }
    );
    setIsUserModalOpen(true);
  };

  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam) return;

    try {
      setIsSubmitting(true);
      const url = currentTeam._id ? `/api/teams/${currentTeam._id}` : "/api/teams";
      const method = currentTeam._id ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentTeam),
      });

      if (res.ok) {
        setIsTeamModalOpen(false);
        fetchData();
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
      const url = `/api/users/${currentUserEdit._id}`; // Update user properties
      
      const payload = {
        ...currentUserEdit,
        teamId: (currentUserEdit.teamId as any)?._id || currentUserEdit.teamId || undefined,
        parentManager: (currentUserEdit.parentManager as any)?._id || currentUserEdit.parentManager || undefined,
      };

      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsUserModalOpen(false);
        fetchData();
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

  const isAdmin = currentUser?.roleTier === "admin";
  const isSenior = currentUser?.roleTier === "senior";

  return (
    <div className="space-y-8 animate-fade-in text-[var(--foreground)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Teams & Access Control</h1>
          <p className="text-sm text-[var(--foreground-secondary)] mt-1">
            {isAdmin
              ? "Design custom teams, map dynamic permissions, and assign staff hierarchy."
              : "Invite new junior reps to your team and manage workflows."}
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenTeamModal()}
              className="flex items-center gap-2 px-4 py-2.5 bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl text-sm font-semibold transition-all active:scale-95"
            >
              <Plus size={16} />
              <span>Create Team</span>
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin mb-4" />
          <p className="text-sm text-[var(--foreground-secondary)]">Syncing dynamic roles...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Teams Grid (Admin View) */}
          <div className="xl:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <Shield className="text-[var(--accent)] w-5 h-5" />
              <h2 className="text-lg font-bold">Dynamic Teams & Permissions</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.map((team) => (
                <div
                  key={team._id}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 space-y-4 hover:border-[var(--border-hover)] transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-base">{team.name}</h3>
                      <p className="text-xs text-[var(--foreground-secondary)] mt-1">{team.description || "No description"}</p>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenTeamModal(team)}
                          className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-active)] transition-colors"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteTeam(team._id)}
                          className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-muted)] transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-[var(--border)] pt-3 grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--foreground-secondary)]">Leads</span>
                      <span className="font-semibold text-[var(--accent)] uppercase text-[10px] tracking-widest">{team.permissions.leads}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--foreground-secondary)]">Customers</span>
                      <span className="font-semibold text-[var(--accent)] uppercase text-[10px] tracking-widest">{team.permissions.customers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--foreground-secondary)]">Invoices</span>
                      <span className="font-semibold text-[var(--accent)] uppercase text-[10px] tracking-widest">{team.permissions.invoices}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--foreground-secondary)]">Tickets</span>
                      <span className="font-semibold text-[var(--accent)] uppercase text-[10px] tracking-widest">{team.permissions.tickets}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Assignments */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 space-y-6 h-fit">
            <div className="flex items-center gap-2">
              <Users className="text-[var(--accent)] w-5 h-5" />
              <h2 className="text-lg font-bold">Staff Role Directory</h2>
            </div>

            <div className="space-y-4">
              {users.map((u) => (
                <div
                  key={u._id}
                  className="flex items-center justify-between p-3 bg-[var(--background-secondary)]/30 border border-[var(--border)] rounded-xl hover:border-[var(--border-hover)] transition-all group"
                >
                  <div>
                    <p className="font-semibold text-sm">{u.firstName} {u.lastName}</p>
                    <p className="text-[10px] text-[var(--foreground-secondary)] mt-0.5">{u.email}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[var(--accent-muted)] text-[var(--accent)]">
                        {u.roleTier}
                      </span>
                      {u.teamId && (
                        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-[var(--surface-active)] text-[var(--foreground-secondary)]">
                          {u.teamId.name}
                        </span>
                      )}
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleOpenUserModal(u)}
                      className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-active)] transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Edit size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
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
            <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Team Name</label>
            <input
              required
              value={currentTeam?.name || ""}
              onChange={(e) => setCurrentTeam({ ...currentTeam, name: e.target.value })}
              className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              placeholder="e.g. Outbound Sales"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Description</label>
            <textarea
              value={currentTeam?.description || ""}
              onChange={(e) => setCurrentTeam({ ...currentTeam, description: e.target.value })}
              className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none h-20 resize-none"
              placeholder="Define this custom team's workflow responsibilities..."
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-widest border-b border-[var(--border)] pb-2">Dynamic Module Permissions</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[var(--foreground-secondary)] mb-1 block">Leads Module</label>
                <select
                  value={currentTeam?.permissions?.leads || "all"}
                  onChange={(e) => setCurrentTeam({
                    ...currentTeam!,
                    permissions: { ...currentTeam!.permissions!, leads: e.target.value as any }
                  })}
                  className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
                >
                  <option value="none">No Access (Hidden)</option>
                  <option value="read">Read Only</option>
                  <option value="write">Read & Write</option>
                  <option value="all">All Rights (Full Control)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--foreground-secondary)] mb-1 block">Customers Module</label>
                <select
                  value={currentTeam?.permissions?.customers || "all"}
                  onChange={(e) => setCurrentTeam({
                    ...currentTeam!,
                    permissions: { ...currentTeam!.permissions!, customers: e.target.value as any }
                  })}
                  className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
                >
                  <option value="none">No Access (Hidden)</option>
                  <option value="read">Read Only</option>
                  <option value="write">Read & Write</option>
                  <option value="all">All Rights (Full Control)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--foreground-secondary)] mb-1 block">Invoices Module</label>
                <select
                  value={currentTeam?.permissions?.invoices || "all"}
                  onChange={(e) => setCurrentTeam({
                    ...currentTeam!,
                    permissions: { ...currentTeam!.permissions!, invoices: e.target.value as any }
                  })}
                  className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
                >
                  <option value="none">No Access (Hidden)</option>
                  <option value="read">Read Only</option>
                  <option value="write">Read & Write</option>
                  <option value="all">All Rights (Full Control)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--foreground-secondary)] mb-1 block">Service Tickets</label>
                <select
                  value={currentTeam?.permissions?.tickets || "all"}
                  onChange={(e) => setCurrentTeam({
                    ...currentTeam!,
                    permissions: { ...currentTeam!.permissions!, tickets: e.target.value as any }
                  })}
                  className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
                >
                  <option value="none">No Access (Hidden)</option>
                  <option value="read">Read Only</option>
                  <option value="write">Read & Write</option>
                  <option value="all">All Rights (Full Control)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setIsTeamModalOpen(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-bold shadow-lg shadow-[var(--accent)]/20 transition-all flex items-center gap-2"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              <span>{currentTeam?._id ? "Update Permissions" : "Save Team"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* User Dynamic Team Assignment Modal (Admin View) */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title="Edit Staff Hierarchy & Role Assignment"
      >
        <form onSubmit={handleUserSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Staff Member</label>
            <input
              disabled
              value={`${currentUserEdit?.firstName || ""} ${currentUserEdit?.lastName || ""}`}
              className="w-full bg-[var(--background-secondary)]/50 border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground-muted)] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Access Tier</label>
              <select
                value={currentUserEdit?.roleTier || "junior"}
                onChange={(e) => setCurrentUserEdit({ ...currentUserEdit, roleTier: e.target.value as any })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              >
                <option value="junior">Junior (Access to assigned items)</option>
                <option value="senior">Senior (Team Manager/Lead)</option>
                <option value="admin">Administrator (Full Access)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Custom Team</label>
              <select
                value={(currentUserEdit?.teamId as any)?._id || (currentUserEdit?.teamId as any) || ""}
                onChange={(e) => setCurrentUserEdit({ ...currentUserEdit, teamId: e.target.value as any })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              >
                <option value="">No Team (Standard System Defaults)</option>
                {teams.map((t) => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Direct Senior Manager</label>
            <select
              value={(currentUserEdit?.parentManager as any)?._id || (currentUserEdit?.parentManager as any) || ""}
              onChange={(e) => setCurrentUserEdit({ ...currentUserEdit, parentManager: e.target.value as any })}
              className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
            >
              <option value="">None (Independent Rep)</option>
              {users.filter(u => u.roleTier === "senior" && u._id !== currentUserEdit?._id).map((mgr) => (
                <option key={mgr._id} value={mgr._id}>{mgr.firstName} {mgr.lastName} (Senior)</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsUserModalOpen(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-bold shadow-lg shadow-[var(--accent)]/20 transition-all flex items-center gap-2"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
