"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export type PermissionLevel = "none" | "read" | "write" | "all";

export interface PermissionState {
  hasAccess: boolean; // true if level is "read", "write", or "all"
  canWrite: boolean;  // true if level is "write" or "all"
  level: PermissionLevel;
  loading: boolean;
}

export function usePermission(moduleKey: "leads" | "customers" | "invoices" | "tickets"): PermissionState {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const [dbUser, setDbUser] = useState<any | null>(null);
  const [dbLoading, setDbLoading] = useState(true);
  const [activeServices, setActiveServices] = useState<string[] | null>(null);
  const [customizationLoaded, setCustomizationLoaded] = useState(false);

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch("/api/users/me");
        const data = await res.json();
        if (data.success && data.data) {
          setDbUser(data.data);
        }
      } catch (err) {
        console.error("Failed to load user in usePermission:", err);
      } finally {
        setDbLoading(false);
      }
    }
    fetchMe();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loadConfig = () => {
        const stored = localStorage.getItem("crm_custom_dashboards");
        if (stored) {
          try {
            const list = JSON.parse(stored);
            const active = list.find((d: any) => d.isActive);
            if (active) {
              setActiveServices(active.services);
            } else {
              setActiveServices(null);
            }
          } catch (e) {
            console.error("Failed to parse custom dashboards in usePermission:", e);
          }
        }
        setCustomizationLoaded(true);
      };

      loadConfig();
      window.addEventListener("dashboardConfigUpdated", loadConfig);
      return () => {
        window.removeEventListener("dashboardConfigUpdated", loadConfig);
      };
    } else {
      setCustomizationLoaded(true);
    }
  }, []);

  const loading = !clerkLoaded || dbLoading || !customizationLoaded;

  // 1. Check active services list if set (applies globally to all roles, ensuring customized layout restriction is absolute)
  if (activeServices && typeof window !== "undefined") {
    const path = window.location.pathname;
    let requiredService: string | null = null;
    
    if (path.startsWith("/orders")) requiredService = "orders";
    else if (path.startsWith("/quotes")) requiredService = "quotes";
    else if (path.startsWith("/expenses")) requiredService = "expenses";
    else if (path.startsWith("/inventory")) requiredService = "inventory";
    else if (path.startsWith("/amc")) requiredService = "amc";
    else if (path.startsWith("/tickets")) requiredService = "tickets";
    else if (path.startsWith("/installations")) requiredService = "installations";
    else if (path.startsWith("/contacts")) requiredService = "contacts";
    else if (path.startsWith("/leads")) requiredService = "leads";
    else if (path.startsWith("/diary")) requiredService = "diary";
    else if (path.startsWith("/marketing")) requiredService = "marketing";
    else if (path.startsWith("/teams")) requiredService = "teams";
    else if (path.startsWith("/attendance")) requiredService = "attendance";

    if (requiredService && !activeServices.includes(requiredService)) {
      return { hasAccess: false, canWrite: false, level: "none", loading };
    }
  }

  // 2. Resolve roleTier
  const roleTier = dbUser?.roleTier || (clerkUser?.publicMetadata?.roleTier as string) || "junior";
  const isSuperAdmin = roleTier === "super_admin";
  const isAdmin = roleTier === "admin" || isSuperAdmin;

  // 3. Admins/Super Admins have full access to active modules
  if (isAdmin) {
    return { hasAccess: true, canWrite: true, level: "all", loading };
  }

  // 4. Resolve permissions
  const userPerms = dbUser?.permissions;
  const rawTeam = dbUser?.teamId;
  const teamPerms = (rawTeam && typeof rawTeam === "object" && "permissions" in rawTeam)
    ? (rawTeam.permissions as any)
    : null;

  const defaultFallback = (roleTier === "super_admin" || roleTier === "admin") ? "all" : "none";
  const permLevel = (userPerms?.[moduleKey] || teamPerms?.[moduleKey] || defaultFallback) as PermissionLevel;

  return {
    hasAccess: permLevel !== "none",
    canWrite: permLevel === "write" || permLevel === "all",
    level: permLevel,
    loading,
  };
}
