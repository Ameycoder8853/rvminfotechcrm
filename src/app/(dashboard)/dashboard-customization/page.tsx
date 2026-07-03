"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Layers,
  Plus,
  CheckCircle2,
  Star,
  Eye,
  Edit,
  Copy,
  Trash2,
  LayoutGrid,
  Sliders,
  Sparkles,
  ArrowLeft,
  Check
} from "lucide-react";

export default function DashboardCustomizationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const action = searchParams.get("action") || "manager";

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user details
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/users/me");
        const json = await res.json();
        if (json.success && json.data) {
          setCurrentUser(json.data);
        }
      } catch (err) {
        console.error("Failed to load user details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  const companyName = currentUser?.orgId?.name || "RV Softech";
  const dashboardTitle = currentUser?.orgId?.name ? `${currentUser.orgId.name} CRM` : "RV CRM";

  // Navigation handlers
  const navigateTo = (act: string) => {
    if (act === "manager") {
      router.push("/dashboard-customization");
    } else {
      router.push(`/dashboard-customization?action=${act}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-2 lg:p-4 bg-background min-h-screen">
      {/* -------------------- 1. DASHBOARD MANAGER VIEW -------------------- */}
      {action === "manager" && (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface border border-border rounded-2xl p-6 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">
                Dashboard Manager
              </h2>
              <p className="text-xs text-foreground-secondary">
                Manage your customized CRM dashboards. Create, edit, and switch between different configurations.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigateTo("templates")}
                className="flex items-center gap-2 px-4 py-2.5 bg-background border border-border hover:bg-surface-hover text-foreground-secondary hover:text-foreground rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <Layers size={14} />
                <span>Use Template</span>
              </button>
              <button 
                onClick={() => navigateTo("create")}
                className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                <Plus size={14} />
                <span>Create Custom Dashboard</span>
              </button>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Metric 1 */}
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                1
              </div>
              <div>
                <div className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Total Dashboards</div>
                <div className="text-sm font-bold text-foreground">1</div>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Active Dashboard</div>
                <div className="text-sm font-bold text-foreground">
                  {dashboardTitle}
                </div>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-600/10 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xs font-bold">
                7
              </div>
              <div>
                <div className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Total Services</div>
                <div className="text-sm font-bold text-foreground">7</div>
              </div>
            </div>
          </div>

          {/* Your Dashboards Section */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-3">
              Your Dashboards
            </h3>
            
            {/* Dashboard List Item */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-background-secondary border border-border rounded-xl">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-foreground">
                    {dashboardTitle}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 uppercase tracking-wide">
                    Active
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-foreground-secondary">
                  <div>
                    <span className="font-medium text-foreground-muted">Company:</span>{" "}
                    <span className="font-semibold text-foreground">{companyName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground-muted">Created:</span>{" "}
                    <span>Aug 22, 2025</span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground-muted">Services:</span>{" "}
                    <span className="font-semibold text-foreground">7</span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground-muted">Period:</span>{" "}
                    <span>Aug 23, 2025 - Aug 24, 2025</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button className="p-2 text-yellow-500 hover:bg-surface-hover rounded-lg transition-colors cursor-pointer">
                  <Star size={16} fill="currentColor" />
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 bg-background border border-border hover:bg-surface-hover text-foreground rounded-lg text-xs font-semibold transition-colors cursor-pointer">
                  <Eye size={13} />
                  <span>View</span>
                </button>
                <button 
                  onClick={() => navigateTo("create")}
                  className="flex items-center gap-1.5 px-3 py-2 bg-background border border-border hover:bg-surface-hover text-foreground rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Edit size={13} />
                  <span>Edit</span>
                </button>
                <button className="p-2 bg-background border border-border hover:bg-surface-hover text-foreground rounded-lg transition-colors cursor-pointer" title="Duplicate">
                  <Copy size={13} />
                </button>
                <button className="p-2 bg-danger/10 hover:bg-danger/25 text-danger rounded-lg transition-colors cursor-pointer" title="Delete">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 2. CREATE CUSTOM DASHBOARD VIEW -------------------- */}
      {action === "create" && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigateTo("manager")}
              className="p-2 bg-surface hover:bg-surface-hover border border-border rounded-xl text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-foreground">Create Custom Dashboard</h2>
              <p className="text-xs text-foreground-secondary">Configure a custom layout structure, colors, and active panels</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: General configuration */}
            <div className="md:col-span-2 space-y-6">
              {/* Form Settings */}
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Active Dashboard Widgets</h3>
                <div className="space-y-3">
                  {[
                    { name: "Sales Conversion Funnel", desc: "Stages analytics funnel chart" },
                    { name: "Lead Pipeline Statistics", desc: "Interactive cards row" },
                    { name: "Ticket Resolution Progress", desc: "Backlog metrics tracker" },
                    { name: "Recent Comms Activity Log", desc: "Feed list of communications" },
                    { name: "Executive Finance Panel", desc: "Billing & AMC milestones" }
                  ].map((widget, i) => (
                    <label key={i} className="flex items-center justify-between p-3 bg-background-secondary border border-border rounded-xl cursor-pointer hover:border-accent/40 transition-colors">
                      <div>
                        <div className="text-xs font-bold text-foreground">{widget.name}</div>
                        <div className="text-[10px] text-foreground-secondary">{widget.desc}</div>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border text-accent focus:ring-accent accent-accent cursor-pointer" />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Layout configuration */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Layout Density & Grid</h3>
                <div>
                  <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Primary Layout Structure</label>
                  <select className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:border-accent outline-none font-medium cursor-pointer">
                    <option>3-Column Balanced Dashboard (Recommended)</option>
                    <option>2-Column Left Weighted Sidebar Grid</option>
                    <option>Single Column Full Scroll Layout</option>
                    <option>Compact Metrics Focus Layout</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Theme Color Accent Glow</label>
                  <div className="flex gap-2.5 mt-1">
                    {["#6366f1", "#d946ef", "#06b6d4", "#10b981", "#f59e0b"].map((c, i) => (
                      <button key={i} className={`w-8 h-8 rounded-full border border-white/20 shadow-lg cursor-pointer ${i === 0 ? "ring-2 ring-accent ring-offset-2" : ""}`} style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-border/50 flex gap-3 justify-end">
                  <button 
                    onClick={() => navigateTo("manager")}
                    className="px-4 py-2 bg-background hover:bg-surface-hover border border-border text-foreground rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => navigateTo("manager")}
                    className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    Save Layout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 3. DASHBOARD TEMPLATES VIEW -------------------- */}
      {action === "templates" && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigateTo("manager")}
              className="p-2 bg-surface hover:bg-surface-hover border border-border rounded-xl text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-foreground">Dashboard Templates</h2>
              <p className="text-xs text-foreground-secondary">Select from pre-configured layouts to jumpstart dashboard layouts</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Sales Executive Hub", desc: "Visualizes leads, conversion funnels, targets and planner lists.", widgets: 4, type: "Recommended" },
              { title: "Operations & Ticket Hub", desc: "Tracks ticketing support, resolutions, installations and AMCs.", widgets: 3, type: "Utility" },
              { title: "Financial & Client Overview", desc: "Focuses on quotes, invoice statuses, expense ratios and summaries.", widgets: 5, type: "Management" }
            ].map((tmpl, i) => (
              <div key={i} className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between h-52 hover:border-accent/40 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-accent-muted text-accent uppercase tracking-wide">{tmpl.type}</span>
                    <span className="text-[10px] text-foreground-muted font-medium">{tmpl.widgets} widgets</span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1.5">{tmpl.title}</h3>
                  <p className="text-xs text-foreground-secondary line-clamp-3">{tmpl.desc}</p>
                </div>
                <button 
                  onClick={() => navigateTo("manager")}
                  className="w-full text-center py-2 bg-background-secondary border border-border hover:border-accent/30 text-foreground rounded-xl text-xs font-semibold transition-colors cursor-pointer mt-4"
                >
                  Use Template
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------- 4. MY CUSTOM DASHBOARDS VIEW -------------------- */}
      {action === "my-dashboards" && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigateTo("manager")}
              className="p-2 bg-surface hover:bg-surface-hover border border-border rounded-xl text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-foreground">My Custom Dashboards</h2>
              <p className="text-xs text-foreground-secondary">Quick access to all configurations matching {companyName}</p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-background-secondary border border-border rounded-xl">
              <div className="space-y-1">
                <div className="text-sm font-bold text-foreground">{dashboardTitle}</div>
                <div className="text-xs text-foreground-secondary">Active dashboard layout for organizational overview</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-2 bg-background border border-border hover:bg-surface-hover text-foreground rounded-lg text-xs font-semibold transition-colors cursor-pointer">
                  <Star size={13} className="text-yellow-500" fill="currentColor" />
                  <span>Favorited</span>
                </button>
                <button 
                  onClick={() => navigateTo("manager")}
                  className="flex items-center gap-1.5 px-3 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <span>Go to Manager</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
