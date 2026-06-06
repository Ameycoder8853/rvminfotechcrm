"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import SuperAdminDashboard from "@/components/dashboard/super-admin-dashboard";
import AdminDashboard from "@/components/dashboard/admin-dashboard";
import SeniorDashboard from "@/components/dashboard/senior-dashboard";
import JuniorDashboard from "@/components/dashboard/junior-dashboard";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      try {
        const [statsRes, userRes] = await Promise.all([
          fetch("/api/dashboard/stats"),
          fetch("/api/users/me")
        ]);
        
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.success) setStats(statsData.data);
        }
        
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.success) setCurrentUser(userData.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin mb-4" />
        <p className="text-sm font-bold text-[var(--foreground-muted)] uppercase tracking-[0.2em]">
          Aggregating Intelligence...
        </p>
      </div>
    );
  }

  const roleTier = currentUser?.roleTier || "junior";

  if (roleTier === "super_admin") {
    return <SuperAdminDashboard stats={stats} currentUser={currentUser} />;
  }

  if (roleTier === "admin") {
    return <AdminDashboard stats={stats} currentUser={currentUser} />;
  }

  if (roleTier === "senior") {
    return <SeniorDashboard stats={stats} currentUser={currentUser} />;
  }

  // Default to Junior dashboard
  return <JuniorDashboard stats={stats} currentUser={currentUser} />;
}
