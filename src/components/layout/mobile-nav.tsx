"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
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
  { title: "Team", href: "/teams", icon: <Users size={20} /> },
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
  const [mobileNavLoading, setMobileNavLoading] = useState(true);
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();

  // Fast client-side fallback using Clerk metadata to prevent blank drawer
  useEffect(() => {
    if (clerkLoaded && clerkUser && isOpen) {
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
      setMobileNavLoading(false);
    }
  }, [clerkUser, clerkLoaded, isOpen]);

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch("/api/users/me");
        const data = await res.json();
        if (data.success && data.data) {
          setCurrentUser(data.data);
        }
      } catch (err) {
        console.error("Failed to load user details in mobile-nav:", err);
      } finally {
        setMobileNavLoading(false);
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

    const userPerms = currentUser.permissions;
    const rawTeam = currentUser.teamId;
    const teamPerms = (rawTeam && typeof rawTeam === "object" && "permissions" in rawTeam)
      ? (rawTeam.permissions as any)
      : null;

    const defaultFallback = (currentUser.roleTier === "super_admin" || currentUser.roleTier === "admin") ? "all" : "none";
    const leadsPerm = userPerms?.leads || teamPerms?.leads || defaultFallback;
    const customersPerm = userPerms?.customers || teamPerms?.customers || defaultFallback;
    const invoicesPerm = userPerms?.invoices || teamPerms?.invoices || defaultFallback;
    const ticketsPerm = userPerms?.tickets || teamPerms?.tickets || defaultFallback;

    return navItems.filter((item) => {
      if (isAdmin) return true;

      // Hide "Team" for Junior representatives
      if (item.title === "Team" && !isSenior) return false;

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

  const visibleNavItems = getFilteredNavItems();

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
          "fixed top-0 left-0 z-50 h-full w-72 bg-sidebar-bg border-r border-sidebar-border transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col justify-between overflow-hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full justify-between">
          {/* Bottom segment / Top segment */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 h-header-height border-b border-sidebar-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[9px] bg-accent flex items-center justify-center shadow-sm shrink-0">
                  <Layers size={16} className="text-white stroke-[2.2]" />
                </div>
                <span className="text-lg font-bold tracking-tight text-foreground">
                  RVM <span className="gradient-text">CRM</span>
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-sidebar-hover transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav Items */}
            {mobileNavLoading ? (
              <div className="flex-1 p-4 space-y-6 overflow-y-auto">
                <div className="space-y-3">
                  <div className="h-9 w-full bg-surface-hover/50 animate-pulse rounded-lg" />
                  <div className="h-9 w-full bg-surface-hover/50 animate-pulse rounded-lg" />
                  <div className="h-9 w-full bg-surface-hover/50 animate-pulse rounded-lg" />
                </div>
                <div className="space-y-3">
                  <div className="h-9 w-full bg-surface-hover/50 animate-pulse rounded-lg" />
                  <div className="h-9 w-full bg-surface-hover/50 animate-pulse rounded-lg" />
                  <div className="h-9 w-full bg-surface-hover/50 animate-pulse rounded-lg" />
                </div>
              </div>
            ) : (
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
                          ? "bg-accent-muted text-accent-hover"
                          : "text-foreground-secondary hover:text-foreground hover:bg-sidebar-hover"
                      )}
                    >
                      <span className={cn("shrink-0", isActive ? "text-accent" : "")}>
                        {item.icon}
                      </span>
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* User Profile Footer Section */}
          {mobileNavLoading ? (
            <div className="p-4 border-t border-sidebar-border bg-background/40 flex flex-col gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-hover/50 animate-pulse shrink-0" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="h-4 w-28 bg-surface-hover/50 animate-pulse rounded" />
                  <div className="h-3.5 w-36 bg-surface-hover/50 animate-pulse rounded" />
                </div>
              </div>
            </div>
          ) : (
            currentUser && (
              <div className="p-4 border-t border-sidebar-border bg-background/40 flex flex-col gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.firstName} className="w-10 h-10 rounded-xl object-cover border border-border" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-accent-muted text-accent font-bold text-sm flex items-center justify-center shrink-0">
                      {`${currentUser.firstName?.[0] || ""}${currentUser.lastName?.[0] || ""}`.toUpperCase() || "U"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground truncate">{currentUser.firstName} {currentUser.lastName}</p>
                    <p className="text-xs text-foreground-secondary truncate">{currentUser.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-1">
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
              </div>
            )
          )}

          {/* Bottom Footer segment with Theme Toggle */}
          <div className="p-4 border-t border-sidebar-border bg-background/40 flex items-center justify-between shrink-0">
            <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Appearance</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </>
  );
}
