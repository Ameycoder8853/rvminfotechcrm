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
  X,
  Layers
} from "lucide-react";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ReactNode;
  subItems?: { title: string; href: string }[];
}

interface NavSection {
  category: string;
  items: NavItem[];
}

const navigationSections: NavSection[] = [
  {
    category: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: <LayoutDashboard size={18} />,
      },
    ]
  },
  {
    category: "CRM & Sales",
    items: [
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
        title: "Quotations",
        icon: <FileText size={18} />,
        subItems: [
          { title: "Quotation List", href: "/quotes" },
          { title: "Create Quotation", href: "/quotes?action=add" },
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
    ]
  },
  {
    category: "Operations",
    items: [
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
        title: "Inventory",
        href: "/inventory",
        icon: <Package size={18} />,
      },
    ]
  },
  {
    category: "Admin & Internal",
    items: [
      {
        title: "Expenses",
        icon: <Receipt size={18} />,
        subItems: [
          { title: "Expense List", href: "/expenses" },
          { title: "Claim Expense", href: "/expenses?action=add" },
        ],
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
    ]
  }
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  // Fetch current user details
  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch("/api/users/me");
        const data = await res.json();
        if (data.success) {
          setCurrentUser(data.data);
        }
      } catch (err) {
        console.error("Failed to load user details in sidebar:", err);
      }
    }
    fetchMe();
  }, []);

  // Auto-expand active page's parent menu on mount/route change
  useEffect(() => {
    let activeParent: NavItem | undefined;
    for (const section of navigationSections) {
      const found = section.items.find(
        (item) => item.subItems?.some((sub) => pathname === sub.href || pathname.startsWith(sub.href + "?"))
      );
      if (found) {
        activeParent = found;
        break;
      }
    }
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

  // Dynamically configure navigation list, filtering based on team permissions and roleTier
  const getFilteredSections = () => {
    if (!currentUser) return [];

    const isSuperAdmin = currentUser.roleTier === "super_admin";
    const isAdmin = currentUser.roleTier === "admin" || isSuperAdmin;
    const isSenior = currentUser.roleTier === "senior" || isSuperAdmin;

    // Retrieve permissions if teamId is populated
    const perms = currentUser.teamId?.permissions || {
      leads: "all",
      customers: "all",
      invoices: "all",
      tickets: "all",
    };

    return navigationSections
      .map((section) => {
        const filteredItems = section.items.filter((item) => {
          // 1. Super admin / Admin has full access to everything
          if (isAdmin) return true;

          // 2. Hide "Team" for Junior representatives
          if (item.title === "Team" && !isSenior) return false;

          // 3. Filter other items based on team module permissions
          if (item.title === "Lead Management" && perms.leads === "none") return false;
          if (item.title === "Contact Management" && perms.customers === "none") return false;
          if (item.title === "Complaints" && perms.tickets === "none") return false;
          if (item.title === "AMC" && perms.tickets === "none") return false;
          if (item.title === "Installation" && perms.tickets === "none") return false;
          if (item.title === "Quotations" && perms.invoices === "none") return false;
          if (item.title === "Orders" && perms.invoices === "none") return false;
          if (item.title === "Expenses" && perms.invoices === "none") return false;
          if (item.title === "Inventory" && perms.invoices === "none") return false;
          if (item.title === "Marketing" && perms.leads === "none") return false;

          return true;
        });

        return {
          ...section,
          items: filteredItems,
        };
      })
      .filter((section) => section.items.length > 0);
  };

  const visibleSections = getFilteredSections();
  if (currentUser?.roleTier === "super_admin") {
    visibleSections.push({
      category: "Super Admin Control",
      items: [
        {
          title: "Super Admin Operations",
          href: "/super-admin",
          icon: <Shield size={18} />,
        }
      ]
    });
  }

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col fixed top-0 left-0 h-screen z-40 transition-all duration-300 ease-in-out w-[var(--sidebar-width,250px)]",
        "bg-[var(--sidebar-bg,#ffffff)] border-r border-[var(--sidebar-border,#e2e4eb)]",
        className
      )}
    >
      {/* Brand Header: Beautiful logo squircle and gradient-text exact matching screenshot */}
      <div className="flex items-center justify-between px-5 h-[var(--header-height,64px)] border-b border-[var(--sidebar-border,#e2e4eb)] shrink-0 bg-transparent">
        <div className="flex items-center gap-3">
          <div className="w-[38px] h-[38px] rounded-[11px] bg-[var(--accent,#6366f1)] flex items-center justify-center shadow-sm shrink-0">
            <Layers size={19} className="text-white stroke-[2.2]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[var(--foreground)]">
            RVM <span className="gradient-text">CRM</span>
          </span>
        </div>
        <button className="lg:hidden text-[var(--foreground-muted,#94a3b8)] hover:text-[var(--foreground,#0f172a)] transition-colors p-1 cursor-pointer">
          <X size={16} />
        </button>
      </div>

      {/* Menu List structured in Premium Sections */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 bg-transparent scrollbar-thin">
        {visibleSections.map((section) => (
          <div key={section.category} className="space-y-1.5">
            <div className="px-4 text-[10px] font-bold tracking-wider text-[var(--foreground-muted,#94a3b8)] uppercase">
              {section.category}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const hasSubItems = !!item.subItems;
                const isExpanded = !!expanded[item.title];
                
                const isMainActive = hasSubItems
                  ? item.subItems?.some((sub) => pathname === sub.href || pathname.startsWith(sub.href + "?"))
                  : pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href || ""));

                return (
                  <div key={item.title} className="space-y-0.5">
                    {hasSubItems ? (
                      <button
                        onClick={() => toggleExpand(item.title)}
                        className={cn(
                          "flex items-center justify-between w-full px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 group cursor-pointer",
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
                      <Link
                        href={item.href || "#"}
                        title={item.title}
                        className={cn(
                          "flex items-center justify-between px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 group",
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

                    {hasSubItems && isExpanded && (
                      <div className="space-y-0.5 transition-all duration-300">
                        {item.subItems?.map((sub) => {
                          const isSubActive = pathname === sub.href || pathname.startsWith(sub.href + "?");
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              className={cn(
                                "flex items-center px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors pl-[44px]",
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
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
