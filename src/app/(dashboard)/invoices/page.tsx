"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Filter, Eye, Edit, Trash2, Receipt, Loader2, Download, CheckCircle2, Clock, XCircle } from "lucide-react";
import Modal from "@/components/shared/modal";
import StatusBadge from "@/components/shared/status-badge";

interface Invoice {
  _id: string;
  invoiceNumber: string;
  customer: { _id: string; firstName: string; lastName: string; company: string };
  totalAmount: number;
  status: "paid" | "unpaid" | "overdue" | "cancelled";
  dueDate: string;
  issueDate: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [invRes, custRes] = await Promise.all([
        fetch("/api/invoices"),
        fetch("/api/contacts")
      ]);
      
      if (!invRes.ok || !custRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const invData = await invRes.json();
      const custData = await custRes.json();
      
      if (invData.success) setInvoices(invData.data);
      if (custData.success) setCustomers(custData.data);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (invoice: any = null) => {
    setCurrentInvoice(invoice || {
      customer: "",
      status: "unpaid",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      items: [{ description: "", quantity: 1, unitPrice: 0, total: 0 }],
      subtotal: 0,
      tax: 0,
      totalAmount: 0,
    });
    setIsModalOpen(true);
  };

  const calculateTotal = (items: any[]) => {
    const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    return { subtotal, total: subtotal }; // Simplification for tax/discount
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...currentInvoice.items];
    newItems[index] = { ...newItems[index], [field]: value };
    newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    const { subtotal, total } = calculateTotal(newItems);
    setCurrentInvoice({ ...currentInvoice, items: newItems, subtotal, totalAmount: total });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const url = currentInvoice._id ? `/api/invoices/${currentInvoice._id}` : "/api/invoices";
      const method = currentInvoice._id ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentInvoice),
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error("Failed to save invoice:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to delete invoice:", error);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Invoice Generate</h1>
          <p className="text-sm text-[var(--foreground-secondary)] mt-1">Professional billing and financial tracking</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-[var(--accent)]/20"
        >
          <Plus size={18} /><span>Generate Invoice</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 flex-1 sm:max-w-sm">
          <Search size={16} className="text-[var(--foreground-muted)]" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] w-full"
          />
        </div>
        <button className="p-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors">
          <Filter size={16} />
        </button>
      </div>

      {/* Invoice Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin mb-4" />
            <p className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-widest">Loading Invoices...</p>
          </div>
        ) : invoices.map((invoice) => (
          <div key={invoice._id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 hover:border-[var(--accent)] transition-all group shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-muted)] flex items-center justify-center text-[var(--accent)]">
                  <Receipt size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-[var(--foreground)]">{invoice.invoiceNumber}</h4>
                  <p className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest">{new Date(invoice.issueDate).toLocaleDateString()}</p>
                </div>
              </div>
              <StatusBadge status={invoice.status} />
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--foreground-muted)] font-medium">Customer</span>
                <span className="text-[var(--foreground)] font-bold">{invoice.customer?.company || `${invoice.customer?.firstName} ${invoice.customer?.lastName}`}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--foreground-muted)] font-medium">Due Date</span>
                <span className="text-[var(--foreground-secondary)] font-semibold">{new Date(invoice.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[var(--border)]">
                <span className="text-xs font-bold text-[var(--foreground-muted)] uppercase">Amount</span>
                <span className="text-lg font-black text-[var(--accent)]">₹{invoice.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-[var(--border)] opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleOpenModal(invoice)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[var(--background-secondary)] text-[var(--foreground-secondary)] text-xs font-bold hover:bg-[var(--surface-hover)] transition-colors">
                <Edit size={14} /> Edit
              </button>
              <button className="p-2 rounded-lg bg-[var(--accent-muted)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-all">
                <Download size={14} />
              </button>
              <button onClick={() => handleDelete(invoice._id)} className="p-2 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-muted)] transition-all">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Invoice Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentInvoice?._id ? "Edit Invoice" : "Generate New Invoice"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Customer</label>
            <select 
              required
              value={currentInvoice?.customer || ""}
              onChange={(e) => setCurrentInvoice({ ...currentInvoice, customer: e.target.value })}
              className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
            >
              <option value="">Select Customer</option>
              {customers.map(c => (
                <option key={c._id} value={c._id}>{c.company || `${c.firstName} ${c.lastName}`}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Due Date</label>
              <input 
                type="date"
                required
                value={currentInvoice?.dueDate ? new Date(currentInvoice.dueDate).toISOString().split("T")[0] : ""}
                onChange={(e) => setCurrentInvoice({ ...currentInvoice, dueDate: e.target.value })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Status</label>
              <select 
                value={currentInvoice?.status || "unpaid"}
                onChange={(e) => setCurrentInvoice({ ...currentInvoice, status: e.target.value })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider block">Items</label>
            {currentInvoice?.items.map((item: any, idx: number) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <input 
                  placeholder="Item description"
                  className="col-span-6 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs outline-none"
                  value={item.description}
                  onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                />
                <input 
                  type="number"
                  placeholder="Qty"
                  className="col-span-2 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg px-2 py-2 text-xs outline-none"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(idx, "quantity", parseInt(e.target.value))}
                />
                <input 
                  type="number"
                  placeholder="Price"
                  className="col-span-3 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg px-2 py-2 text-xs outline-none"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(idx, "unitPrice", parseInt(e.target.value))}
                />
                <button type="button" className="col-span-1 text-[var(--danger)] hover:bg-[var(--danger-muted)] p-1 rounded">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-[var(--border)] flex justify-between items-center">
            <span className="text-sm font-bold text-[var(--foreground-secondary)]">Total Amount:</span>
            <span className="text-2xl font-black text-[var(--accent)]">₹{currentInvoice?.totalAmount.toLocaleString()}</span>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-[var(--foreground-secondary)] hover:bg-[var(--surface-hover)]">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-bold shadow-lg shadow-[var(--accent)]/20 transition-all flex items-center gap-2">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              <span>{currentInvoice?._id ? "Update Invoice" : "Generate Invoice"}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
