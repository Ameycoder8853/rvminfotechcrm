"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
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
  Calendar,
  Settings,
  ChevronRight,
  Phone,
  Clock,
  Package,
  Megaphone,
  X
} from "lucide-react";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ReactNode;
  subItems?: { title: string; href: string }[];
}

const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    title: "Contact Management",
    icon: <Users size={18} />,
    subItems: [
      { title: "Contact List", href: "/contacts" },
      { title: "Add Contact", href: "/contacts?action=add" },
      { title: "Import/Export", href: "/contacts?action=import" },
    ],
  },
  {
    title: "Lead Management",
    icon: <Phone size={18} />,
    subItems: [
      { title: "Lead List", href: "/leads" },
      { title: "Add Lead", href: "/leads?action=add" },
    ],
  },
  {
    title: "Tasks & Planner",
    icon: <Calendar size={18} />,
    subItems: [
      { title: "Planner Board", href: "/diary" },
      { title: "Add Task", href: "/diary?action=add" },
    ],
  },
  {
    title: "Orders",
    icon: <ShoppingCart size={18} />,
    subItems: [
      { title: "Order List", href: "/orders" },
      { title: "Create Order", href: "/orders?action=add" },
    ],
  },
  {
    title: "Quotations",
    icon: <FileText size={18} />,
    subItems: [
      { title: "Quotation List", href: "/quotes" },
      { title: "Create Quotation", href: "/quotes?action=add" },
    ],
  },
  {
    title: "AMC",
    icon: <Shield size={18} />,
    subItems: [
      { title: "AMC List", href: "/amc" },
      { title: "Add AMC", href: "/amc?action=add" },
    ],
  },
  {
    title: "Complaints",
    icon: <Ticket size={18} />,
    subItems: [
      { title: "Complaints List", href: "/tickets" },
      { title: "Log Complaint", href: "/tickets?action=add" },
    ],
  },
  {
    title: "Installation",
    icon: <Wrench size={18} />,
    subItems: [
      { title: "Installation List", href: "/installations" },
      { title: "Schedule Installation", href: "/installations?action=add" },
    ],
  },
  {
    title: "Expenses",
    icon: <Receipt size={18} />,
    subItems: [
      { title: "Expense List", href: "/expenses" },
      { title: "Claim Expense", href: "/expenses?action=add" },
    ],
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: <Package size={18} />,
  },
  {
    title: "Marketing",
    href: "/marketing",
    icon: <Megaphone size={18} />,
  },
  {
    title: "Team",
    href: "/teams",
    icon: <Users size={18} />,
  },
  {
    title: "Attendance",
    href: "/attendance",
    icon: <Clock size={18} />,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: <Settings size={18} />,
  },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Auto-expand active page's parent menu on mount/route change
  useEffect(() => {
    const activeParent = navigation.find(
      (item) => item.subItems?.some((sub) => pathname === sub.href || pathname.startsWith(sub.href + "?"))
    );
    if (activeParent) {
      setExpanded((prev) => ({ ...prev, [activeParent.title]: true }));
    }
  }, [pathname]);

  const toggleExpand = (title: string) => {
    setExpanded((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col fixed top-0 left-0 h-screen z-40 transition-all duration-300 ease-in-out w-[var(--sidebar-width,250px)]",
        "bg-[var(--sidebar-bg,#ffffff)] border-r border-[var(--sidebar-border,#e2e4eb)]",
        className
      )}
    >
      {/* Screenshot Logo Style with Theme Adaptability */}
      <div className="flex items-center justify-between px-5 h-[var(--header-height,64px)] border-b border-[var(--sidebar-border,#e2e4eb)] shrink-0 bg-transparent">
        <div className="flex items-center">
          <div className="px-3.5 py-1.5 rounded bg-[var(--accent,#0ea5e9)] flex items-center justify-center shadow-sm">
            <span className="text-[11px] font-black text-white uppercase tracking-wider">
              CRM SYSTEM
            </span>
          </div>
        </div>
        <button className="text-[var(--foreground-muted,#94a3b8)] hover:text-[var(--foreground,#0f172a)] transition-colors p-1 cursor-pointer">
          <X size={16} />
        </button>
      </div>

      {/* Menu List */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5 bg-transparent">
        {navigation.map((item) => {
          const hasSubItems = !!item.subItems;
          const isExpanded = !!expanded[item.title];
          
          // Main item is active if path matches directly OR matches any of its sub-items
          const isMainActive = hasSubItems
            ? item.subItems?.some((sub) => pathname === sub.href || pathname.startsWith(sub.href + "?"))
            : pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href || ""));

          return (
            <div key={item.title} className="space-y-0.5">
              {hasSubItems ? (
                // Accordion Trigger Link
                <button
                  onClick={() => toggleExpand(item.title)}
                  className={cn(
                    "flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-150 group cursor-pointer",
                    isMainActive
                      ? "text-[var(--accent,#6366f1)] bg-[var(--accent-muted,rgba(99,102,241,0.15))]"
                      : "text-[var(--foreground-secondary,#475569)] hover:text-[var(--foreground,#0f172a)] hover:bg-[var(--sidebar-hover,#f1f3f8)]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "shrink-0 transition-colors",
                        isMainActive ? "text-[var(--accent,#6366f1)]" : "text-[var(--foreground-muted,#94a3b8)] group-hover:text-[var(--foreground-secondary,#475569)]"
                      )}
                    >
                      {item.icon}
                    </span>
                    <span>{item.title}</span>
                  </div>
                  <ChevronRight 
                    size={14} 
                    className={cn(
                      "transition-all duration-250",
                      isExpanded ? "rotate-90" : "",
                      isMainActive ? "text-[var(--accent,#6366f1)]" : "text-[var(--foreground-muted,#94a3b8)] group-hover:text-[var(--foreground-secondary,#475569)]"
                    )}
                  />
                </button>
              ) : (
                // Simple Navigation Link
                <Link
                  href={item.href || "#"}
                  title={item.title}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-150 group",
                    isMainActive
                      ? "text-[var(--accent,#6366f1)] bg-[var(--accent-muted,rgba(99,102,241,0.15))]"
                      : "text-[var(--foreground-secondary,#475569)] hover:text-[var(--foreground,#0f172a)] hover:bg-[var(--sidebar-hover,#f1f3f8)]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "shrink-0 transition-colors",
                        isMainActive ? "text-[var(--accent,#6366f1)]" : "text-[var(--foreground-muted,#94a3b8)] group-hover:text-[var(--foreground-secondary,#475569)]"
                      )}
                    >
                      {item.icon}
                    </span>
                    <span>{item.title}</span>
                  </div>
                  <ChevronRight 
                    size={14} 
                    className={cn(
                      "transition-colors",
                      isMainActive ? "text-[var(--accent,#6366f1)]" : "text-[var(--foreground-muted,#94a3b8)] group-hover:text-[var(--foreground-secondary,#475569)]"
                    )}
                  />
                </Link>
              )}

              {/* Accordion Sub-Menu Content */}
              {hasSubItems && isExpanded && (
                <div className="space-y-0.5 transition-all duration-300">
                  {item.subItems?.map((sub) => {
                    const isSubActive = pathname === sub.href || pathname.startsWith(sub.href + "?");
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={cn(
                          "flex items-center px-4 py-2 text-xs font-semibold rounded-lg transition-colors pl-[44px]",
                          isSubActive
                            ? "text-[var(--accent,#6366f1)] hover:text-[var(--accent-hover,#818cf8)]"
                            : "text-[var(--foreground-secondary,#475569)] hover:text-[var(--foreground,#0f172a)] hover:bg-[var(--sidebar-hover,#f1f3f8)]/40"
                        )}
                      >
                        {sub.title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
