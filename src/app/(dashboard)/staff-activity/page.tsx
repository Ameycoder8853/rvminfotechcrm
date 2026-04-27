"use client";

import { useState, useEffect } from "react";
import { Users, Activity, CheckCircle2, AlertCircle, Clock, MapPin, Loader2 } from "lucide-react";
import StatusBadge from "@/components/shared/status-badge";

export default function StaffActivityPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchActivity = async () => {
      try {
        // Fetching attendance as proxy for activity, could be expanded to real logs
        const res = await fetch("/api/attendance");
        if (!res.ok) throw new Error("Activity fetch failed");
        
        const data = await res.json();
        if (data.success) {
          // Map attendance to "Activity" objects
          const mapped = data.data.map((a: any) => ({
            id: a._id,
            user: a.user,
            action: a.type === "check_in" ? "Checked in for field work" : "Checked out from site",
            timestamp: a.timestamp,
            location: a.address,
            type: a.type
          }));
          setActivities(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch activity:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Check Employee Activity</h1>
        <p className="text-sm text-[var(--foreground-secondary)] mt-1">Monitor staff performance and site engagement</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Activity size={20} className="text-[var(--accent)]" />
            <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">Live Activity Feed</h3>
          </div>

          <div className="space-y-6">
            {loading ? (
              <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-[var(--accent)]" /></div>
            ) : activities.map((item) => (
              <div key={item.id} className="flex gap-4 relative">
                <div className="absolute top-8 bottom-0 left-4 w-px bg-[var(--border)] -mb-6 last:hidden" />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${item.type === "check_in" ? "bg-[var(--success-muted)] text-[var(--success)]" : "bg-[var(--danger-muted)] text-[var(--danger)]"}`}>
                  {item.type === "check_in" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                </div>
                <div className="flex-1 min-w-0 pb-6 border-b border-[var(--border)] last:border-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-bold text-[var(--foreground)]">{item.user?.firstName} {item.user?.lastName}</p>
                    <span className="text-[10px] font-medium text-[var(--foreground-muted)]">{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-[var(--foreground-secondary)] mb-2 font-medium">{item.action}</p>
                  <div className="flex items-center gap-1 text-[10px] text-[var(--foreground-muted)] font-bold uppercase tracking-wider">
                    <MapPin size={10} />
                    <span>{item.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Summary */}
        <div className="space-y-6">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
             <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider mb-4">Staff On-Duty</h3>
             <div className="space-y-4">
                {/* Simplified list */}
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--accent-muted)] flex items-center justify-center text-[var(--accent)] text-[10px] font-bold">AP</div>
                      <span className="text-sm font-bold text-[var(--foreground)]">Amit Patel</span>
                   </div>
                   <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--accent-muted)] flex items-center justify-center text-[var(--accent)] text-[10px] font-bold">PS</div>
                      <span className="text-sm font-bold text-[var(--foreground)]">Priya Sharma</span>
                   </div>
                   <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
