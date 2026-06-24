"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
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
  ChevronLeft,
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
          { title: "Sales Calls", href: "/comms" },
          { title: "Enquiries", href: "/enquiries" },
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
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({ className, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [sidebarLoading, setSidebarLoading] = useState(true);
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();

  // Fast client-side fallback using Clerk metadata to prevent blank sidebar
  useEffect(() => {
    if (clerkLoaded && clerkUser) {
      const tier = (clerkUser.publicMetadata?.roleTier as string) || "junior";
      setCurrentUser((prev: any) => {
        if (prev && prev.clerkId === clerkUser.id) {
          return prev;
        }
        return {
          clerkId: clerkUser.id,
          firstName: clerkUser.firstName || "Staff",
          lastName: clerkUser.lastName || "Member",
          email: clerkUser.primaryEmailAddress?.emailAddress || "",
          avatar: clerkUser.imageUrl || "",
          roleTier: tier,
          permissions: prev?.permissions || {},
          teamId: prev?.teamId || null,
        };
      });
      setSidebarLoading(false);
    }
  }, [clerkUser, clerkLoaded]);

  // Fetch current user details from DB
  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch("/api/users/me");
        const data = await res.json();
        if (data.success && data.data) {
          setCurrentUser(data.data);
        }
      } catch (err) {
        console.error("Failed to load user details in sidebar:", err);
      } finally {
        setSidebarLoading(false);
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
    if (isSuperAdmin) {
      return navigationSections
        .map((section) => {
          if (section.category === "Overview") {
            return {
              ...section,
              items: section.items.filter((item) => item.title === "Dashboard"),
            };
          }
          return null;
        })
        .filter((section): section is NavSection => section !== null && section.items.length > 0);
    }

    const isAdmin = currentUser.roleTier === "admin";
    const isSenior = currentUser.roleTier === "senior";

    // Retrieve permissions
    const userPerms = currentUser.permissions;
    const rawTeam = currentUser.teamId;
    const teamPerms = (rawTeam && typeof rawTeam === "object" && "permissions" in rawTeam)
      ? (rawTeam.permissions as any)
      : null;

    const defaultFallback = (currentUser.roleTier === "admin") ? "all" : "none";
    const leadsPerm = userPerms?.leads || teamPerms?.leads || defaultFallback;
    const customersPerm = userPerms?.customers || teamPerms?.customers || defaultFallback;
    const invoicesPerm = userPerms?.invoices || teamPerms?.invoices || defaultFallback;
    const ticketsPerm = userPerms?.tickets || teamPerms?.tickets || defaultFallback;

    return navigationSections
      .map((section) => {
        const filteredItems = section.items.filter((item) => {
          // 1. Super admin / Admin has full access to everything
          if (isAdmin) return true;

          // 2. Hide "Team" for Junior representatives
          if (item.title === "Team" && !isSenior) return false;

          // 3. Filter other items based on team module permissions
          if (item.title === "Lead Management" && leadsPerm === "none") return false;
          if (item.title === "Contact Management" && customersPerm === "none") return false;
          if (item.title === "Complaints" && ticketsPerm === "none") return false;
          if (item.title === "AMC" && ticketsPerm === "none") return false;
          if (item.title === "Installation" && ticketsPerm === "none") return false;
          if (item.title === "Quotations" && invoicesPerm === "none") return false;
          if (item.title === "Orders" && invoicesPerm === "none") return false;
          if (item.title === "Expenses" && invoicesPerm === "none") return false;
          if (item.title === "Inventory" && invoicesPerm === "none") return false;
          if (item.title === "Marketing" && leadsPerm === "none") return false;

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

  if (sidebarLoading) {
    return (
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed top-0 left-0 h-screen z-40 bg-sidebar-bg border-r border-sidebar-border animate-fade-in transition-all duration-300 ease-in-out",
          isCollapsed ? "w-18" : "w-65",
          className
        )}
      >
        {/* Brand Header */}
        <div className={cn(
          "flex items-center h-header-height border-b border-sidebar-border shrink-0 bg-transparent transition-all duration-300",
          isCollapsed ? "justify-center px-0" : "px-5"
        )}>
          <div className="w-9.5 h-9.5 rounded-[11px] bg-accent/25 animate-pulse shrink-0" />
          {!isCollapsed && <div className="ml-3 h-5 w-24 bg-surface-hover animate-pulse rounded-md" />}
        </div>
        {/* Skeleton items */}
        {!isCollapsed ? (
          <div className="flex-1 p-4 space-y-6">
            <div className="space-y-3">
              <div className="h-3 w-16 bg-surface-hover animate-pulse rounded-md" />
              <div className="h-9 w-full bg-surface-hover animate-pulse rounded-lg" />
              <div className="h-9 w-full bg-surface-hover animate-pulse rounded-lg" />
            </div>
            <div className="space-y-3">
              <div className="h-3 w-20 bg-surface-hover animate-pulse rounded-md" />
              <div className="h-9 w-full bg-surface-hover animate-pulse rounded-lg" />
              <div className="h-9 w-full bg-surface-hover animate-pulse rounded-lg" />
              <div className="h-9 w-full bg-surface-hover animate-pulse rounded-lg" />
            </div>
          </div>
        ) : (
          <div className="flex-1 py-4 space-y-6 flex flex-col items-center">
            <div className="w-8 h-8 rounded-lg bg-surface-hover animate-pulse" />
            <div className="w-8 h-8 rounded-lg bg-surface-hover animate-pulse" />
            <div className="w-8 h-8 rounded-lg bg-surface-hover animate-pulse" />
            <div className="w-8 h-8 rounded-lg bg-surface-hover animate-pulse" />
          </div>
        )}
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col fixed top-0 left-0 h-screen z-40 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-18" : "w-65",
        "bg-sidebar-bg border-r border-sidebar-border",
        className
      )}
    >
      {/* Desktop Collapse Toggle Button */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-5 z-50 w-6 h-6 rounded-full border border-sidebar-border bg-sidebar-bg items-center justify-center text-foreground-muted hover:text-foreground shadow-sm cursor-pointer transition-transform duration-200"
        >
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      )}

      {/* Brand Header: Beautiful logo squircle and gradient-text exact matching screenshot */}
      <div className={cn(
        "flex items-center h-header-height border-b border-sidebar-border shrink-0 bg-transparent transition-all duration-300 relative",
        isCollapsed ? "justify-center px-0" : "justify-between px-5"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-9.5 h-9.5 rounded-[11px] bg-accent flex items-center justify-center shadow-sm shrink-0">
            <Layers size={19} className="text-white stroke-[2.2]" />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold tracking-tight text-foreground animate-fade-in whitespace-nowrap">
              RVM <span className="gradient-text">CRM</span>
            </span>
          )}
        </div>
        {!isCollapsed && (
          <button className="lg:hidden text-foreground-muted hover:text-foreground transition-colors p-1 cursor-pointer">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Menu List structured in Premium Sections */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 bg-transparent scrollbar-thin transition-all duration-300">
        {visibleSections.map((section) => (
          <div key={section.category} className="space-y-1.5">
            {isCollapsed ? (
              <div className="mx-2 my-3 border-t border-sidebar-border/50" />
            ) : (
              <div className="px-4 text-[10px] font-bold tracking-wider text-foreground-muted uppercase transition-all duration-300">
                {section.category}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const hasSubItems = !!item.subItems;
                const isExpanded = !!expanded[item.title];
                
                const isMainActive = hasSubItems
                  ? item.subItems?.some((sub) => pathname === sub.href || pathname.startsWith(sub.href + "?"))
                  : pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href || ""));

                // If collapsed, clicking an item with subItems navigates directly to the first subItem
                const itemTargetHref = hasSubItems ? item.subItems?.[0]?.href : item.href;

                return (
                  <div key={item.title} className="space-y-0.5">
                    {hasSubItems && !isCollapsed ? (
                      <button
                        onClick={() => toggleExpand(item.title)}
                        className={cn(
                          "flex items-center justify-between w-full px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 group cursor-pointer",
                          isMainActive
                            ? "text-accent bg-accent-muted"
                            : "text-foreground-secondary hover:text-foreground hover:bg-sidebar-hover"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "shrink-0 transition-colors",
                              isMainActive ? "text-accent" : "text-foreground-muted group-hover:text-foreground-secondary"
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
                            isMainActive ? "text-accent" : "text-foreground-muted group-hover:text-foreground-secondary"
                          )}
                        />
                      </button>
                    ) : (
                      <Link
                        href={itemTargetHref || "#"}
                        title={item.title}
                        className={cn(
                          "flex items-center transition-all duration-150 group",
                          isCollapsed 
                            ? "justify-center w-10 h-10 mx-auto rounded-xl animate-fade-in"
                            : "justify-between px-4 py-2 rounded-lg w-full text-sm font-semibold",
                          isMainActive
                            ? "text-accent bg-accent-muted"
                            : "text-foreground-secondary hover:text-foreground hover:bg-sidebar-hover"
                        )}
                      >
                        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
                          <span
                            className={cn(
                              "shrink-0 transition-colors",
                              isMainActive ? "text-accent" : "text-foreground-muted group-hover:text-foreground-secondary"
                            )}
                          >
                            {item.icon}
                          </span>
                          {!isCollapsed && <span className="animate-fade-in whitespace-nowrap">{item.title}</span>}
                        </div>
                        {!isCollapsed && (
                          <ChevronRight 
                            size={14} 
                            className={cn(
                              "transition-colors",
                              isMainActive ? "text-accent" : "text-foreground-muted group-hover:text-foreground-secondary"
                            )}
                          />
                        )}
                      </Link>
                    )}

                    {hasSubItems && !isCollapsed && (
                      <div
                        className={cn(
                          "grid transition-all duration-300 ease-in-out",
                          isExpanded ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0 pointer-events-none"
                        )}
                      >
                        <div className="overflow-hidden space-y-0.5">
                          {item.subItems?.map((sub) => {
                            const isSubActive = pathname === sub.href || pathname.startsWith(sub.href + "?");
                            return (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                className={cn(
                                  "flex items-center px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors pl-11",
                                  isSubActive
                                    ? "text-accent hover:text-accent-hover"
                                    : "text-foreground-secondary hover:text-foreground hover:bg-sidebar-hover/40"
                                )}
                              >
                                {sub.title}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile Footer Section displaying Roles & Details */}
      {currentUser && (
        <div className={cn(
          "p-4 border-t border-sidebar-border bg-background-secondary/25 flex flex-col gap-3 shrink-0 transition-all duration-300",
          isCollapsed ? "items-center" : ""
        )}>
          <div className={cn("flex items-center w-full", isCollapsed ? "justify-center" : "gap-3")}>
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.firstName} className="w-10 h-10 rounded-xl object-cover border border-border shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-accent-muted text-accent font-bold text-sm flex items-center justify-center shrink-0">
                {`${currentUser.firstName?.[0] || ""}${currentUser.lastName?.[0] || ""}`.toUpperCase() || "U"}
              </div>
            )}
            {!isCollapsed && (
              <div className="min-w-0 flex-1 animate-fade-in">
                <p className="text-sm font-bold text-foreground truncate">{currentUser.firstName} {currentUser.lastName}</p>
                <p className="text-xs text-foreground-secondary truncate">{currentUser.email}</p>
              </div>
            )}
          </div>
          
          {!isCollapsed && (
            <div className="flex items-center justify-between mt-1 animate-fade-in">
              <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Session Role</span>
              {currentUser.roleTier === "super_admin" ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_8px_rgba(168,85,247,0.1)]">
                  Super Admin
                </span>
              ) : currentUser.roleTier === "admin" ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Company Admin
                </span>
              ) : currentUser.roleTier === "senior" ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Senior Manager
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-slate-500/10 text-slate-400 border border-slate-500/20">
                  Junior Rep
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
