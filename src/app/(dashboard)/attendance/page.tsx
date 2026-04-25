"use client";

import StatusBadge from "@/components/shared/status-badge";
import { MapPin, Clock, LogIn, LogOut } from "lucide-react";
import { useState } from "react";

const attendanceLog = [
  { id: "1", user: "Amit Patel", type: "check_in", time: "09:12 AM", date: "24 Apr 2026", location: "Office — Ahmedabad", lat: 23.0225, lng: 72.5714 },
  { id: "2", user: "Priya Sharma", type: "check_in", time: "09:30 AM", date: "24 Apr 2026", location: "Client Site — TechVision, Mumbai", lat: 19.076, lng: 72.8777 },
  { id: "3", user: "Rajesh Kumar", type: "check_out", time: "06:45 PM", date: "23 Apr 2026", location: "Office — Delhi", lat: 28.6139, lng: 77.209 },
  { id: "4", user: "Vikram Singh", type: "check_in", time: "10:05 AM", date: "24 Apr 2026", location: "Field Visit — Pune", lat: 18.5204, lng: 73.8567 },
  { id: "5", user: "Sneha Patel", type: "check_out", time: "05:30 PM", date: "23 Apr 2026", location: "Office — Bangalore", lat: 12.9716, lng: 77.5946 },
  { id: "6", user: "Rahul Verma", type: "check_in", time: "08:45 AM", date: "24 Apr 2026", location: "Installation Site — Hyderabad", lat: 17.385, lng: 78.4867 },
];

const activeAgents = attendanceLog.filter((a) => a.type === "check_in" && a.date === "24 Apr 2026");

export default function AttendancePage() {
  const [checkedIn, setCheckedIn] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Attendance</h1>
          <p className="text-sm text-[var(--foreground-secondary)] mt-1">GPS-based check-in/check-out tracking</p>
        </div>
        <button
          onClick={() => setCheckedIn(!checkedIn)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg ${
            checkedIn
              ? "bg-[var(--danger)] hover:bg-red-600 text-white shadow-red-500/20"
              : "bg-[var(--success)] hover:bg-green-600 text-white shadow-green-500/20"
          }`}
        >
          {checkedIn ? <LogOut size={18} /> : <LogIn size={18} />}
          <span>{checkedIn ? "Check Out" : "Check In"}</span>
        </button>
      </div>

      {/* Active Field Agents */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">Active Field Agents</h3>
        <p className="text-xs text-[var(--foreground-muted)] mb-4">{activeAgents.length} agents currently checked in</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeAgents.map((agent) => (
            <div key={agent.id} className="flex items-center gap-3 bg-[var(--background-secondary)] rounded-lg p-3 border border-[var(--border)]">
              <div className="w-9 h-9 rounded-full bg-[var(--success-muted)] flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--success)] animate-pulse" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)] truncate">{agent.user}</p>
                <div className="flex items-center gap-1 text-[10px] text-[var(--foreground-muted)]">
                  <MapPin size={10} />
                  <span className="truncate">{agent.location}</span>
                </div>
              </div>
              <span className="text-[10px] text-[var(--foreground-muted)] ml-auto shrink-0">{agent.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance Log */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Attendance Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Employee</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">Time</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)] hidden md:table-cell">Location</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)] hidden lg:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {attendanceLog.map((entry) => (
                <tr key={entry.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)] transition-colors">
                  <td className="px-4 py-3 font-medium text-[var(--foreground)]">{entry.user}</td>
                  <td className="px-4 py-3"><StatusBadge status={entry.type} /></td>
                  <td className="px-4 py-3 text-[var(--foreground-secondary)]">
                    <div className="flex items-center gap-1.5"><Clock size={13} />{entry.time}</div>
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground-muted)] text-xs hidden md:table-cell">
                    <div className="flex items-center gap-1.5"><MapPin size={13} />{entry.location}</div>
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground-muted)] text-xs hidden lg:table-cell">{entry.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
