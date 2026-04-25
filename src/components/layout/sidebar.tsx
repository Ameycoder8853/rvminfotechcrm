"use client";

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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: <LayoutDashboard size={20} />,
      },
    ],
  },
  {
    title: "Sales",
    items: [
      { title: "Leads", href: "/leads", icon: <Target size={20} /> },
      { title: "Contacts", href: "/contacts", icon: <Users size={20} /> },
      { title: "Quotations", href: "/quotes", icon: <FileText size={20} /> },
      { title: "Orders", href: "/orders", icon: <ShoppingCart size={20} /> },
    ],
  },
  {
    title: "Service",
    items: [
      { title: "Tickets", href: "/tickets", icon: <Ticket size={20} /> },
      { title: "AMC", href: "/amc", icon: <Shield size={20} /> },
      {
        title: "Installations",
        href: "/installations",
        icon: <Wrench size={20} />,
      },
    ],
  },
  {
    title: "Operations",
    items: [
      { title: "Expenses", href: "/expenses", icon: <Receipt size={20} /> },
      {
        title: "Attendance",
        href: "/attendance",
        icon: <MapPin size={20} />,
      },
      { title: "Diary", href: "/diary", icon: <Calendar size={20} /> },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Settings",
        href: "/settings",
        icon: <Settings size={20} />,
      },
    ],
  },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col fixed top-0 left-0 h-screen z-40 transition-all duration-300 ease-in-out",
        collapsed ? "w-[var(--sidebar-collapsed-width)]" : "w-[var(--sidebar-width)]",
        "bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)]",
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-[var(--header-height)] border-b border-[var(--sidebar-border)] shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center shrink-0">
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
        {!collapsed && (
          <span className="text-lg font-bold text-[var(--foreground)] whitespace-nowrap animate-fade-in">
            RVM <span className="gradient-text">CRM</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navigation.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <p className="text-[10px] uppercase tracking-widest text-[var(--foreground-muted)] font-semibold px-3 mb-2">
                {group.title}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.title}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      collapsed && "justify-center px-0",
                      isActive
                        ? "bg-[var(--accent-muted)] text-[var(--accent-hover)] shadow-sm"
                        : "text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-hover)]"
                    )}
                  >
                    <span
                      className={cn(
                        "shrink-0 transition-colors",
                        isActive ? "text-[var(--accent)]" : ""
                      )}
                    >
                      {item.icon}
                    </span>
                    {!collapsed && <span>{item.title}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-12 border-t border-[var(--sidebar-border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-hover)] transition-colors"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  );
}
