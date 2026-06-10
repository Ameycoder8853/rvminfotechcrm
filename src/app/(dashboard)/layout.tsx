"use client";

import { useState, useEffect } from "react";
import { useClerk } from "@clerk/nextjs";
import { Loader2, Lock, Mail, LogOut } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { signOut } = useClerk();

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch("/api/users/me");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setCurrentUser(data.data);
          }
        }
      } catch (err) {
        console.error("Failed to load user details in dashboard layout:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
        <p className="text-sm font-bold text-foreground-muted uppercase tracking-[0.2em]">
          Verifying Identity...
        </p>
      </div>
    );
  }

  if (currentUser?.roleTier === "none") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface border border-border rounded-2xl p-8 text-center space-y-6 shadow-xl relative overflow-hidden">
          {/* Decorative radial gradient background */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-purple-500 to-accent" />
          
          <div className="mx-auto w-16 h-16 bg-accent-muted/10 border border-accent/20 rounded-2xl flex items-center justify-center text-accent">
            <Lock size={32} className="animate-pulse" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-foreground">Access Pending</h1>
            <p className="text-sm text-foreground-secondary leading-relaxed">
              Your account has been successfully created. However, you do not have active roles to access the software yet.
            </p>
          </div>

          <div className="bg-background-secondary/50 border border-border rounded-xl p-4 text-left space-y-3">
            <h3 className="text-xs font-bold text-foreground-muted uppercase tracking-wider">How to get access:</h3>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              An administrator must assign your role before you can begin using the platform. Please contact the <strong>RVM Infotech</strong> team.
            </p>
            <div className="pt-2 border-t border-border flex flex-col gap-2">
              <a 
                href="mailto:support@rvminfotech.com" 
                className="flex items-center gap-2 text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
              >
                <Mail size={14} />
                <span>support@rvminfotech.com</span>
              </a>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={async () => {
                await signOut();
                window.location.href = "/sign-in";
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-active hover:bg-surface-hover border border-border text-foreground rounded-xl text-sm font-semibold transition-all active:scale-95 cursor-pointer"
            >
              <LogOut size={16} />
              <span>Sign Out / Switch Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Navigation */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-sidebar-width min-h-screen flex flex-col transition-all duration-300">
        <Header onMenuClick={() => setMobileNavOpen(true)} />

        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
