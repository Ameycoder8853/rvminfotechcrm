"use client";

import { useState, useEffect, useCallback } from "react";
import StatusBadge from "@/components/shared/status-badge";
import { MapPin, Clock, LogIn, LogOut, Loader2, Trash2, ShieldAlert } from "lucide-react";

interface AttendanceRecord {
  _id: string;
  user?: { _id: string; firstName: string; lastName: string };
  type: "check_in" | "check_out";
  timestamp: string;
  address: string;
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAction, setLastAction] = useState<"check_in" | "check_out" | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/attendance");
      const data = await res.json();
      if (data.success) {
        setRecords(data.data);
        // Find last record for current user to determine button state
        // (This assumes the API returns records for the logged-in user if not admin, 
        // or we filter them if it's admin viewing their own)
        if (data.data.length > 0) {
          setLastAction(data.data[0].type);
        }
      }
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [fetchData]);

  const handleAttendance = async () => {
    try {
      setIsProcessing(true);
      
      // Get Geolocation
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
      }

      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const type = lastAction === "check_in" ? "check_out" : "check_in";

        // Optional: Reverse geocoding could be done here or on backend
        // For now we'll send coordinates
        const res = await fetch("/api/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            coordinates: { lat: latitude, lng: longitude },
            address: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`, // Placeholder for real address
          }),
        });

        if (res.ok) {
          fetchData();
        }
      }, (error) => {
        alert(`Error getting location: ${error.message}`);
      });

    } catch (error) {
      console.error("Attendance action failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this attendance record?")) return;
    try {
      const res = await fetch(`/api/attendance/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to delete record:", error);
    }
  };

  if (!mounted) return null;

  // Real-time "Active" agents (checked in today and haven't checked out)
  const activeAgents = records.filter(r => {
    const isToday = new Date(r.timestamp).toDateString() === new Date().toDateString();
    return isToday && r.type === "check_in";
  }).filter((record, index, self) => 
    index === self.findIndex((t) => t.user?._id === record.user?._id)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Attendance</h1>
          <p className="text-sm text-[var(--foreground-secondary)] mt-1">Real-time GPS-verified staff tracking</p>
        </div>
        <button
          onClick={handleAttendance}
          disabled={isProcessing}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 ${
            lastAction === "check_in"
              ? "bg-[var(--danger)] hover:bg-[var(--danger-hover)] text-white shadow-[var(--danger)]/20"
              : "bg-[var(--success)] hover:bg-[var(--success-hover)] text-white shadow-[var(--success)]/20"
          }`}
        >
          {isProcessing ? <Loader2 size={18} className="animate-spin" /> : (lastAction === "check_in" ? <LogOut size={18} /> : <LogIn size={18} />)}
          <span>{lastAction === "check_in" ? "Check Out Now" : "Check In Now"}</span>
        </button>
      </div>

      {/* Active Field Agents Dashboard */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-[var(--success-muted)] text-[var(--success)]">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--foreground)]">Active Field Staff</h3>
            <p className="text-xs text-[var(--foreground-muted)]">{activeAgents.length} agents currently on field</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeAgents.map((agent) => (
            <div key={agent._id} className="flex items-center gap-3 bg-[var(--background-secondary)] rounded-xl p-4 border border-[var(--border)] hover:border-[var(--success)] transition-colors group">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-muted)] flex items-center justify-center text-[var(--accent)] font-bold">
                  {agent.user?.firstName?.[0]}{agent.user?.lastName?.[0]}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[var(--success)] border-2 border-[var(--background-secondary)] animate-pulse" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[var(--foreground)] truncate">{agent.user?.firstName} {agent.user?.lastName}</p>
                <div className="flex items-center gap-1 text-[10px] text-[var(--foreground-muted)] font-medium">
                  <MapPin size={10} className="text-[var(--danger)]" />
                  <span className="truncate">{agent.address}</span>
                </div>
              </div>
            </div>
          ))}
          {activeAgents.length === 0 && (
            <div className="col-span-full py-4 text-center text-[var(--foreground-muted)] text-sm italic">No agents currently checked in.</div>
          )}
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--background-secondary)]/30">
          <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">Attendance Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--background-secondary)]/10">
                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Staff Member</th>
                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Action</th>
                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Timestamp</th>
                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)] hidden md:table-cell">Location</th>
                <th className="text-right px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center">
                    <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin mx-auto mb-2" />
                    <span className="text-xs text-[var(--foreground-muted)] font-medium uppercase tracking-widest">Loading history...</span>
                  </td>
                </tr>
              ) : records.map((entry) => (
                <tr key={entry._id} className="hover:bg-[var(--surface-hover)] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--surface-active)] flex items-center justify-center text-[var(--foreground-secondary)] text-[10px] font-bold">
                        {entry.user?.firstName?.[0]}
                      </div>
                      <span className="font-bold text-[var(--foreground)]">{entry.user?.firstName} {entry.user?.lastName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={entry.type} /></td>
                  <td className="px-6 py-4 text-[var(--foreground-secondary)] font-medium">
                    <div className="flex items-center gap-2"><Clock size={14} className="text-[var(--accent)]" />{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td className="px-6 py-4 text-[var(--foreground-muted)] text-xs hidden md:table-cell">
                    <div className="flex items-center gap-1.5"><MapPin size={14} className="text-[var(--danger)]" />{entry.address}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(entry._id)} className="p-2 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-muted)] transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
