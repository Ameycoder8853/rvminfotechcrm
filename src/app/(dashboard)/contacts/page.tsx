"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Filter, Eye, Edit, Trash2, Phone, Mail, Building, Loader2 } from "lucide-react";
import Modal from "@/components/shared/modal";

interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  city?: string;
  tags?: string[];
}

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<Partial<Contact> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/contacts");
      const data = await res.json();
      if (data.success) {
        setContacts(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchContacts();
  }, [fetchContacts]);

  const filtered = contacts.filter(
    (c) =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (contact: Partial<Contact> | null = null) => {
    setCurrentContact(contact || {
      firstName: "",
      lastName: "",
      company: "",
      email: "",
      phone: "",
      city: "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentContact) return;

    try {
      setIsSubmitting(true);
      const url = currentContact._id ? `/api/contacts/${currentContact._id}` : "/api/contacts";
      const method = currentContact._id ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentContact),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchContacts();
      }
    } catch (error) {
      console.error("Failed to save contact:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    try {
      const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchContacts();
      }
    } catch (error) {
      console.error("Failed to delete contact:", error);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Contacts</h1>
          <p className="text-sm text-[var(--foreground-secondary)] mt-1">Manage your real customer database</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-[var(--accent)]/20 active:scale-95"
        >
          <Plus size={18} />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 flex-1 sm:max-w-sm">
          <Search size={16} className="text-[var(--foreground-muted)]" />
          <input
            type="text"
            placeholder="Search contacts..."
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
          <p className="text-sm text-[var(--foreground-secondary)]">Loading contacts...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((contact) => (
            <div
              key={contact._id}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--border-hover)] hover:shadow-[var(--shadow-md)] transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent-muted)] flex items-center justify-center text-sm font-bold text-[var(--accent)]">
                    {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--foreground)]">
                      {contact.firstName} {contact.lastName}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-[var(--foreground-muted)]">
                      <Building size={11} />
                      <span className="truncate max-w-[120px]">{contact.company}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(contact)} className="p-1.5 rounded-md text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-active)] transition-colors"><Edit size={14} /></button>
                  <button onClick={() => handleDelete(contact._id)} className="p-1.5 rounded-md text-[var(--foreground-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-muted)] transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-[var(--foreground-secondary)]">
                  <Mail size={13} className="shrink-0 text-[var(--foreground-muted)]" />
                  <span className="truncate">{contact.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--foreground-secondary)]">
                  <Phone size={13} className="shrink-0 text-[var(--foreground-muted)]" />
                  <span>{contact.phone}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                <span className="text-[10px] text-[var(--foreground-muted)] uppercase font-bold tracking-wider">
                  {contact.city || "No City"}
                </span>
                <span className="text-[10px] text-[var(--accent)] font-medium bg-[var(--accent-muted)] px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-[var(--background-secondary)]/30 rounded-2xl border border-dashed border-[var(--border)]">
              <p className="text-sm text-[var(--foreground-muted)]">No contacts found</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentContact?._id ? "Edit Contact" : "Add New Contact"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">First Name</label>
              <input 
                required
                value={currentContact?.firstName || ""}
                onChange={(e) => setCurrentContact({ ...currentContact, firstName: e.target.value })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Last Name</label>
              <input 
                required
                value={currentContact?.lastName || ""}
                onChange={(e) => setCurrentContact({ ...currentContact, lastName: e.target.value })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Company</label>
            <input 
              value={currentContact?.company || ""}
              onChange={(e) => setCurrentContact({ ...currentContact, company: e.target.value })}
              className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Email</label>
              <input 
                type="email"
                required
                value={currentContact?.email || ""}
                onChange={(e) => setCurrentContact({ ...currentContact, email: e.target.value })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">Phone</label>
              <input 
                value={currentContact?.phone || ""}
                onChange={(e) => setCurrentContact({ ...currentContact, phone: e.target.value })}
                className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5 block">City</label>
            <input 
              value={currentContact?.city || ""}
              onChange={(e) => setCurrentContact({ ...currentContact, city: e.target.value })}
              className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-all">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl text-sm font-bold shadow-lg shadow-[var(--accent)]/20 transition-all flex items-center gap-2">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              <span>{currentContact?._id ? "Update Contact" : "Save Contact"}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
