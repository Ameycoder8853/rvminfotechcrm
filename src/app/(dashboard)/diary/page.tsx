"use client";

import { Plus, ChevronLeft, ChevronRight, Clock, MapPin, Users } from "lucide-react";
import { useState } from "react";

const diaryEntries = [
  { id: "1", title: "Client meeting — TechVision", type: "meeting", time: "10:00 AM - 11:30 AM", location: "TechVision Office, Mumbai", completed: false, color: "#6366f1" },
  { id: "2", title: "Follow-up call — Sunrise", type: "task", time: "02:00 PM", location: "", completed: false, color: "#3b82f6" },
  { id: "3", title: "Site visit — CloudNet", type: "visit", time: "04:00 PM - 05:30 PM", location: "CloudNet Bangalore HQ", completed: false, color: "#22c55e" },
  { id: "4", title: "Quote preparation — Metro", type: "task", time: "11:00 AM", location: "", completed: true, color: "#3b82f6" },
  { id: "5", title: "AMC renewal reminder", type: "reminder", time: "09:00 AM", location: "", completed: false, color: "#f59e0b" },
];

const typeColors: Record<string, string> = { meeting: "#6366f1", task: "#3b82f6", visit: "#22c55e", reminder: "#f59e0b" };
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dates = [21, 22, 23, 24, 25, 26, 27];

export default function DiaryPage() {
  const [selectedDay, setSelectedDay] = useState(3); // Thursday (24th)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Diary & Planner</h1>
          <p className="text-sm text-[var(--foreground-secondary)] mt-1">Schedule tasks, meetings, and reminders</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-[var(--accent)]/20">
          <Plus size={18} /><span>New Entry</span>
        </button>
      </div>

      {/* Week Navigation */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <button className="p-2 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors">
            <ChevronLeft size={18} />
          </button>
          <h3 className="text-sm font-semibold text-[var(--foreground)]">April 2026</h3>
          <button className="p-2 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, i) => (
            <button
              key={day}
              onClick={() => setSelectedDay(i)}
              className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs transition-all ${
                i === selectedDay
                  ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/30"
                  : "text-[var(--foreground-secondary)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              <span className="font-medium">{day}</span>
              <span className={`text-lg font-bold ${i === selectedDay ? "text-white" : "text-[var(--foreground)]"}`}>
                {dates[i]}
              </span>
              {i === selectedDay && <span className="w-1 h-1 rounded-full bg-white" />}
            </button>
          ))}
        </div>
      </div>

      {/* Day Schedule */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">
          {days[selectedDay]}, April {dates[selectedDay]} — {diaryEntries.length} entries
        </h3>
        {diaryEntries.map((entry) => (
          <div
            key={entry.id}
            className={`bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--border-hover)] transition-all flex gap-4 ${entry.completed ? "opacity-60" : ""}`}
          >
            <div className="w-1 rounded-full shrink-0" style={{ backgroundColor: typeColors[entry.type] }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className={`font-medium text-[var(--foreground)] ${entry.completed ? "line-through" : ""}`}>
                  {entry.title}
                </p>
                <span className="text-[10px] px-2 py-0.5 rounded-full capitalize whitespace-nowrap" style={{ backgroundColor: `${typeColors[entry.type]}20`, color: typeColors[entry.type] }}>
                  {entry.type}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-[var(--foreground-muted)]">
                <div className="flex items-center gap-1"><Clock size={12} />{entry.time}</div>
                {entry.location && <div className="flex items-center gap-1 truncate"><MapPin size={12} />{entry.location}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
