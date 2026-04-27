"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, ChevronLeft, ChevronRight, Clock, MapPin, Loader2, CheckCircle2, Circle, Edit, Trash2 } from "lucide-react";
import Modal from "@/components/shared/modal";

interface DiaryEntry {
  _id: string;
  title: string;
  type: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  isCompleted: boolean;
  customer?: { _id: string; firstName: string; lastName: string; company: string };
}

const typeColors: Record<string, string> = { 
  meeting: "#6366f1", 
  task: "#3b82f6", 
  visit: "#22c55e", 
  reminder: "#f59e0b" 
};

export default function DiaryPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<DiaryEntry> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const dateStr = selectedDate.toISOString().split("T")[0];
      const [diaryRes, customersRes] = await Promise.all([
        fetch(`/api/diary?date=${dateStr}`),
        fetch("/api/contacts"),
      ]);
      
      const diaryData = await diaryRes.json();
      const customersData = await customersRes.json();

      if (diaryData.success) setEntries(diaryData.data);
      if (customersData.success) setCustomers(customersData.data);
    } catch (error) {
      console.error("Failed to fetch diary data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [fetchData]);

  const handleToggleComplete = async (entry: DiaryEntry) => {
    try {
      const res = await fetch(`/api/diary/${entry._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: !entry.isCompleted }),
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to toggle completion:", error);
    }
  };

  const handleOpenModal = (entry: Partial<DiaryEntry> | null = null) => {
    setCurrentEntry(entry || {
      title: "",
      type: "task",
      date: selectedDate.toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "10:00",
      location: "",
      isCompleted: false,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEntry) return;

    try {
      setIsSubmitting(true);
      const url = currentEntry._id ? `/api/diary/${currentEntry._id}` : "/api/diary";
      const method = currentEntry._id ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentEntry),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error("Failed to save entry:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this entry?")) return;
    try {
      const res = await fetch(`/api/diary/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to delete entry:", error);
    }
  };

  if (!mounted) return null;

  // Generate 7 days starting from Monday of current week
  const getWeekDays = () => {
    const days = [];
    const current = new Date(selectedDate);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(current.setDate(diff));

    for (let i = 0; i < 7; i++) {
      days.push(new Date(monday));
      monday.setDate(monday.getDate() + 1);
    }
    return days;
  };

  const weekDays = getWeekDays();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Diary & Planner</h1>
          <p className="text-sm text-[var(--foreground-secondary)] mt-1">Real-time schedule and task management</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-[var(--accent)]/20 active:scale-95"
        >
          <Plus size={18} /><span>New Entry</span>
        </button>
      </div>

      {/* Week Navigation */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 7);
              setSelectedDate(d);
            }}
            className="p-2 rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-all border border-[var(--border)]"
          >
            <ChevronLeft size={20} />
          </button>
          <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-widest">
            {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <button 
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 7);
              setSelectedDate(d);
            }}
            className="p-2 rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-all border border-[var(--border)]"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-3">
          {weekDays.map((day) => {
            const isSelected = day.toDateString() === selectedDate.toDateString();
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`flex flex-col items-center gap-1.5 py-4 rounded-2xl transition-all relative ${
                  isSelected
                    ? "bg-[var(--accent)] text-white shadow-xl shadow-[var(--accent)]/30 scale-105 z-10"
                    : "text-[var(--foreground-secondary)] hover:bg-[var(--surface-hover)] border border-transparent hover:border-[var(--border)]"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                  {day.toLocaleDateString('default', { weekday: 'short' })}
                </span>
                <span className="text-xl font-bold">
                  {day.getDate()}
                </span>
                {isToday && !isSelected && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Schedule */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">
            {selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>
          <span className="text-xs font-bold text-[var(--foreground-muted)] bg-[var(--surface)] border border-[var(--border)] px-3 py-1 rounded-full">
            {entries.length} Entries
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin mb-4" />
            <p className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-widest">Syncing Schedule...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry._id}
                className={`group bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 hover:border-[var(--accent)] transition-all flex gap-4 shadow-sm relative overflow-hidden ${entry.isCompleted ? "opacity-60" : ""}`}
              >
                <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: typeColors[entry.type] }} />
                <button 
                  onClick={() => handleToggleComplete(entry)}
                  className={`mt-1 shrink-0 transition-colors ${entry.isCompleted ? "text-[var(--success)]" : "text-[var(--foreground-muted)] group-hover:text-[var(--accent)]"}`}
                >
                  {entry.isCompleted ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className={`font-bold text-base text-[var(--foreground)] ${entry.isCompleted ? "line-through decoration-2" : ""}`}>
                      {entry.title}
                    </h4>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(entry)} className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-muted)]"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(entry._id)} className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-muted)]"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold uppercase tracking-wider text-[var(--foreground-secondary)]">
                    <div className="flex items-center gap-2"><Clock size={14} className="text-[var(--accent)]" />{entry.startTime} - {entry.endTime}</div>
                    {entry.location && <div className="flex items-center gap-2 max-w-[200px] truncate"><MapPin size={14} className="text-[var(--danger)]" />{entry.location}</div>}
                    <div className="px-3 py-1 rounded-full text-[9px]" style={{ backgroundColor: `${typeColors[entry.type]}20`, color: typeColors[entry.type] }}>
                      {entry.type}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {entries.length === 0 && (
              <div className="py-20 text-center bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-2xl flex flex-col items-center">
                <p className="text-[var(--foreground-muted)] font-medium italic mb-4">Your schedule is clear for today.</p>
                <button onClick={() => handleOpenModal()} className="text-[var(--accent)] text-xs font-bold uppercase tracking-widest hover:underline">+ Add Entry</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Diary Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentEntry?._id ? "Edit Entry" : "Add New Event"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Title</label>
            <input 
              required
              value={currentEntry?.title || ""}
              onChange={(e) => setCurrentEntry({ ...currentEntry, title: e.target.value })}
              className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              placeholder="Meeting with..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Type</label>
              <select 
                value={currentEntry?.type || "task"}
                onChange={(e) => setCurrentEntry({ ...currentEntry, type: e.target.value })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              >
                <option value="task">Task</option>
                <option value="meeting">Meeting</option>
                <option value="visit">Site Visit</option>
                <option value="reminder">Reminder</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Date</label>
              <input 
                type="date"
                required
                value={currentEntry?.date ? new Date(currentEntry.date).toISOString().split("T")[0] : ""}
                onChange={(e) => setCurrentEntry({ ...currentEntry, date: e.target.value })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Start Time</label>
              <input 
                type="time"
                value={currentEntry?.startTime || ""}
                onChange={(e) => setCurrentEntry({ ...currentEntry, startTime: e.target.value })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">End Time</label>
              <input 
                type="time"
                value={currentEntry?.endTime || ""}
                onChange={(e) => setCurrentEntry({ ...currentEntry, endTime: e.target.value })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Location (Optional)</label>
            <input 
              value={currentEntry?.location || ""}
              onChange={(e) => setCurrentEntry({ ...currentEntry, location: e.target.value })}
              className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              placeholder="e.g. Ahmedabad Office"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-all">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-bold shadow-lg shadow-[var(--accent)]/20 transition-all flex items-center gap-2">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              <span>{currentEntry?._id ? "Update Event" : "Create Event"}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
