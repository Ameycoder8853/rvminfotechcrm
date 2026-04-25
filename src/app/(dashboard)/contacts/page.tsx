"use client";

import { useState } from "react";
import { Plus, Search, Filter, Eye, Edit, Trash2, Phone, Mail, Building } from "lucide-react";

const contacts = [
  { id: "1", firstName: "Priya", lastName: "Sharma", company: "TechVision Pvt Ltd", email: "priya@techvision.in", phone: "+91 98765 43210", city: "Mumbai", tags: ["Enterprise", "IT"], interactions: 12 },
  { id: "2", firstName: "Rajesh", lastName: "Kumar", company: "Sunrise Industries", email: "rajesh@sunrise.com", phone: "+91 87654 32109", city: "Delhi", tags: ["Manufacturing"], interactions: 8 },
  { id: "3", firstName: "Sneha", lastName: "Patel", company: "CloudNet Solutions", email: "sneha@cloudnet.io", phone: "+91 76543 21098", city: "Bangalore", tags: ["SaaS", "Tech"], interactions: 15 },
  { id: "4", firstName: "Vikram", lastName: "Singh", company: "Metro Enterprises", email: "vikram@metro.in", phone: "+91 65432 10987", city: "Pune", tags: ["Retail"], interactions: 5 },
  { id: "5", firstName: "Meera", lastName: "Joshi", company: "Apex Digital", email: "meera@apexdigital.com", phone: "+91 54321 09876", city: "Hyderabad", tags: ["Digital", "Marketing"], interactions: 9 },
  { id: "6", firstName: "Arjun", lastName: "Mehta", company: "DataFlow Systems", email: "arjun@dataflow.in", phone: "+91 43210 98765", city: "Chennai", tags: ["Data", "Enterprise"], interactions: 18 },
];

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = contacts.filter(
    (c) =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Contacts</h1>
          <p className="text-sm text-[var(--foreground-secondary)] mt-1">Manage your customer database</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-[var(--accent)]/20">
          <Plus size={18} />
          <span>Add Contact</span>
        </button>
      </div>

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

      {/* Contact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((contact) => (
          <div
            key={contact.id}
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
                    <span>{contact.company}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 rounded-md text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-active)] transition-colors"><Eye size={14} /></button>
                <button className="p-1.5 rounded-md text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-active)] transition-colors"><Edit size={14} /></button>
                <button className="p-1.5 rounded-md text-[var(--foreground-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-muted)] transition-colors"><Trash2 size={14} /></button>
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
              <div className="flex gap-1.5 flex-wrap">
                {contact.tags.map((tag) => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--background-secondary)] text-[var(--foreground-muted)] border border-[var(--border)]">
                    {tag}
                  </span>
                ))}
              </div>
              <span className="text-[10px] text-[var(--foreground-muted)]">
                {contact.interactions} interactions
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
