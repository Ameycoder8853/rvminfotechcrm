"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Search, Filter, Eye, Edit, Trash2, Phone, Mail, Building, Loader2, Upload, Download } from "lucide-react";
import Modal from "@/components/shared/modal";

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  city?: string;
  assignedTo?: { _id: string; firstName: string; lastName: string };
  tags?: string[];
}

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Partial<Customer> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/customers");
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchCustomers();
    fetchUsers();
  }, [fetchCustomers, fetchUsers]);

  const filtered = customers.filter(
    (c) =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (customer: Partial<Customer> | null = null) => {
    setCurrentCustomer(customer || {
      firstName: "",
      lastName: "",
      company: "",
      email: "",
      phone: "",
      city: "",
      assignedTo: undefined,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer) return;

    try {
      setIsSubmitting(true);
      const url = currentCustomer._id ? `/api/customers/${currentCustomer._id}` : "/api/customers";
      const method = currentCustomer._id ? "PATCH" : "POST";

      const payload = {
        ...currentCustomer,
        assignedTo: (currentCustomer.assignedTo as any)?._id || currentCustomer.assignedTo || undefined,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchCustomers();
      }
    } catch (error) {
      console.error("Failed to save customer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCustomers();
      }
    } catch (error) {
      console.error("Failed to delete customer:", error);
    }
  };

  // Client-side CSV Import Engine
  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        const lines = text.split(/\r?\n/);
        if (lines.length === 0) return alert("Empty CSV file!");

        // Parse CSV headers
        const headers = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
        const parsedRows: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Simple CSV parser splitting by comma (ignoring commas inside quotes)
          const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(",");
          const row: any = {};
          headers.forEach((header, index) => {
            const val = matches[index] ? matches[index].trim().replace(/^["']|["']$/g, "") : "";
            row[header] = val;
          });
          parsedRows.push(row);
        }

        // Map and normalize CSV columns to DB fields
        const normalized = parsedRows.map((row) => ({
          firstName: row.firstName || row["first name"] || row["First Name"] || "Imported",
          lastName: row.lastName || row["last name"] || row["Last Name"] || "",
          company: row.company || row["Company"] || row["company name"] || "",
          email: row.email || row["Email"] || row["email address"] || "",
          phone: row.phone || row["Phone"] || row["phone number"] || "",
          city: row.city || row["City"] || row["city name"] || "",
        }));

        if (normalized.length === 0) return alert("No valid rows found in CSV!");

        setLoading(true);
        const res = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(normalized),
        });

        if (res.ok) {
          alert(`Successfully imported ${normalized.length} customers!`);
          fetchCustomers();
        } else {
          alert("Failed to import CSV data.");
        }
      } catch (err) {
        console.error("CSV Import error:", err);
        alert("Error parsing CSV. Please check formatting.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
  };

  // Client-Side CSV Export Engine
  const handleCSVExport = () => {
    if (filtered.length === 0) return alert("No customer records to export!");

    const headers = ["First Name", "Last Name", "Company", "Email", "Phone", "City", "Assigned To"];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...filtered.map((c) =>
          [
            `"${c.firstName || ""}"`,
            `"${c.lastName || ""}"`,
            `"${c.company || ""}"`,
            `"${c.email || ""}"`,
            `"${c.phone || ""}"`,
            `"${c.city || ""}"`,
            `"${c.assignedTo ? `${c.assignedTo.firstName} ${c.assignedTo.lastName}` : "Unassigned"}"`,
          ].join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `customers_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Customers</h1>
          <p className="text-sm text-[var(--foreground-secondary)] mt-1">Manage and view your CRM customer database</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleCSVImport}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] rounded-lg text-sm font-medium transition-colors"
            title="Import from CSV"
          >
            <Upload size={16} />
            <span className="hidden md:inline">Import CSV</span>
          </button>
          <button
            onClick={handleCSVExport}
            className="flex items-center gap-2 px-3 py-2 bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] rounded-lg text-sm font-medium transition-colors"
            title="Export to CSV"
          >
            <Download size={16} />
            <span className="hidden md:inline">Export CSV</span>
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-[var(--accent)]/20 active:scale-95"
          >
            <Plus size={18} />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 flex-1 sm:max-w-sm">
          <Search size={16} className="text-[var(--foreground-muted)]" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] w-full"
          />
        </div>
        <button className="p-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:border-[var(--border-hover)] transition-colors">
          <Filter size={16} />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin mb-4" />
          <p className="text-sm text-[var(--foreground-secondary)]">Loading customer database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((customer) => (
            <div
              key={customer._id}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--border-hover)] hover:shadow-[var(--shadow-md)] transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent-muted)] flex items-center justify-center text-sm font-bold text-[var(--accent)]">
                    {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--foreground)]">
                      {customer.firstName} {customer.lastName}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-[var(--foreground-muted)]">
                      <Building size={11} />
                      <span className="truncate max-w-[120px]">{customer.company}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); handleOpenModal(customer); }} className="p-1.5 rounded-md text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-active)] transition-colors"><Edit size={14} /></button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(customer._id); }} className="p-1.5 rounded-md text-[var(--foreground-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-muted)] transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-[var(--foreground-secondary)]">
                  <Mail size={13} className="shrink-0 text-[var(--foreground-muted)]" />
                  <span className="truncate">{customer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--foreground-secondary)]">
                  <Phone size={13} className="shrink-0 text-[var(--foreground-muted)]" />
                  <span>{customer.phone}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                <span className="text-[10px] text-[var(--foreground-muted)] uppercase font-bold tracking-wider">
                  {customer.city || "No City"}
                </span>
                <span className="text-[10px] text-[var(--accent)] font-medium bg-[var(--accent-muted)] px-2.5 py-0.5 rounded-full">
                  {customer.assignedTo ? `${customer.assignedTo.firstName} ${customer.assignedTo.lastName.charAt(0)}.` : "Unassigned"}
                </span>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-[var(--background-secondary)]/30 rounded-2xl border border-dashed border-[var(--border)]">
              <p className="text-sm text-[var(--foreground-muted)]">No customers found</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentCustomer?._id ? "Edit Customer" : "Add New Customer"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">First Name</label>
              <input 
                required
                value={currentCustomer?.firstName || ""}
                onChange={(e) => setCurrentCustomer({ ...currentCustomer, firstName: e.target.value })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Last Name</label>
              <input 
                required
                value={currentCustomer?.lastName || ""}
                onChange={(e) => setCurrentCustomer({ ...currentCustomer, lastName: e.target.value })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Company</label>
              <input 
                value={currentCustomer?.company || ""}
                onChange={(e) => setCurrentCustomer({ ...currentCustomer, company: e.target.value })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Assigned To</label>
              <select 
                value={(currentCustomer?.assignedTo as any)?._id || (currentCustomer?.assignedTo as any) || ""}
                onChange={(e) => setCurrentCustomer({ ...currentCustomer, assignedTo: e.target.value as any })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              >
                <option value="">Unassigned</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.firstName} {u.lastName}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Email</label>
              <input 
                type="email"
                required
                value={currentCustomer?.email || ""}
                onChange={(e) => setCurrentCustomer({ ...currentCustomer, email: e.target.value })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Phone</label>
              <input 
                value={currentCustomer?.phone || ""}
                onChange={(e) => setCurrentCustomer({ ...currentCustomer, phone: e.target.value })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">City</label>
            <input 
              value={currentCustomer?.city || ""}
              onChange={(e) => setCurrentCustomer({ ...currentCustomer, city: e.target.value })}
              className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-all">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-bold shadow-lg shadow-[var(--accent)]/20 transition-all flex items-center gap-2">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              <span>{currentCustomer?._id ? "Update Customer" : "Save Customer"}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
