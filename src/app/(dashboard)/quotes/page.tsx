"use client";

import { useState, useEffect, useCallback } from "react";
import StatusBadge from "@/components/shared/status-badge";
import { Plus, Search, FileText, Eye, Edit, ArrowRightLeft, Loader2, Trash2 } from "lucide-react";
import Modal from "@/components/shared/modal";

interface Quote {
  _id: string;
  quoteNumber: string;
  customer?: { _id: string; firstName: string; lastName: string; company: string };
  totalAmount: number;
  status: string;
  validUntil: string;
  createdAt: string;
}

export default function QuotesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<Partial<Quote> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [quotesRes, customersRes] = await Promise.all([
        fetch("/api/quotes"),
        fetch("/api/contacts"),
      ]);
      
      const quotesData = await quotesRes.json();
      const customersData = await customersRes.json();

      if (quotesData.success) setQuotes(quotesData.data);
      if (customersData.success) setCustomers(customersData.data);
    } catch (error) {
      console.error("Failed to fetch quote data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [fetchData]);

  const filtered = quotes.filter(
    (q) => 
      q.quoteNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      q.customer?.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (quote: Partial<Quote> | null = null) => {
    setCurrentQuote(quote || {
      totalAmount: 0,
      status: "draft",
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuote) return;

    try {
      setIsSubmitting(true);
      const url = currentQuote._id ? `/api/quotes/${currentQuote._id}` : "/api/quotes";
      const method = currentQuote._id ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentQuote),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error("Failed to save quote:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this quotation?")) return;
    try {
      const res = await fetch(`/api/quotes/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to delete quote:", error);
    }
  };

  const handleConvertToOrder = async (quote: Quote) => {
    if (!confirm("Convert this quote to a real order?")) return;
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: quote.customer?._id,
          totalAmount: quote.totalAmount,
          status: "pending",
          items: [], // In a real app, we'd copy items too
        }),
      });

      if (res.ok) {
        // Mark quote as converted
        await fetch(`/api/quotes/${quote._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "converted" }),
        });
        fetchData();
        alert("Order created successfully!");
      }
    } catch (error) {
      console.error("Failed to convert quote:", error);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Quotations</h1>
          <p className="text-sm text-[var(--foreground-secondary)] mt-1">Create and manage real sales quotations</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-[var(--accent)]/20 active:scale-95"
        >
          <Plus size={18} />
          <span>New Quote</span>
        </button>
      </div>

      <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 max-w-sm">
        <Search size={16} className="text-[var(--foreground-muted)]" />
        <input type="text" placeholder="Search quotes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] w-full" />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin mb-4" />
          <p className="text-sm text-[var(--foreground-secondary)]">Loading quotations...</p>
        </div>
      ) : (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--background-secondary)]/50">
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Quote #</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)] hidden lg:table-cell">Valid Until</th>
                  <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((quote) => (
                  <tr key={quote._id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-[var(--accent)]" />
                        <span className="font-bold text-[var(--foreground)]">{quote.quoteNumber}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--foreground-secondary)] font-medium">{quote.customer?.company || "No Company"}</td>
                    <td className="px-4 py-3 font-bold text-[var(--foreground)]">₹{quote.totalAmount?.toLocaleString()}</td>
                    <td className="px-4 py-3"><StatusBadge status={quote.status} /></td>
                    <td className="px-4 py-3 text-[var(--foreground-muted)] text-xs hidden lg:table-cell">
                      {new Date(quote.validUntil).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleOpenModal(quote)} className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-active)] transition-colors" title="Edit"><Edit size={16} /></button>
                        {quote.status === "accepted" && (
                          <button onClick={() => handleConvertToOrder(quote)} className="p-1.5 rounded-lg text-[var(--success)] hover:bg-[var(--success-muted)] transition-colors" title="Convert to Order">
                            <ArrowRightLeft size={16} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(quote._id)} className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-muted)] transition-colors" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-[var(--foreground-muted)] italic">No quotations found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quote Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentQuote?._id ? `Edit Quotation ${currentQuote.quoteNumber}` : "Generate New Quotation"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Customer</label>
            <select 
              required
              value={(currentQuote?.customer as any)?._id || (currentQuote?.customer as any) || ""}
              onChange={(e) => setCurrentQuote({ ...currentQuote, customer: e.target.value as any })}
              className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
            >
              <option value="">Select Customer</option>
              {customers.map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName} ({c.company})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Total Amount (₹)</label>
              <input 
                type="number"
                required
                value={currentQuote?.totalAmount || 0}
                onChange={(e) => setCurrentQuote({ ...currentQuote, totalAmount: Number(e.target.value) })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Status</label>
              <select 
                value={currentQuote?.status || "draft"}
                onChange={(e) => setCurrentQuote({ ...currentQuote, status: e.target.value })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Valid Until</label>
            <input 
              type="date"
              required
              value={currentQuote?.validUntil ? new Date(currentQuote.validUntil).toISOString().split("T")[0] : ""}
              onChange={(e) => setCurrentQuote({ ...currentQuote, validUntil: e.target.value })}
              className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-all">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-bold shadow-lg shadow-[var(--accent)]/20 transition-all flex items-center gap-2">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              <span>{currentQuote?._id ? "Update Quotation" : "Create Quotation"}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
