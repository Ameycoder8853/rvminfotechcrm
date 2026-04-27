"use client";

import { useState, useEffect, useCallback } from "react";
import StatusBadge from "@/components/shared/status-badge";
import { Plus, Search, Shield, AlertTriangle, Loader2, Edit, Trash2 } from "lucide-react";
import Modal from "@/components/shared/modal";

interface AMC {
  _id: string;
  contractNumber: string;
  customer?: { _id: string; firstName: string; lastName: string; company: string };
  startDate: string;
  endDate: string;
  status: string;
  services: { description: string; frequency: string }[];
  value: number;
}

export default function AMCPage() {
  const [search, setSearch] = useState("");
  const [amcs, setAmcs] = useState<AMC[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAmc, setCurrentAmc] = useState<Partial<AMC> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [amcsRes, customersRes] = await Promise.all([
        fetch("/api/amc"),
        fetch("/api/contacts"),
      ]);
      
      const amcsData = await amcsRes.json();
      const customersData = await customersRes.json();

      if (amcsData.success) setAmcs(amcsData.data);
      if (customersData.success) setCustomers(customersData.data);
    } catch (error) {
      console.error("Failed to fetch AMC data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [fetchData]);

  const filtered = amcs.filter(
    (a) => 
      a.customer?.company?.toLowerCase().includes(search.toLowerCase()) || 
      a.contractNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const expiringSoonCount = amcs.filter(a => {
    const expiry = new Date(a.endDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
  }).length;

  const handleOpenModal = (amc: Partial<AMC> | null = null) => {
    setCurrentAmc(amc || {
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
      status: "active",
      value: 0,
      services: [{ description: "", frequency: "quarterly" }],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAmc) return;

    try {
      setIsSubmitting(true);
      const url = currentAmc._id ? `/api/amc/${currentAmc._id}` : "/api/amc";
      const method = currentAmc._id ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentAmc),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error("Failed to save AMC:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this AMC record?")) return;
    try {
      const res = await fetch(`/api/amc/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to delete AMC:", error);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">AMC Management</h1>
          <p className="text-sm text-[var(--foreground-secondary)] mt-1">Real Annual Maintenance Contract tracking</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-[var(--accent)]/20 active:scale-95"
        >
          <Plus size={18} /><span>New AMC</span>
        </button>
      </div>

      {expiringSoonCount > 0 && (
        <div className="flex items-center gap-3 bg-[var(--danger-muted)] border border-[var(--danger)]/20 rounded-xl px-4 py-3 shadow-sm animate-pulse-slow">
          <AlertTriangle size={18} className="text-[var(--danger)] shrink-0" />
          <p className="text-sm text-[var(--danger)] font-medium">
            <span className="font-bold">{expiringSoonCount} contract(s)</span> expiring within 30 days. Action recommended.
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 max-w-sm">
        <Search size={16} className="text-[var(--foreground-muted)]" />
        <input 
          type="text" 
          placeholder="Search AMC..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="bg-transparent border-none outline-none text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] w-full" 
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin mb-4" />
          <p className="text-sm text-[var(--foreground-secondary)]">Syncing contracts...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((amc) => (
            <div key={amc._id} className="group bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--accent)] transition-all shadow-sm hover:shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button onClick={() => handleOpenModal(amc)} className="p-1.5 rounded-lg bg-[var(--background)] text-[var(--foreground-muted)] hover:text-[var(--accent)] border border-[var(--border)] shadow-sm"><Edit size={14} /></button>
                <button onClick={() => handleDelete(amc._id)} className="p-1.5 rounded-lg bg-[var(--background)] text-[var(--foreground-muted)] hover:text-[var(--danger)] border border-[var(--border)] shadow-sm"><Trash2 size={14} /></button>
              </div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-[var(--accent)]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground-muted)]">{amc.contractNumber}</span>
                </div>
                <StatusBadge status={amc.status} />
              </div>
              <h3 className="font-bold text-[var(--foreground)] text-lg mb-1 leading-tight">{amc.customer?.company || "No Company"}</h3>
              <p className="text-xs text-[var(--foreground-secondary)] mb-4 font-medium italic">
                {amc.services?.map(s => s.description).join(", ") || "No services specified"}
              </p>
              <div className="space-y-2 border-t border-[var(--border)] pt-4 mt-auto">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] tracking-wider">Annual Value</span>
                  <span className="font-bold text-[var(--foreground)] text-sm">₹{amc.value?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] tracking-wider">Valid Until</span>
                  <span className={`text-xs font-bold ${
                    new Date(amc.endDate).getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000 
                      ? "text-[var(--danger)]" 
                      : "text-[var(--foreground-secondary)]"
                  }`}>
                    {new Date(amc.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-20 text-center bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-xl">
              <p className="text-[var(--foreground-muted)] italic">No AMC records found matching your search.</p>
            </div>
          )}
        </div>
      )}

      {/* AMC Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentAmc?._id ? `Edit AMC ${currentAmc.contractNumber}` : "New AMC Registration"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Customer</label>
            <select 
              required
              value={(currentAmc?.customer as any)?._id || (currentAmc?.customer as any) || ""}
              onChange={(e) => setCurrentAmc({ ...currentAmc, customer: e.target.value as any })}
              className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
            >
              <option value="">Select Customer</option>
              {customers.map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName} ({c.company})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Start Date</label>
              <input 
                type="date"
                required
                value={currentAmc?.startDate ? new Date(currentAmc.startDate).toISOString().split("T")[0] : ""}
                onChange={(e) => setCurrentAmc({ ...currentAmc, startDate: e.target.value })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">End Date</label>
              <input 
                type="date"
                required
                value={currentAmc?.endDate ? new Date(currentAmc.endDate).toISOString().split("T")[0] : ""}
                onChange={(e) => setCurrentAmc({ ...currentAmc, endDate: e.target.value })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Annual Value (₹)</label>
            <input 
              type="number"
              required
              value={currentAmc?.value || 0}
              onChange={(e) => setCurrentAmc({ ...currentAmc, value: Number(e.target.value) })}
              className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Primary Service Description</label>
            <input 
              required
              value={currentAmc?.services?.[0]?.description || ""}
              onChange={(e) => setCurrentAmc({ 
                ...currentAmc, 
                services: [{ ...currentAmc?.services?.[0], description: e.target.value, frequency: "quarterly" }] as any 
              })}
              className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              placeholder="e.g. Server + Network Support"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-all">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-bold shadow-lg shadow-[var(--accent)]/20 transition-all flex items-center gap-2">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              <span>{currentAmc?._id ? "Update AMC" : "Register AMC"}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
