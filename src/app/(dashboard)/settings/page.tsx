"use client";

import { Save, User, Building, Bell, Shield, Palette } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Settings</h1>
        <p className="text-sm text-[var(--foreground-secondary)] mt-1">Manage your account and application preferences</p>
      </div>

      {/* Profile Section */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <User size={20} className="text-[var(--accent)]" />
          <h2 className="text-base font-semibold text-[var(--foreground)]">Profile</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[var(--foreground-muted)] block mb-1.5">First Name</label>
            <input type="text" defaultValue="Admin" className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--border-focus)] focus:shadow-[var(--shadow-glow)] outline-none transition-all" />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--foreground-muted)] block mb-1.5">Last Name</label>
            <input type="text" defaultValue="User" className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--border-focus)] focus:shadow-[var(--shadow-glow)] outline-none transition-all" />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--foreground-muted)] block mb-1.5">Email</label>
            <input type="email" defaultValue="admin@rvminfotech.com" className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--border-focus)] focus:shadow-[var(--shadow-glow)] outline-none transition-all" />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--foreground-muted)] block mb-1.5">Phone</label>
            <input type="tel" defaultValue="+91 98765 43210" className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--border-focus)] focus:shadow-[var(--shadow-glow)] outline-none transition-all" />
          </div>
        </div>
      </div>

      {/* Organization */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <Building size={20} className="text-[var(--accent)]" />
          <h2 className="text-base font-semibold text-[var(--foreground)]">Organization</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[var(--foreground-muted)] block mb-1.5">Company Name</label>
            <input type="text" defaultValue="RVM Infotech" className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--border-focus)] outline-none transition-all" />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--foreground-muted)] block mb-1.5">Currency</label>
            <select className="w-full bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--border-focus)] outline-none transition-all">
              <option>INR (₹)</option>
              <option>USD ($)</option>
              <option>EUR (€)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <Bell size={20} className="text-[var(--accent)]" />
          <h2 className="text-base font-semibold text-[var(--foreground)]">Notifications</h2>
        </div>
        <div className="space-y-4">
          {[
            { label: "Email notifications for new leads", defaultChecked: true },
            { label: "Push notifications for ticket updates", defaultChecked: true },
            { label: "AMC renewal reminders", defaultChecked: true },
            { label: "Daily digest email", defaultChecked: false },
          ].map((item) => (
            <label key={item.label} className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm text-[var(--foreground-secondary)] group-hover:text-[var(--foreground)] transition-colors">{item.label}</span>
              <div className="relative">
                <input type="checkbox" defaultChecked={item.defaultChecked} className="sr-only peer" />
                <div className="w-10 h-5 bg-[var(--background-secondary)] border border-[var(--border)] rounded-full peer-checked:bg-[var(--accent)] transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-6 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-[var(--accent)]/20">
          <Save size={16} /><span>Save Changes</span>
        </button>
      </div>
    </div>
  );
}
