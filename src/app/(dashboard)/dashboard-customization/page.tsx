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
  Megaphone,
  X,
  FileSpreadsheet,
  AlertTriangle,
  UserCheck
} from "lucide-react";

interface Service {
  id: string;
  title: string;
  category: string;
  categoryBadge: string;
  desc: string;
}

interface Template {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  icon: string;
  iconBg: string;
  buttonBg: string;
  buttonHoverBg: string;
  features: string[];
  moduleCount: number;
  modules: string[];
  moreModulesCount: number;
}

interface DashboardConfig {
  id: string;
  name: string;
  companyName: string;
  startDate: string;
  endDate: string;
  services: string[];
  isActive: boolean;
  isStarred: boolean;
  createdAt: string;
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

const templates: Template[] = [
  {
    id: "sales",
    title: "Sales-Focused Dashboard",
    subtitle: "Sales Organization",
    desc: "Perfect for sales teams focusing on leads, contacts, and orders",
    icon: "sales",
    iconBg: "bg-blue-600",
    buttonBg: "bg-blue-600",
    buttonHoverBg: "hover:bg-blue-700",
    features: ["Lead tracking", "Contact management", "Order processing", "Quote generation"],
    moduleCount: 5,
    modules: ["Contact Management", "Lead Management", "Orders", "Quotations"],
    moreModulesCount: 1
  },
  {
    id: "service",
    title: "Service Management Dashboard",
    subtitle: "Service Company",
    desc: "Ideal for service companies managing AMC, complaints, and installations",
    icon: "service",
    iconBg: "bg-emerald-500",
    buttonBg: "bg-emerald-500",
    buttonHoverBg: "hover:bg-emerald-600",
    features: ["AMC management", "Complaint tracking", "Installation scheduling", "Service planning"],
    moduleCount: 5,
    modules: ["AMC", "Complaints", "Installation", "Contact Management"],
    moreModulesCount: 1
  },
  {
    id: "comprehensive",
    title: "Comprehensive Business Dashboard",
    subtitle: "Enterprise",
    desc: "Full-featured dashboard for businesses needing all modules",
    icon: "comprehensive",
    iconBg: "bg-purple-600",
    buttonBg: "bg-purple-600",
    buttonHoverBg: "hover:bg-purple-700",
    features: ["All modules", "Complete CRM", "Team management", "Financial tracking"],
    moduleCount: 13,
    modules: ["Contact Management", "Lead Management", "Tasks & Planner", "Orders"],
    moreModulesCount: 9
  },
  {
    id: "startup",
    title: "Startup Essentials",
    subtitle: "Startup",
    desc: "Essential modules for startups and small businesses",
    icon: "startup",
    iconBg: "bg-amber-600",
    buttonBg: "bg-amber-600",
    buttonHoverBg: "hover:bg-amber-700",
    features: ["Basic CRM", "Lead management", "Task planning", "Expense tracking"],
    moduleCount: 5,
    modules: ["Contact Management", "Lead Management", "Tasks & Planner", "Orders"],
    moreModulesCount: 1
  },
  {
    id: "inventory",
    title: "Inventory & Operations",
    subtitle: "Manufacturing/Retail",
    desc: "Focused on inventory management and operational efficiency",
    icon: "inventory",
    iconBg: "bg-indigo-500",
    buttonBg: "bg-indigo-500",
    buttonHoverBg: "hover:bg-indigo-600",
    features: ["Inventory control", "Order management", "Cost tracking", "Team coordination"],
    moduleCount: 6,
    modules: ["Inventory", "Orders", "Quotations", "Expenses"],
    moreModulesCount: 2
  },
  {
    id: "marketing",
    title: "Marketing Agency Dashboard",
    subtitle: "Marketing Agency",
    desc: "Tailored for marketing agencies and campaign management",
    icon: "marketing",
    iconBg: "bg-pink-500",
    buttonBg: "bg-pink-500",
    buttonHoverBg: "hover:bg-pink-600",
    features: ["Campaign management", "Client tracking", "Team collaboration", "Budget control"],
    moduleCount: 6,
    modules: ["Marketing", "Contact Management", "Lead Management", "Tasks & Planner"],
    moreModulesCount: 2
  }
];

export default function DashboardCustomizationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const action = searchParams.get("action") || "manager";
  const idParam = searchParams.get("id");
  const templateParam = searchParams.get("template");

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Dashboards list state
  const [dashboards, setDashboards] = useState<DashboardConfig[]>([]);

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

  // Initialize dashboards from localStorage or defaults
  useEffect(() => {
    if (loading) return;
    const stored = localStorage.getItem("crm_custom_dashboards");
    if (stored) {
      try {
        setDashboards(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored dashboards:", e);
      }
    } else {
      const company = currentUser?.orgId?.name || "RV Softech";
      const initialDashboards: DashboardConfig[] = [
        {
          id: "default-rvm",
          name: `${company} CRM`,
          companyName: company,
          startDate: "2025-08-23",
          endDate: "2025-08-24",
          services: ["contacts", "leads", "diary", "quotes", "orders", "amc", "tickets"],
          isActive: true,
          isStarred: true,
          createdAt: "Aug 22, 2025"
        }
      ];
      setDashboards(initialDashboards);
      localStorage.setItem("crm_custom_dashboards", JSON.stringify(initialDashboards));
    }
  }, [currentUser, loading]);

  // Set default values for create form
  useEffect(() => {
    if (action === "create") {
      const company = currentUser?.orgId?.name || "Startup";
      setFormCompany(company);

      if (templateParam) {
        const tmpl = templates.find(t => t.id === templateParam);
        if (tmpl) {
          setFormDashboardName(tmpl.title);
          
          let templateServices: string[] = [];
          if (tmpl.id === "sales") {
            templateServices = ["contacts", "leads", "diary", "quotes", "orders"];
          } else if (tmpl.id === "service") {
            templateServices = ["amc", "tickets", "installations", "contacts"];
          } else if (tmpl.id === "comprehensive") {
            templateServices = allServices.map(s => s.id);
          } else if (tmpl.id === "startup") {
            templateServices = ["contacts", "leads", "diary", "orders", "expenses"];
          } else if (tmpl.id === "inventory") {
            templateServices = ["inventory", "orders", "quotes", "expenses", "invoices"];
          } else if (tmpl.id === "marketing") {
            templateServices = ["marketing", "contacts", "leads", "diary", "teams", "attendance"];
          }
          setSelectedServiceIds(templateServices);
        }
      } else {
        setFormDashboardName(`${company} Essentials`);
        setSelectedServiceIds(["contacts", "leads", "diary", "quotes", "orders"]);
      }
      
      const today = new Date();
      setFormStartDate(today.toISOString().split("T")[0]);

      const nextYear = new Date();
      nextYear.setFullYear(today.getFullYear() + 1);
      setFormEndDate(nextYear.toISOString().split("T")[0]);
    }
  }, [action, currentUser, templateParam]);

  // Load dashboard for editing
  useEffect(() => {
    if ((action === "edit" || action === "view") && idParam && dashboards.length > 0) {
      const target = dashboards.find(d => d.id === idParam);
      if (target) {
        setFormCompany(target.companyName);
        setFormDashboardName(target.name);
        setFormStartDate(target.startDate);
        setFormEndDate(target.endDate);
        setSelectedServiceIds(target.services);
      }
    }
  }, [action, idParam, dashboards]);

  const activeDashboard = dashboards.find(db => db.isActive) || dashboards[0];

  const saveDashboards = (newList: DashboardConfig[]) => {
    setDashboards(newList);
    localStorage.setItem("crm_custom_dashboards", JSON.stringify(newList));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("dashboardConfigUpdated"));
    }
  };

  // Switch Active Status
  const toggleActive = (id: string) => {
    const updated = dashboards.map(db => ({
      ...db,
      isActive: db.id === id
    }));
    saveDashboards(updated);
  };

  // Toggle Star Status
  const toggleStar = (id: string) => {
    const updated = dashboards.map(db => {
      if (db.id === id) {
        return { ...db, isStarred: !db.isStarred };
      }
      return db;
    });
    saveDashboards(updated);
  };

  // Duplicate / Clone
  const cloneDashboard = (id: string) => {
    const source = dashboards.find(db => db.id === id);
    if (!source) return;
    const newDb: DashboardConfig = {
      ...source,
      id: "db-" + Math.random().toString(36).substr(2, 9),
      name: `${source.name} (Copy)`,
      isActive: false,
      isStarred: false,
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    };
    saveDashboards([...dashboards, newDb]);
  };

  // Delete
  const deleteDashboard = (id: string) => {
    if (dashboards.length <= 1) {
      alert("You must keep at least one dashboard config.");
      return;
    }
    const target = dashboards.find(db => db.id === id);
    const updated = dashboards.filter(db => db.id !== id);
    if (target?.isActive && updated.length > 0) {
      updated[0].isActive = true;
    }
    saveDashboards(updated);
  };

  // Save new / Edit changes
  const handleSaveDashboard = () => {
    if (!formCompany || !formDashboardName) {
      alert("Company Name and Dashboard Name are required.");
      return;
    }

    if (action === "create") {
      const newDb: DashboardConfig = {
        id: "db-" + Math.random().toString(36).substr(2, 9),
        name: formDashboardName,
        companyName: formCompany,
        startDate: formStartDate,
        endDate: formEndDate,
        services: selectedServiceIds,
        isActive: dashboards.length === 0,
        isStarred: false,
        createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      };
      saveDashboards([...dashboards, newDb]);
    } else if (action === "edit" && idParam) {
      const updated = dashboards.map(db => {
        if (db.id === idParam) {
          return {
            ...db,
            name: formDashboardName,
            companyName: formCompany,
            startDate: formStartDate,
            endDate: formEndDate,
            services: selectedServiceIds
          };
        }
        return db;
      });
      saveDashboards(updated);
    }
    navigateTo("manager");
  };

  // Template usage
  const handleUseTemplate = (tmpl: Template) => {
    navigateTo("create", tmpl.id);
  };

  // Navigation helper
  const navigateTo = (act: string, idVal?: string) => {
    if (act === "manager") {
      router.push("/dashboard-customization");
    } else {
      const isTemplate = templates.some(t => t.id === idVal);
      const key = isTemplate ? "template" : "id";
      const idQuery = idVal ? `&${key}=${idVal}` : "";
      router.push(`/dashboard-customization?action=${act}${idQuery}`);
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

  const renderTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case "sales": return <Phone size={20} className="text-white" />;
      case "service": return <Briefcase size={20} className="text-white" />;
      case "comprehensive": return <Layers size={20} className="text-white" />;
      case "startup": return <Sparkles size={20} className="text-white" />;
      case "inventory": return <Archive size={20} className="text-white" />;
      case "marketing": return <Megaphone size={20} className="text-white" />;
      default: return <LayoutGrid size={20} className="text-white" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
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
                {dashboards.length}
              </div>
              <div>
                <div className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Total Dashboards</div>
                <div className="text-sm font-bold text-foreground">{dashboards.length}</div>
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
                  {activeDashboard?.name || "RV CRM"}
                </div>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-600/10 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xs font-bold">
                {activeDashboard?.services?.length || 7}
              </div>
              <div>
                <div className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Total Services</div>
                <div className="text-sm font-bold text-foreground">{activeDashboard?.services?.length || 7}</div>
              </div>
            </div>
          </div>

          {/* Your Dashboards Section */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-3">
              Your Dashboards
            </h3>
            
            {/* Dashboards List */}
            <div className="space-y-4">
              {dashboards.map((db) => (
                <div 
                  key={db.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border rounded-xl transition-colors ${
                    db.isActive ? "bg-accent-muted/5 border-accent" : "bg-background-secondary border-border hover:border-accent/30"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold text-foreground">
                        {db.name}
                      </span>
                      {db.isActive ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 uppercase tracking-wide">
                          Active
                        </span>
                      ) : (
                        <button 
                          onClick={() => toggleActive(db.id)}
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-background-secondary hover:bg-surface-hover border border-border text-foreground-secondary uppercase tracking-wide cursor-pointer transition-colors"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-foreground-secondary">
                      <div>
                        <span className="font-medium text-foreground-muted">Company:</span>{" "}
                        <span className="font-semibold text-foreground">{db.companyName}</span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground-muted">Created:</span>{" "}
                        <span>{db.createdAt}</span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground-muted">Services:</span>{" "}
                        <span className="font-semibold text-foreground">{db.services.length}</span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground-muted">Period:</span>{" "}
                        <span>{db.startDate} - {db.endDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button 
                      onClick={() => toggleStar(db.id)}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        db.isStarred ? "text-yellow-500" : "text-foreground-muted hover:text-foreground hover:bg-surface-hover"
                      }`}
                    >
                      <Star size={16} fill={db.isStarred ? "currentColor" : "none"} />
                    </button>
                    <button 
                      onClick={() => navigateTo("view", db.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-background border border-border hover:bg-surface-hover text-foreground rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>View</span>
                    </button>
                    <button 
                      onClick={() => navigateTo("edit", db.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-background border border-border hover:bg-surface-hover text-foreground rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Edit size={13} />
                      <span>Edit</span>
                    </button>
                    <button 
                      onClick={() => cloneDashboard(db.id)}
                      className="p-2 bg-background border border-border hover:bg-surface-hover text-foreground-muted hover:text-foreground rounded-lg transition-colors cursor-pointer" 
                      title="Duplicate"
                    >
                      <Copy size={13} />
                    </button>
                    <button 
                      onClick={() => deleteDashboard(db.id)}
                      className="p-2 bg-danger/10 hover:bg-danger/25 text-danger rounded-lg transition-colors cursor-pointer" 
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 2. CREATE / EDIT DASHBOARD VIEW -------------------- */}
      {(action === "create" || action === "edit") && (
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
              <h2 className="text-xl font-bold text-foreground">
                {action === "create" ? "Create New Dashboard" : "Edit Dashboard Layout"}
              </h2>
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
                onClick={handleSaveDashboard}
                className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Layers size={14} />
                <span>{action === "create" ? "Create Dashboard" : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 3. DASHBOARD TEMPLATES VIEW -------------------- */}
      {action === "templates" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 bg-surface border border-border rounded-2xl p-6 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">Choose a Dashboard Template</h2>
              <p className="text-xs text-foreground-secondary">Select a pre-configured template to get started quickly</p>
            </div>
            <button 
              onClick={() => navigateTo("manager")}
              className="p-2 hover:bg-surface-hover rounded-xl text-foreground-secondary hover:text-foreground transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map((tmpl) => (
              <div 
                key={tmpl.id} 
                className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-accent/40 transition-colors"
              >
                <div>
                  {/* Icon & Title block */}
                  <div className="flex gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md ${tmpl.iconBg}`}>
                      {renderTemplateIcon(tmpl.icon)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{tmpl.title}</h3>
                      <p className="text-[10px] text-foreground-muted font-medium mt-0.5">{tmpl.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-xs text-foreground-secondary leading-relaxed mt-4 min-h-[32px]">{tmpl.desc}</p>
                  
                  {/* Key Features */}
                  <div className="mt-4 space-y-2">
                    <div className="text-xs font-bold text-foreground">Key Features:</div>
                    <ul className="space-y-1.5">
                      {tmpl.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-foreground-secondary">
                          <Check size={12} className="text-emerald-500" strokeWidth={3} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Included Modules */}
                  <div className="mt-5 space-y-2">
                    <div className="text-xs font-bold text-foreground">Included Modules ({tmpl.moduleCount}):</div>
                    <div className="flex flex-wrap gap-1.5">
                      {tmpl.modules.map((mod, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-background-secondary border border-border text-[9px] font-semibold text-foreground-secondary">
                          {mod}
                        </span>
                      ))}
                      {tmpl.moreModulesCount > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-background-secondary border border-border text-[9px] font-semibold text-foreground-secondary">
                          +{tmpl.moreModulesCount} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleUseTemplate(tmpl)}
                  className={`w-full py-2.5 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer mt-6 block text-center ${tmpl.buttonBg} ${tmpl.buttonHoverBg}`}
                >
                  Customize Template
                </button>
              </div>
            ))}
          </div>

          {/* Templates Footer: Need Custom */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-border rounded-2xl p-6 shadow-sm mt-8">
            <div>
              <h3 className="text-sm font-bold text-foreground">Need something custom?</h3>
              <p className="text-xs text-foreground-secondary">Create a dashboard from scratch with your own selection of modules</p>
            </div>
            <button 
              onClick={() => navigateTo("create")}
              className="px-5 py-2.5 bg-background border border-border hover:bg-surface-hover text-foreground rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              Create Custom Dashboard
            </button>
          </div>
        </div>
      )}

      {/* -------------------- 4. VIEW LIVE PREVIEW VIEW -------------------- */}
      {action === "view" && idParam && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 bg-surface border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigateTo("manager")}
                className="p-2 bg-background hover:bg-surface-hover border border-border rounded-xl text-foreground transition-colors cursor-pointer"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 className="text-lg font-bold text-foreground">{formDashboardName} Preview</h2>
                <p className="text-xs text-foreground-secondary">Company: {formCompany} | Period: {formStartDate} - {formEndDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-accent-muted/10 text-accent rounded-full text-xs font-semibold">
                {selectedServiceIds.length} Active Modules
              </span>
              <button 
                onClick={() => navigateTo("edit", idParam)}
                className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Edit size={13} />
                <span>Edit Layout</span>
              </button>
            </div>
          </div>

          {/* Grid Layout of Live Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedServiceIds.map(srvId => {
              const service = allServices.find(s => s.id === srvId);
              if (!service) return null;

              return (
                <div key={srvId} className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4">
                  {/* Widget Header */}
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-background border border-border rounded-lg text-accent">
                        {renderServiceIcon(srvId)}
                      </div>
                      <h4 className="text-xs font-bold text-foreground">{service.title}</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-background border border-border text-foreground-muted uppercase tracking-wider">
                      {service.categoryBadge}
                    </span>
                  </div>

                  {/* Widget Body Mock Contents */}
                  {srvId === "contacts" && (
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between py-1 border-b border-border/50 text-[11px]">
                        <span className="font-semibold text-foreground">Vikram Rathore</span>
                        <span className="text-foreground-secondary">vikram@rvsoftech.com</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-border/50 text-[11px]">
                        <span className="font-semibold text-foreground">Siddharth Jain</span>
                        <span className="text-foreground-secondary">sid@jaininfra.in</span>
                      </div>
                      <div className="flex items-center justify-between py-1 text-[11px]">
                        <span className="font-semibold text-foreground">Amit Sharma</span>
                        <span className="text-foreground-secondary">amit@outlook.com</span>
                      </div>
                    </div>
                  )}

                  {srvId === "leads" && (
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-[10px] font-semibold text-foreground-secondary mb-1">
                          <span>Prospecting Stage</span>
                          <span>80%</span>
                        </div>
                        <div className="w-full bg-background border border-border h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: "80%" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] font-semibold text-foreground-secondary mb-1">
                          <span>Negotiation Stage</span>
                          <span>45%</span>
                        </div>
                        <div className="w-full bg-background border border-border h-2 rounded-full overflow-hidden">
                          <div className="bg-yellow-500 h-full rounded-full" style={{ width: "45%" }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {srvId === "diary" && (
                    <div className="space-y-2 text-xs">
                      <div className="p-2 bg-background border border-border rounded-lg flex items-start gap-2">
                        <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-[11px]">Follow up on AMC renew</div>
                          <div className="text-[9px] text-foreground-secondary">Due: Tomorrow, 10:00 AM</div>
                        </div>
                      </div>
                      <div className="p-2 bg-background border border-border rounded-lg flex items-start gap-2">
                        <Clock size={13} className="text-yellow-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-[11px]">RV Group contract review</div>
                          <div className="text-[9px] text-foreground-secondary">Due: Jul 15, 2026</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {srvId === "quotes" && (
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 bg-background border border-border rounded-lg">
                        <div>
                          <span className="font-semibold text-foreground">QT-2026-042</span>
                          <div className="text-[9px] text-foreground-muted">RV Softech</div>
                        </div>
                        <span className="text-xs font-bold text-accent">₹45,000</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-background border border-border rounded-lg">
                        <div>
                          <span className="font-semibold text-foreground">QT-2026-043</span>
                          <div className="text-[9px] text-foreground-muted">Jain Builders</div>
                        </div>
                        <span className="text-xs font-bold text-accent">₹1,20,000</span>
                      </div>
                    </div>
                  )}

                  {srvId === "orders" && (
                    <div className="flex items-center justify-around py-2">
                      <div className="text-center">
                        <div className="text-[10px] font-medium text-foreground-muted">Booked Value</div>
                        <div className="text-sm font-bold text-foreground mt-0.5">₹3,50,000</div>
                      </div>
                      <div className="w-px h-8 bg-border" />
                      <div className="text-center">
                        <div className="text-[10px] font-medium text-foreground-muted">Active Orders</div>
                        <div className="text-sm font-bold text-foreground mt-0.5">3 pending</div>
                      </div>
                    </div>
                  )}

                  {srvId === "amc" && (
                    <div className="space-y-2 text-xs text-foreground-secondary">
                      <div className="flex justify-between py-1 border-b border-border/50">
                        <span>Delhi Gymkhana Club</span>
                        <span className="font-semibold text-foreground text-[10px]">Renew Sep 12</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/50">
                        <span>PQR Systems Pvt Ltd</span>
                        <span className="font-semibold text-foreground text-[10px]">Renew Oct 05</span>
                      </div>
                    </div>
                  )}

                  {srvId === "tickets" && (
                    <div className="flex items-center justify-around py-2">
                      <div className="text-center">
                        <div className="text-[10px] font-medium text-foreground-muted">Open Tickets</div>
                        <div className="text-sm font-bold text-danger mt-0.5">4 issues</div>
                      </div>
                      <div className="w-px h-8 bg-border" />
                      <div className="text-center">
                        <div className="text-[10px] font-medium text-foreground-muted">Avg Response</div>
                        <div className="text-sm font-bold text-foreground mt-0.5">12 mins</div>
                      </div>
                    </div>
                  )}

                  {srvId === "installations" && (
                    <div className="space-y-2 text-xs text-foreground-secondary">
                      <div className="flex justify-between items-center py-1">
                        <span>Site Alpha Setup</span>
                        <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-600 rounded text-[9px] font-bold">9:00 AM</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span>Building B Cabling</span>
                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 rounded text-[9px] font-bold">2:00 PM</span>
                      </div>
                    </div>
                  )}

                  {srvId === "inventory" && (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-border/50">
                        <span>Cat-6 Ethernet Cables</span>
                        <span className="text-red-500 font-bold">20m left</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Dual-Port Hub Sensors</span>
                        <span className="text-red-500 font-bold">5 units left</span>
                      </div>
                    </div>
                  )}

                  {srvId === "expenses" && (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1">
                        <span>Field Travel Allowance</span>
                        <span className="font-bold text-foreground">₹2,400</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Office Stationery Bill</span>
                        <span className="font-bold text-foreground">₹850</span>
                      </div>
                    </div>
                  )}

                  {srvId === "marketing" && (
                    <div className="flex items-center justify-around py-2">
                      <div className="text-center">
                        <div className="text-[10px] font-medium text-foreground-muted">Click Rate</div>
                        <div className="text-sm font-bold text-emerald-500 mt-0.5">4.8%</div>
                      </div>
                      <div className="w-px h-8 bg-border" />
                      <div className="text-center">
                        <div className="text-[10px] font-medium text-foreground-muted">Subscribers</div>
                        <div className="text-sm font-bold text-foreground mt-0.5">1,240</div>
                      </div>
                    </div>
                  )}

                  {srvId === "teams" && (
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-accent-muted/20 text-accent flex items-center justify-center font-bold text-[10px]">RK</div>
                        <span className="font-semibold text-foreground">Ramesh Kumar</span>
                        <span className="text-[9px] text-emerald-500 ml-auto font-bold">Field Active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-accent-muted/20 text-accent flex items-center justify-center font-bold text-[10px]">SS</div>
                        <span className="font-semibold text-foreground">Suresh Singh</span>
                        <span className="text-[9px] text-yellow-500 ml-auto font-bold">On Break</span>
                      </div>
                    </div>
                  )}

                  {srvId === "attendance" && (
                    <div className="flex items-center justify-around py-2">
                      <div className="text-center">
                        <div className="text-[10px] font-medium text-foreground-muted">Present Staff</div>
                        <div className="text-sm font-bold text-foreground mt-0.5">14 agents</div>
                      </div>
                      <div className="w-px h-8 bg-border" />
                      <div className="text-center">
                        <div className="text-[10px] font-medium text-foreground-muted">Late Arrivals</div>
                        <div className="text-sm font-bold text-yellow-500 mt-0.5">2 late</div>
                      </div>
                    </div>
                  )}

                  {srvId === "invoices" && (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1">
                        <span>INV-882 (Pending)</span>
                        <span className="font-bold text-yellow-600">₹12,500</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>INV-883 (Settled)</span>
                        <span className="font-bold text-emerald-600">₹88,000</span>
                      </div>
                    </div>
                  )}

                  {srvId === "add_task" && (
                    <div className="grid grid-cols-2 gap-2">
                      <button className="py-2 bg-background-secondary hover:bg-surface-hover border border-border text-[10px] font-bold rounded-lg transition-colors cursor-pointer text-center">
                        + New Lead
                      </button>
                      <button className="py-2 bg-background-secondary hover:bg-surface-hover border border-border text-[10px] font-bold rounded-lg transition-colors cursor-pointer text-center">
                        + New Quote
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
