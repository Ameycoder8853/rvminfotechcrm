"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Target,
  FileText,
  ShoppingCart,
  Ticket,
  Shield,
  Wrench,
  Receipt,
  MapPin,
  Calendar,
  Settings,
  X,
  Layers
} from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
  { title: "Leads", href: "/leads", icon: <Target size={20} /> },
  { title: "Contacts", href: "/contacts", icon: <Users size={20} /> },
  { title: "Quotations", href: "/quotes", icon: <FileText size={20} /> },
  { title: "Orders", href: "/orders", icon: <ShoppingCart size={20} /> },
  { title: "Tickets", href: "/tickets", icon: <Ticket size={20} /> },
  { title: "AMC", href: "/amc", icon: <Shield size={20} /> },
  { title: "Installations", href: "/installations", icon: <Wrench size={20} /> },
  { title: "Expenses", href: "/expenses", icon: <Receipt size={20} /> },
  { title: "Attendance", href: "/attendance", icon: <MapPin size={20} /> },
  { title: "Diary", href: "/diary", icon: <Calendar size={20} /> },
  { title: "Settings", href: "/settings", icon: <Settings size={20} /> },
];

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch("/api/users/me");
        const data = await res.json();
        if (data.success) {
          setCurrentUser(data.data);
        }
      } catch (err) {
        console.error("Failed to load user details in mobile-nav:", err);
      }
    }
    if (isOpen) {
      fetchMe();
    }
  }, [isOpen]);

  const getFilteredNavItems = () => {
    if (!currentUser) return [];

    const isSuperAdmin = currentUser.roleTier === "super_admin";
    const isAdmin = currentUser.roleTier === "admin" || isSuperAdmin;
    const isSenior = currentUser.roleTier === "senior" || isSuperAdmin;

    const rawTeam = currentUser.teamId;
    const perms = (rawTeam && typeof rawTeam === "object" && "permissions" in rawTeam)
      ? (rawTeam.permissions as any)
      : null;

    const defaultFallback = (isAdmin || isSenior) ? "all" : "none";
    const leadsPerm = perms?.leads || defaultFallback;
    const customersPerm = perms?.customers || defaultFallback;
    const invoicesPerm = perms?.invoices || defaultFallback;
    const ticketsPerm = perms?.tickets || defaultFallback;

    return navItems.filter((item) => {
      if (isAdmin) return true;

      // Seniors see all team-related modules
      if (isSenior) return true;

      if (item.title === "Leads" && leadsPerm === "none") return false;
      if (item.title === "Contacts" && customersPerm === "none") return false;
      if (item.title === "Tickets" && ticketsPerm === "none") return false;
      if (item.title === "AMC" && ticketsPerm === "none") return false;
      if (item.title === "Installations" && ticketsPerm === "none") return false;
      if (item.title === "Quotations" && invoicesPerm === "none") return false;
      if (item.title === "Orders" && invoicesPerm === "none") return false;
      if (item.title === "Expenses" && invoicesPerm === "none") return false;

      return true;
    });
  };

  const visibleNavItems = currentUser ? getFilteredNavItems() : navItems;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col justify-between overflow-hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full justify-between">
          {/* Bottom segment / Top segment */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 h-[var(--header-height)] border-b border-[var(--sidebar-border)] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-[32px] h-[32px] rounded-[9px] bg-[var(--accent,#6366f1)] flex items-center justify-center shadow-sm shrink-0">
                  <Layers size={16} className="text-white stroke-[2.2]" />
                </div>
                <span className="text-lg font-bold tracking-tight text-[var(--foreground)]">
                  RVM <span className="gradient-text">CRM</span>
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-hover)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav Items */}
            <nav className="p-3 space-y-1 overflow-y-auto flex-1 pb-16">
              {visibleNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-[var(--accent-muted)] text-[var(--accent-hover)]"
                        : "text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-hover)]"
                    )}
                  >
                    <span className={cn("shrink-0", isActive ? "text-[var(--accent)]" : "")}>
                      {item.icon}
                    </span>
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Footer segment with Theme Toggle */}
          <div className="p-4 border-t border-[var(--sidebar-border)] bg-[var(--background)]/40 flex items-center justify-between shrink-0">
            <span className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider">Appearance</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </>
  );
}
