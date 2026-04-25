"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
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
} from "lucide-react";

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
          "fixed top-0 left-0 z-50 h-full w-72 bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] transform transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-[var(--header-height)] border-b border-[var(--sidebar-border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-lg font-bold">
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
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-var(--header-height))]">
          {navItems.map((item) => {
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
    </>
  );
}
