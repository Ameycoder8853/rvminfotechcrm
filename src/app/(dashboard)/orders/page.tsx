"use client";

import { useState, useEffect, useCallback } from "react";
import StatusBadge from "@/components/shared/status-badge";
import { Plus, Search, Package, Eye, Edit, Loader2, Trash2 } from "lucide-react";
import Modal from "@/components/shared/modal";

interface Order {
  _id: string;
  orderNumber: string;
  customer?: { _id: string; firstName: string; lastName: string; company: string };
  totalAmount: number;
  status: string;
  department?: string;
  createdAt: string;
}

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Partial<Order> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersRes, customersRes] = await Promise.all([
        fetch(`/api/orders${statusFilter !== "all" ? `?status=${statusFilter}` : ""}`),
        fetch("/api/contacts"),
      ]);
      
      const ordersData = await ordersRes.json();
      const customersData = await customersRes.json();

      if (ordersData.success) setOrders(ordersData.data);
      if (customersData.success) setCustomers(customersData.data);
    } catch (error) {
      console.error("Failed to fetch order data:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, [fetchData]);

  const filtered = orders.filter(
    (o) => 
      o.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      o.customer?.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (order: Partial<Order> | null = null) => {
    setCurrentOrder(order || {
      totalAmount: 0,
      status: "pending",
      department: "Hardware",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder) return;

    try {
      setIsSubmitting(true);
      const url = currentOrder._id ? `/api/orders/${currentOrder._id}` : "/api/orders";
      const method = currentOrder._id ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentOrder),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error("Failed to save order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this order?")) return;
    try {
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to delete order:", error);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Orders</h1>
          <p className="text-sm text-[var(--foreground-secondary)] mt-1">Track customer orders from creation to delivery</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-[var(--accent)]/20 active:scale-95"
        >
          <Plus size={18} />
          <span>New Order</span>
        </button>
      </div>

      <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 max-w-sm">
        <Search size={16} className="text-[var(--foreground-muted)]" />
        <input type="text" placeholder="Search orders..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] w-full" />
      </div>

      {/* Order Status Pipeline */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((s) => (
          <button 
            key={s} 
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
              statusFilter === s 
                ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/20" 
                : "bg-[var(--surface)] border-[var(--border)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:border-[var(--border-hover)]"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin mb-4" />
          <p className="text-sm text-[var(--foreground-secondary)]">Loading order records...</p>
        </div>
      ) : (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--background-secondary)]/50">
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Order</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)] hidden lg:table-cell">Dept.</th>
                  <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order._id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-[var(--accent)]" />
                        <span className="font-bold text-[var(--foreground)]">{order.orderNumber}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--foreground-secondary)] font-medium">{order.customer?.company || "No Company"}</td>
                    <td className="px-4 py-3 font-bold text-[var(--foreground)]">₹{order.totalAmount?.toLocaleString()}</td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 text-[var(--foreground-muted)] text-xs hidden lg:table-cell">{order.department}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleOpenModal(order)} className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-active)] transition-colors"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(order._id)} className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-muted)] transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-[var(--foreground-muted)] italic">No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentOrder?._id ? `Edit Order ${currentOrder.orderNumber}` : "Create New Order"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Customer</label>
            <select 
              required
              value={(currentOrder?.customer as any)?._id || (currentOrder?.customer as any) || ""}
              onChange={(e) => setCurrentOrder({ ...currentOrder, customer: e.target.value as any })}
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
                value={currentOrder?.totalAmount || 0}
                onChange={(e) => setCurrentOrder({ ...currentOrder, totalAmount: Number(e.target.value) })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Department</label>
              <select 
                value={currentOrder?.department || "Hardware"}
                onChange={(e) => setCurrentOrder({ ...currentOrder, department: e.target.value })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              >
                <option value="Hardware">Hardware</option>
                <option value="IT Solutions">IT Solutions</option>
                <option value="Networking">Networking</option>
                <option value="Cloud">Cloud</option>
                <option value="Security">Security</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Status</label>
            <select 
              value={currentOrder?.status || "pending"}
              onChange={(e) => setCurrentOrder({ ...currentOrder, status: e.target.value })}
              className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-all">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-bold shadow-lg shadow-[var(--accent)]/20 transition-all flex items-center gap-2">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              <span>{currentOrder?._id ? "Update Order" : "Create Order"}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
