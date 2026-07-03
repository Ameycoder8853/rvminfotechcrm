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
  Check,
  Users,
  Phone,
  Calendar,
  FileText,
  ShoppingCart,
  Shield,
  Clock,
  Home,
  AlertCircle,
  Briefcase,
  CreditCard,
  Archive,
  Megaphone
} from "lucide-react";

interface Service {
  id: string;
  title: string;
  category: string;
  categoryBadge: string;
  desc: string;
}

const allServices: Service[] = [
  { id: "contacts", title: "Contact Management", category: "CRM & Sales", categoryBadge: "Sales", desc: "Manage company contacts & relations" },
  { id: "leads", title: "Lead Management", category: "CRM & Sales", categoryBadge: "Sales", desc: "Track lead pipelines & qualifications" },
  { id: "diary", title: "Tasks & Planner", category: "CRM & Sales", categoryBadge: "Productivity", desc: "Planner board and calendar diaries" },
  { id: "quotes", title: "Quotations", category: "CRM & Sales", categoryBadge: "Sales", desc: "Generate proposal quotes & PDF templates" },
  { id: "orders", title: "Orders", category: "CRM & Sales", categoryBadge: "Sales", desc: "Track sales orders, payments & billing" },
  { id: "amc", title: "AMC", category: "Operations", categoryBadge: "Service", desc: "Annual Maintenance Contracts monitoring" },
  { id: "tickets", title: "Complaints", category: "Operations", categoryBadge: "Service", desc: "Handle customer complaints" },
  { id: "installations", title: "Installation", category: "Operations", categoryBadge: "Service", desc: "Manage installation services" },
  { id: "inventory", title: "Inventory", category: "Operations", categoryBadge: "Operations", desc: "Manage stock and inventory" },
  { id: "expenses", title: "Expenses", category: "Admin & Internal", categoryBadge: "Finance", desc: "Track and manage expenses" },
  { id: "marketing", title: "Marketing", category: "Admin & Internal", categoryBadge: "Marketing", desc: "Marketing campaigns and analytics" },
  { id: "teams", title: "Team", category: "Admin & Internal", categoryBadge: "HR", desc: "Team management and collaboration" },
  { id: "attendance", title: "Attendance", category: "Admin & Internal", categoryBadge: "HR", desc: "Track employee attendance" },
  { id: "invoices", title: "Invoices", category: "Operations", categoryBadge: "Finance", desc: "Raise invoices and billing statements" },
  { id: "add_task", title: "Add Task", category: "CRM & Sales", categoryBadge: "Productivity", desc: "Add single planner task item directly" }
];

export default function DashboardCustomizationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const action = searchParams.get("action") || "manager";

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [formCompany, setFormCompany] = useState("");
  const [formDashboardName, setFormDashboardName] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([
    "contacts", "leads", "diary", "quotes", "orders"
  ]);
  const [searchServiceQuery, setSearchServiceQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");

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

  // Update default company and dashboard names once user loads
  useEffect(() => {
    if (currentUser) {
      const company = currentUser?.orgId?.name || "Startup";
      setFormCompany(company);
      setFormDashboardName(`${company} Essentials`);
    }
  }, [currentUser]);

  // Set default dates
  useEffect(() => {
    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0]; // YYYY-MM-DD
    setFormStartDate(formattedToday);

    const nextYear = new Date();
    nextYear.setFullYear(today.getFullYear() + 1);
    const formattedNextYear = nextYear.toISOString().split("T")[0];
    setFormEndDate(formattedNextYear);
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

  const toggleServiceSelection = (id: string) => {
    if (selectedServiceIds.includes(id)) {
      setSelectedServiceIds(selectedServiceIds.filter(srvId => srvId !== id));
    } else {
      setSelectedServiceIds([...selectedServiceIds, id]);
    }
  };

  // Filter services
  const filteredServices = allServices.filter(srv => {
    const matchesSearch = srv.title.toLowerCase().includes(searchServiceQuery.toLowerCase()) ||
                          srv.desc.toLowerCase().includes(searchServiceQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === "All" || srv.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const renderServiceIcon = (id: string) => {
    const iconClass = "text-foreground-muted";
    switch (id) {
      case "contacts": return <Users size={22} className={iconClass} />;
      case "leads": return <Phone size={22} className={iconClass} />;
      case "diary": return <Calendar size={22} className={iconClass} />;
      case "quotes": return <FileText size={22} className={iconClass} />;
      case "orders": return <ShoppingCart size={22} className={iconClass} />;
      case "amc": return <Shield size={22} className={iconClass} />;
      case "tickets": return <AlertCircle size={22} className={iconClass} />;
      case "installations": return <Briefcase size={22} className={iconClass} />;
      case "inventory": return <Archive size={22} className={iconClass} />;
      case "expenses": return <CreditCard size={22} className={iconClass} />;
      case "marketing": return <Megaphone size={22} className={iconClass} />;
      case "teams": return <Users size={22} className={iconClass} />;
      case "attendance": return <Clock size={22} className={iconClass} />;
      case "invoices": return <Sliders size={22} className={iconClass} />;
      default: return <Plus size={22} className={iconClass} />;
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
          {/* Header */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigateTo("manager")}
              className="p-2 bg-surface hover:bg-surface-hover border border-border rounded-xl text-foreground-secondary hover:text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-foreground">Create New Dashboard</h2>
              <p className="text-xs text-foreground-secondary">Configure your company details and select the services you want to include.</p>
            </div>
          </div>

          {/* Company Details Form */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Company Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Startup"
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Dashboard Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Startup Essentials"
                  value={formDashboardName}
                  onChange={(e) => setFormDashboardName(e.target.value)}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Start Date *</label>
                <input
                  type="date"
                  required
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">End Date *</label>
                <input
                  type="date"
                  required
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-accent outline-none font-medium transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Form Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Metric 1 */}
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Selected Services</div>
                <div className="text-sm font-bold text-foreground">{selectedServiceIds.length}</div>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Home size={20} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Available Services</div>
                <div className="text-sm font-bold text-foreground">{allServices.length}</div>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Megaphone size={20} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Categories</div>
                <div className="text-sm font-bold text-foreground">9</div>
              </div>
            </div>
          </div>

          {/* Select Services Area */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Select Services</h3>
            
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchServiceQuery}
                  onChange={(e) => setSearchServiceQuery(e.target.value)}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:border-accent outline-none font-medium"
                />
              </div>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:border-accent outline-none font-semibold cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="CRM & Sales">CRM & Sales</option>
                <option value="Operations">Operations</option>
                <option value="Admin & Internal">Admin & Internal</option>
              </select>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              {filteredServices.map(srv => {
                const isSelected = selectedServiceIds.includes(srv.id);
                return (
                  <div 
                    key={srv.id}
                    onClick={() => toggleServiceSelection(srv.id)}
                    className={`flex flex-col justify-between h-44 border rounded-2xl p-5 cursor-pointer relative select-none transition-all duration-200 ${
                      isSelected 
                        ? "border-accent bg-accent-muted/15" 
                        : "border-border bg-background-secondary hover:border-accent/40"
                    }`}
                  >
                    {/* Header: Icon + Toggle Button */}
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center shadow-sm">
                        {renderServiceIcon(srv.id)}
                      </div>
                      <button 
                        type="button"
                        className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                          isSelected 
                            ? "bg-accent border-accent text-white" 
                            : "border-border text-foreground-muted hover:border-accent/40 hover:text-foreground"
                        }`}
                      >
                        {isSelected ? <Check size={12} strokeWidth={3} /> : <Plus size={12} />}
                      </button>
                    </div>

                    {/* Title & Desc */}
                    <div className="mt-4">
                      <div className="text-xs font-bold text-foreground line-clamp-1">{srv.title}</div>
                      <div className="text-[10px] text-foreground-secondary line-clamp-1 mt-0.5">{srv.desc}</div>
                    </div>

                    {/* Badge */}
                    <div className="mt-3">
                      <span className="inline-block px-2 py-0.5 rounded bg-background border border-border text-[9px] font-semibold text-foreground-secondary">
                        {srv.categoryBadge}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Clear All / Select All Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 pb-2 border-t border-border/40">
              <button 
                type="button"
                onClick={() => setSelectedServiceIds([])}
                className="px-4 py-2 border border-border bg-background hover:bg-surface-hover text-foreground-secondary hover:text-foreground rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Clear All
              </button>
              <button 
                type="button"
                onClick={() => setSelectedServiceIds(allServices.map(s => s.id))}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Select All
              </button>
            </div>

            {/* Form Footer */}
            <div className="pt-4 border-t border-border/50 flex gap-3 justify-end">
              <button 
                type="button"
                onClick={() => navigateTo("manager")}
                className="px-4 py-2.5 bg-background hover:bg-surface-hover border border-border text-foreground rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={() => navigateTo("manager")}
                className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Layers size={14} />
                <span>Create Dashboard</span>
              </button>
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
              className="p-2 bg-surface hover:bg-surface-hover border border-border rounded-xl text-foreground-secondary hover:text-foreground transition-colors cursor-pointer"
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
              className="p-2 bg-surface hover:bg-surface-hover border border-border rounded-xl text-foreground-secondary hover:text-foreground transition-colors cursor-pointer"
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
