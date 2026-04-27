"use client";

import { useState, useEffect, useCallback } from "react";
import StatusBadge from "@/components/shared/status-badge";
import { Plus, Search, Wrench, Camera, CheckSquare, Loader2, Edit, Trash2 } from "lucide-react";
import Modal from "@/components/shared/modal";

interface Installation {
  _id: string;
  customer?: { _id: string; firstName: string; lastName: string; company: string };
  order?: { _id: string; orderNumber: string };
  assignedTo?: { _id: string; firstName: string; lastName: string };
  scheduledDate: string;
  status: string;
  progressPhotos: any[];
  customerSignature: string;
}

export default function InstallationsPage() {
  const [search, setSearch] = useState("");
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [techs, setTechs] = useState<any[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInst, setCurrentInst] = useState<Partial<Installation> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [instRes, customersRes, ordersRes, usersRes] = await Promise.all([
        fetch("/api/installations"),
        fetch("/api/contacts"),
        fetch("/api/orders"),
        fetch("/api/users"),
      ]);
      
      const instData = await instRes.json();
      const customersData = await customersRes.json();
      const ordersData = await ordersRes.json();
      const usersData = await usersRes.json();

      if (instData.success) setInstallations(instData.data);
      if (customersData.success) setCustomers(customersData.data);
      if (ordersData.success) setOrders(ordersData.data);
      if (usersData.success) setTechs(usersData.data);
    } catch (error) {
      console.error("Failed to fetch installation data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [fetchData]);

  const filtered = installations.filter(
    (i) => i.customer?.company?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (inst: Partial<Installation> | null = null) => {
    setCurrentInst(inst || {
      scheduledDate: new Date().toISOString().split("T")[0],
      status: "scheduled",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInst) return;

    try {
      setIsSubmitting(true);
      const url = currentInst._id ? `/api/installations/${currentInst._id}` : "/api/installations";
      const method = currentInst._id ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentInst),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error("Failed to save installation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this installation record?")) return;
    try {
      const res = await fetch(`/api/installations/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to delete installation:", error);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Installations</h1>
          <p className="text-sm text-[var(--foreground-secondary)] mt-1">Track real installation jobs and progress</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-[var(--accent)]/20 active:scale-95"
        >
          <Plus size={18} /><span>Schedule Installation</span>
        </button>
      </div>

      <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 max-w-sm">
        <Search size={16} className="text-[var(--foreground-muted)]" />
        <input 
          type="text" 
          placeholder="Search installations..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="bg-transparent border-none outline-none text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] w-full" 
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin mb-4" />
          <p className="text-sm text-[var(--foreground-secondary)]">Syncing installation jobs...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((inst) => (
            <div key={inst._id} className="group bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--accent)] transition-all shadow-sm hover:shadow-lg relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button onClick={() => handleOpenModal(inst)} className="p-1.5 rounded-lg bg-[var(--background)] text-[var(--foreground-muted)] hover:text-[var(--accent)] border border-[var(--border)] shadow-sm"><Edit size={14} /></button>
                <button onClick={() => handleDelete(inst._id)} className="p-1.5 rounded-lg bg-[var(--background)] text-[var(--foreground-muted)] hover:text-[var(--danger)] border border-[var(--border)] shadow-sm"><Trash2 size={14} /></button>
              </div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wrench size={18} className="text-[var(--accent)]" />
                  <span className="font-bold text-[var(--foreground)] text-lg leading-tight">{inst.customer?.company || "No Company"}</span>
                </div>
                <StatusBadge status={inst.status} />
              </div>
              <div className="space-y-2 text-xs mb-6 border-l-2 border-[var(--border)] pl-4 py-1">
                <div className="flex justify-between"><span className="text-[var(--foreground-muted)] font-medium">Order Reference</span><span className="text-[var(--accent)] font-bold">{inst.order?.orderNumber || "Direct Job"}</span></div>
                <div className="flex justify-between"><span className="text-[var(--foreground-muted)] font-medium">Technician</span><span className="text-[var(--foreground)] font-bold">{inst.assignedTo?.firstName} {inst.assignedTo?.lastName}</span></div>
                <div className="flex justify-between"><span className="text-[var(--foreground-muted)] font-medium">Job Date</span><span className="text-[var(--foreground)] font-bold">{new Date(inst.scheduledDate).toLocaleDateString()}</span></div>
              </div>
              <div className="flex items-center gap-6 pt-4 border-t border-[var(--border)] mt-auto">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                  <Camera size={14} className="text-[var(--foreground-muted)]" />
                  <span>{inst.progressPhotos?.length || 0} Photos</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                  <CheckSquare size={14} className={inst.customerSignature ? "text-[var(--success)]" : "text-[var(--foreground-muted)]"} />
                  <span className={inst.customerSignature ? "text-[var(--success)]" : "text-[var(--foreground-muted)]"}>
                    {inst.customerSignature ? "Signed" : "Unsigned"}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-20 text-center bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-xl">
              <p className="text-[var(--foreground-muted)] italic">No installation records found matching your search.</p>
            </div>
          )}
        </div>
      )}

      {/* Installation Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentInst?._id ? "Update Installation Job" : "Schedule Installation Job"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Customer</label>
            <select 
              required
              value={(currentInst?.customer as any)?._id || (currentInst?.customer as any) || ""}
              onChange={(e) => setCurrentInst({ ...currentInst, customer: e.target.value as any })}
              className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
            >
              <option value="">Select Customer</option>
              {customers.map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName} ({c.company})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Linked Order (Optional)</label>
            <select 
              value={(currentInst?.order as any)?._id || (currentInst?.order as any) || ""}
              onChange={(e) => setCurrentInst({ ...currentInst, order: e.target.value as any })}
              className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
            >
              <option value="">No Order Reference</option>
              {orders.map(o => <option key={o._id} value={o._id}>{o.orderNumber} - {o.customer?.company}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Job Date</label>
              <input 
                type="date"
                required
                value={currentInst?.scheduledDate ? new Date(currentInst.scheduledDate).toISOString().split("T")[0] : ""}
                onChange={(e) => setCurrentInst({ ...currentInst, scheduledDate: e.target.value })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Status</label>
              <select 
                value={currentInst?.status || "scheduled"}
                onChange={(e) => setCurrentInst({ ...currentInst, status: e.target.value })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              >
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Assign Technician</label>
            <select 
              required
              value={(currentInst?.assignedTo as any)?._id || (currentInst?.assignedTo as any) || ""}
              onChange={(e) => setCurrentInst({ ...currentInst, assignedTo: e.target.value as any })}
              className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
            >
              <option value="">Select Technician</option>
              {techs.map(t => <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-all">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-bold shadow-lg shadow-[var(--accent)]/20 transition-all flex items-center gap-2">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              <span>{currentInst?._id ? "Update Job" : "Schedule Job"}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
