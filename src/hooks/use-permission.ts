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

  const loading = !clerkLoaded || dbLoading;

  // 1. Resolve roleTier
  const roleTier = dbUser?.roleTier || (clerkUser?.publicMetadata?.roleTier as string) || "junior";
  const isSuperAdmin = roleTier === "super_admin";
  const isAdmin = roleTier === "admin" || isSuperAdmin;

  // 2. Admins/Super Admins have full access
  if (isAdmin) {
    return { hasAccess: true, canWrite: true, level: "all", loading };
  }

  // 3. Resolve permissions
  const userPerms = dbUser?.permissions;
  const rawTeam = dbUser?.teamId;
  const teamPerms = (rawTeam && typeof rawTeam === "object" && "permissions" in rawTeam)
    ? (rawTeam.permissions as any)
    : null;

  const defaultFallback = "all";
  const permLevel = (userPerms?.[moduleKey] || teamPerms?.[moduleKey] || defaultFallback) as PermissionLevel;

  return {
    hasAccess: permLevel !== "none",
    canWrite: permLevel === "write" || permLevel === "all",
    level: permLevel,
    loading,
  };
}
