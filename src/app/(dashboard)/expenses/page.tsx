"use client";

import { useState, useEffect, useCallback } from "react";
import StatusBadge from "@/components/shared/status-badge";
import { Plus, Search, Receipt, Check, X, Loader2, Trash2 } from "lucide-react";
import Modal from "@/components/shared/modal";

interface Expense {
  _id: string;
  user: { _id: string; firstName: string; lastName: string };
  category: string;
  amount: number;
  description: string;
  date: string;
  status: string;
}

const categoryIcons: Record<string, string> = { 
  travel: "🚗", 
  food: "🍽️", 
  accommodation: "🏨", 
  supplies: "📦", 
  other: "📋" 
};

export default function ExpensesPage() {
  const [search, setSearch] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Partial<Expense>>({
    category: "other",
    amount: 0,
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/expenses");
      const data = await res.json();
      if (data.success) {
        setExpenses(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchExpenses();
  }, [fetchExpenses]);

  const filtered = expenses.filter(
    (e) => 
      e.user?.firstName?.toLowerCase().includes(search.toLowerCase()) || 
      e.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentExpense),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchExpenses();
        setCurrentExpense({
          category: "other",
          amount: 0,
          description: "",
          date: new Date().toISOString().split("T")[0],
        });
      }
    } catch (error) {
      console.error("Failed to submit expense:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchExpenses();
      }
    } catch (error) {
      console.error("Failed to update expense status:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this expense claim?")) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (res.ok) fetchExpenses();
    } catch (error) {
      console.error("Failed to delete expense:", error);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Expenses</h1>
          <p className="text-sm text-[var(--foreground-secondary)] mt-1">Track and manage real expense claims</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-[var(--accent)]/20 active:scale-95"
        >
          <Plus size={18} /><span>Submit Expense</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 max-w-sm">
        <Search size={16} className="text-[var(--foreground-muted)]" />
        <input 
          type="text" 
          placeholder="Search expenses..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="bg-transparent border-none outline-none text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] w-full" 
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin mb-4" />
          <p className="text-sm text-[var(--foreground-secondary)]">Loading records...</p>
        </div>
      ) : (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--background-secondary)]/50">
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Employee</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Description</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((exp) => (
                  <tr key={exp._id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="px-4 py-3 font-medium text-[var(--foreground)]">{exp.user?.firstName} {exp.user?.lastName}</td>
                    <td className="px-4 py-3"><span className="text-xs capitalize flex items-center gap-1.5">{categoryIcons[exp.category]} {exp.category}</span></td>
                    <td className="px-4 py-3 text-[var(--foreground-secondary)] max-w-[200px] truncate">{exp.description}</td>
                    <td className="px-4 py-3 font-bold text-[var(--foreground)]">₹{exp.amount.toLocaleString()}</td>
                    <td className="px-4 py-3"><StatusBadge status={exp.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {exp.status === "pending" && (
                          <>
                            <button onClick={() => handleUpdateStatus(exp._id, "approved")} className="p-1.5 rounded-lg text-[var(--success)] hover:bg-[var(--success-muted)] transition-colors" title="Approve"><Check size={16} /></button>
                            <button onClick={() => handleUpdateStatus(exp._id, "rejected")} className="p-1.5 rounded-lg text-[var(--danger)] hover:bg-[var(--danger-muted)] transition-colors" title="Reject"><X size={16} /></button>
                          </>
                        )}
                        <button onClick={() => handleDelete(exp._id)} className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-muted)] transition-colors" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-[var(--foreground-muted)] italic">No expense records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Submit New Expense">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Category</label>
              <select 
                value={currentExpense.category}
                onChange={(e) => setCurrentExpense({ ...currentExpense, category: e.target.value })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              >
                {Object.keys(categoryIcons).map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Amount (₹)</label>
              <input 
                type="number"
                required
                value={currentExpense.amount}
                onChange={(e) => setCurrentExpense({ ...currentExpense, amount: Number(e.target.value) })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Description</label>
            <textarea 
              required
              value={currentExpense.description}
              onChange={(e) => setCurrentExpense({ ...currentExpense, description: e.target.value })}
              className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none h-24 resize-none"
              placeholder="e.g. Travel to client site"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Date</label>
            <input 
              type="date"
              required
              value={currentExpense.date}
              onChange={(e) => setCurrentExpense({ ...currentExpense, date: e.target.value })}
              className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-all">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-bold shadow-lg shadow-[var(--accent)]/20 transition-all flex items-center gap-2">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              <span>Submit Claim</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
