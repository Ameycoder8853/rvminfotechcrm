"use client";

import { useState, useEffect, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserProfile } from "@clerk/nextjs";
import {
  Settings,
  Package,
  Briefcase,
  User,
  Users,
  Copy,
  Star,
  CheckCircle2,
  Check,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Globe,
  MapPin,
  Mail,
  Phone,
  Shield,
  Calendar,
  ChevronRight,
  GraduationCap,
  Award,
  TrendingUp,
  Coins,
  Eye,
  RefreshCw,
  Sliders,
  BookOpen,
  Building2,
  Tag,
  Loader2,
  Save,
  Clock,
  Brain,
  Bookmark,
  UserCheck,
  ArrowUpRight,
  Sparkles,
  Layers,
  HelpCircle,
  HelpCircle as QuestionIcon
} from "lucide-react";
import Modal from "@/components/shared/modal";

// ----------------------------------------------------
// TypeScript Interfaces
// ----------------------------------------------------

interface Specialization {
  _id: string;
  name: string;
  description: string;
  category: string; // Technology, Marketing, Analytics, Management, etc.
  level: string; // Expert, Intermediate, Beginner
  experience: string; // e.g. "5 years"
  certRequired: boolean;
  salary: number; // e.g. 95000
  professionals: number; // e.g. 245
  demandLevel: string; // High, Medium, Low
  status: string; // Active, Inactive
}

interface Qualification {
  _id: string;
  name: string;
  category: string;
  level: string;
  field: string;
  duration: string;
}

interface TaskType {
  _id: string;
  name: string;
  category: string;
  priority: string;
  duration: string;
  usage: number;
  status: string;
}

interface Product {
  _id: string;
  name: string;
  code: string;
  category: string;
  price: number;
  tax: string;
  status: string;
}

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  designation: string;
  role: string;
  joined: string;
  status: string;
}

interface GenericSetting {
  _id: string;
  name: string;
  status: string;
}

// ----------------------------------------------------
// Mock Data Definitions
// ----------------------------------------------------

const initialSpecializations: Specialization[] = [
  {
    _id: "spec1",
    name: "Development",
    description: "Web and mobile application development",
    category: "Technology",
    level: "Expert",
    experience: "5 years",
    certRequired: true,
    salary: 95000,
    professionals: 245,
    demandLevel: "High",
    status: "Active"
  },
  {
    _id: "spec2",
    name: "Marketing",
    description: "Social media marketing and content strategy",
    category: "Marketing",
    level: "Intermediate",
    experience: "3 years",
    certRequired: false,
    salary: 65000,
    professionals: 189,
    demandLevel: "Medium",
    status: "Active"
  },
  {
    _id: "spec3",
    name: "Analytics",
    description: "Data modeling, statistical analysis and data visualization",
    category: "Analytics",
    level: "Expert",
    experience: "4 years",
    certRequired: true,
    salary: 110000,
    professionals: 156,
    demandLevel: "High",
    status: "Active"
  },
  {
    _id: "spec4",
    name: "Management",
    description: "Agile and traditional project management",
    category: "Management",
    level: "Intermediate",
    experience: "3 years",
    certRequired: true,
    salary: 85000,
    professionals: 312,
    demandLevel: "Medium",
    status: "Active"
  }
];

const initialQualifications: Qualification[] = [
  { _id: "q1", name: "Bachelor of Science in Computer Science", category: "Undergraduate", level: "Bachelor", field: "Computer Science", duration: "4 years" },
  { _id: "q2", name: "Master of Business Administration", category: "Postgraduate", level: "Master", field: "Business Administration", duration: "2 years" },
  { _id: "q3", name: "Certified Public Accountant (CPA)", category: "Professional Certification", level: "Professional", field: "Accounting", duration: "1 year" },
];

const initialTaskTypes: TaskType[] = [
  { _id: "t1", name: "Follow-up Call", category: "Communication", priority: "High", duration: "30 minutes", usage: 245, status: "Active" },
  { _id: "t2", name: "Site Visit", category: "Field Work", priority: "High", duration: "2 hours", usage: 89, status: "Active" },
  { _id: "t3", name: "Email Campaign", category: "Marketing", priority: "Medium", duration: "1 hour", usage: 156, status: "Active" },
  { _id: "t4", name: "Document Review", category: "Administrative", priority: "Low", duration: "45 minutes", usage: 67, status: "Inactive" },
];

const initialProducts: Product[] = [
  { _id: "p1", name: "Software License", code: "SL-101", category: "Software", price: 49999, tax: "18%", status: "Active" },
  { _id: "p2", name: "Hardware Rack Integration", code: "HWR-202", category: "Hardware", price: 150000, tax: "18%", status: "Active" },
  { _id: "p3", name: "AMC Plan Annual", code: "AMC-303", category: "Service", price: 25000, tax: "18%", status: "Active" },
  { _id: "p4", name: "Networking Switch Setup", code: "NET-404", category: "Installation", price: 15000, tax: "18%", status: "Active" },
];

const initialEmployees: Employee[] = [
  { _id: "e1", firstName: "Amey", lastName: "Patil", email: "amey35195@gmail.com", department: "Coding", designation: "Senior Lead", role: "Admin", joined: "2026-06-15", status: "Active" },
  { _id: "e2", firstName: "John", lastName: "Doe", email: "john.doe@example.com", department: "Sales", designation: "Manager", role: "Senior Manager", joined: "2026-05-10", status: "Active" },
  { _id: "e3", firstName: "Jane", lastName: "Smith", email: "jane.smith@example.com", department: "Marketing", designation: "Specialist", role: "Junior Rep", joined: "2026-06-01", status: "Active" },
];

// Left Prerequisite items lists (Customer Tab)
const customerPrerequisites = [
  { id: "categories", label: "Set Category/Sub Category" },
  { id: "sources", label: "Set up Source/Reference" },
  { id: "locations", label: "Set up Location" },
  { id: "stages", label: "Set up Funnel Stage" },
  { id: "complaints", label: "Set up Complaint Nature" },
  { id: "transports", label: "Set up Transportation Mode" },
  { id: "expense_heads", label: "Expense Head" },
  { id: "countries", label: "Set up Country" },
  { id: "definable_masters", label: "Set up User Definable Master" },
  { id: "definable_parameters", label: "Set up User Definable Parameter" },
  { id: "districts", label: "Set up District" },
  { id: "service_providers", label: "Service Provider" },
  { id: "specializations", label: "Specialization Management" }, // default active
  { id: "features", label: "Feature" },
  { id: "competitors", label: "Competitor" }
];

// Left Prerequisite items lists (Employee Tab)
const employeePrerequisites = [
  { id: "employees_list", label: "Employee Master" },
  { id: "departments", label: "Set up Department" },
  { id: "designations", label: "Set up Designation" },
  { id: "shifts", label: "Employee Shift Master" },
  { id: "qualifications", label: "Qualification Master" },
];

// Left Prerequisite items lists (System Settings Tab)
const systemPrerequisites = [
  { id: "stages", label: "Set up Funnel Stage" },
  { id: "complaints", label: "Set up Complaint Nature" },
  { id: "transports", label: "Set up Transportation Mode" },
  { id: "countries", label: "Set up Country" },
  { id: "districts", label: "Set up District" },
];

export default function SettingsPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Active Main tab based on sidebar route
  const getActiveTab = () => {
    if (pathname.includes("/settings/system")) return "system";
    if (pathname.includes("/settings/products")) return "products";
    if (pathname.includes("/settings/employees")) return "employees";
    if (pathname.includes("/settings/customers")) return "customers";
    return "profile";
  };
  const activeTab = getActiveTab();

  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/users/me");
        const json = await res.json();
        if (json.success && json.data) {
          setCurrentUser(json.data);
        }
      } catch (err) {
        console.error("Failed to load user details in settings:", err);
      }
    }
    fetchUser();
  }, []);

  // Load settings from localStorage or initialize defaults
  useEffect(() => {
    const loadState = (key: string, fallback: any, setter: any) => {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          setter(JSON.parse(stored));
        } catch (e) {
          console.error(`Failed to parse localStorage key ${key}`, e);
          setter(fallback);
        }
      } else {
        setter(fallback);
        localStorage.setItem(key, JSON.stringify(fallback));
      }
    };

    loadState("settings_specializations", initialSpecializations, setSpecializations);
    loadState("settings_qualifications", initialQualifications, setQualifications);
    loadState("settings_taskTypes", initialTaskTypes, setTaskTypes);
    loadState("settings_products", initialProducts, setProducts);
    
    // For employees, load real users from database
    async function fetchEmployees() {
      try {
        const res = await fetch("/api/users");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped = json.data.map((u: any) => ({
            _id: u._id,
            firstName: u.firstName || "",
            lastName: u.lastName || "",
            email: u.email || "",
            department: u.department || "Coding",
            designation: u.designation || "Senior Lead",
            role: u.roleTier || "Staff",
            joined: u.createdAt ? u.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
            status: u.isActive ? "Active" : "Inactive"
          }));
          setEmployees(mapped);
          localStorage.setItem("settings_employees", JSON.stringify(mapped));
        } else {
          loadState("settings_employees", initialEmployees, setEmployees);
        }
      } catch (err) {
        console.error("Failed to load real employees, loading fallback:", err);
        loadState("settings_employees", initialEmployees, setEmployees);
      }
    }
    fetchEmployees();

    loadState("settings_categories", [
      { _id: "c1", name: "Corporate Client", status: "Active" },
      { _id: "c2", name: "Government Entity", status: "Active" },
      { _id: "c3", name: "Retail Customer", status: "Active" }
    ], setCategories);

    loadState("settings_sources", [
      { _id: "so1", name: "Google Search", status: "Active" },
      { _id: "so2", name: "Social Media Campaign", status: "Active" },
      { _id: "so3", name: "Customer Referral", status: "Active" }
    ], setSources);

    loadState("settings_locations", [
      { _id: "l1", name: "Mumbai", status: "Active" },
      { _id: "l2", name: "Delhi NCR", status: "Active" },
      { _id: "l3", name: "Bengaluru", status: "Active" }
    ], setLocations);

    loadState("settings_stages", [
      { _id: "s1", name: "New Lead", status: "Active" },
      { _id: "s2", name: "Contacted", status: "Active" },
      { _id: "s3", name: "Qualified Proposal", status: "Active" }
    ], setStages);

    loadState("settings_complaints", [
      { _id: "cp1", name: "Product Delivery Delay", status: "Active" },
      { _id: "cp2", name: "Software License Issue", status: "Active" }
    ], setComplaints);

    loadState("settings_transports", [
      { _id: "tr1", name: "Air Freight", status: "Active" },
      { _id: "tr2", name: "Local Courier", status: "Active" }
    ], setTransports);

    loadState("settings_expenseHeads", [
      { _id: "ex1", name: "Travel Allowance", status: "Active" },
      { _id: "ex2", name: "Office Supplies", status: "Active" }
    ], setExpenseHeads);

    loadState("settings_countries", [
      { _id: "cn1", name: "India", status: "Active" },
      { _id: "cn2", name: "United States", status: "Active" }
    ], setCountries);

    loadState("settings_definableMasters", [
      { _id: "dm1", name: "Custom Project Parameter", status: "Active" }
    ], setDefinableMasters);

    loadState("settings_definableParameters", [
      { _id: "dp1", name: "Contract Expiration Period", status: "Active" }
    ], setDefinableParameters);

    loadState("settings_districts", [
      { _id: "d1", name: "Pune District", status: "Active" },
      { _id: "d2", name: "Gurugram", status: "Active" }
    ], setDistricts);

    loadState("settings_serviceProviders", [
      { _id: "sp1", name: "Logistics Partner A", status: "Active" },
      { _id: "sp2", name: "AWS Cloud Support", status: "Active" }
    ], setServiceProviders);

    loadState("settings_features", [
      { _id: "f1", name: "Automatic Invoicing", status: "Active" },
      { _id: "f2", name: "WhatsApp Reminders", status: "Active" }
    ], setFeatures);

    loadState("settings_competitors", [
      { _id: "cmp1", name: "Competitor CRM Ltd", status: "Active" }
    ], setCompetitors);
  }, []);

  // Left sidebar active prerequisite item
  const [activePrereq, setActivePrereq] = useState("specializations");

  // Keep track of active prerequisite category when switching main tabs
  useEffect(() => {
    if (activeTab === "system") {
      setActivePrereq("stages");
    } else if (activeTab === "products") {
      setActivePrereq("products_list");
    } else if (activeTab === "employees") {
      setActivePrereq("employees_list");
    } else if (activeTab === "customers") {
      setActivePrereq("specializations");
    }
  }, [activeTab]);

  // Master lists state
  const [specializations, setSpecializations] = useState<Specialization[]>(initialSpecializations);
  const [qualifications, setQualifications] = useState<Qualification[]>(initialQualifications);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>(initialTaskTypes);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);

  // Generic Parameter lists state
  const [categories, setCategories] = useState<GenericSetting[]>([
    { _id: "c1", name: "Corporate Client", status: "Active" },
    { _id: "c2", name: "Government Entity", status: "Active" },
    { _id: "c3", name: "Retail Customer", status: "Active" }
  ]);
  const [sources, setSources] = useState<GenericSetting[]>([
    { _id: "so1", name: "Google Search", status: "Active" },
    { _id: "so2", name: "Social Media Campaign", status: "Active" },
    { _id: "so3", name: "Customer Referral", status: "Active" }
  ]);
  const [locations, setLocations] = useState<GenericSetting[]>([
    { _id: "l1", name: "Mumbai", status: "Active" },
    { _id: "l2", name: "Delhi NCR", status: "Active" },
    { _id: "l3", name: "Bengaluru", status: "Active" }
  ]);
  const [stages, setStages] = useState<GenericSetting[]>([
    { _id: "s1", name: "New Lead", status: "Active" },
    { _id: "s2", name: "Contacted", status: "Active" },
    { _id: "s3", name: "Qualified Proposal", status: "Active" }
  ]);
  const [complaints, setComplaints] = useState<GenericSetting[]>([
    { _id: "cp1", name: "Product Delivery Delay", status: "Active" },
    { _id: "cp2", name: "Software License Issue", status: "Active" }
  ]);
  const [transports, setTransports] = useState<GenericSetting[]>([
    { _id: "tr1", name: "Air Freight", status: "Active" },
    { _id: "tr2", name: "Local Courier", status: "Active" }
  ]);
  const [expenseHeads, setExpenseHeads] = useState<GenericSetting[]>([
    { _id: "ex1", name: "Travel Allowance", status: "Active" },
    { _id: "ex2", name: "Office Supplies", status: "Active" }
  ]);
  const [countries, setCountries] = useState<GenericSetting[]>([
    { _id: "cn1", name: "India", status: "Active" },
    { _id: "cn2", name: "United States", status: "Active" }
  ]);
  const [definableMasters, setDefinableMasters] = useState<GenericSetting[]>([
    { _id: "dm1", name: "Custom Project Parameter", status: "Active" }
  ]);
  const [definableParameters, setDefinableParameters] = useState<GenericSetting[]>([
    { _id: "dp1", name: "Contract Expiration Period", status: "Active" }
  ]);
  const [districts, setDistricts] = useState<GenericSetting[]>([
    { _id: "d1", name: "Pune District", status: "Active" },
    { _id: "d2", name: "Gurugram", status: "Active" }
  ]);
  const [serviceProviders, setServiceProviders] = useState<GenericSetting[]>([
    { _id: "sp1", name: "Logistics Partner A", status: "Active" },
    { _id: "sp2", name: "AWS Cloud Support", status: "Active" }
  ]);
  const [features, setFeatures] = useState<GenericSetting[]>([
    { _id: "f1", name: "Automatic Invoicing", status: "Active" },
    { _id: "f2", name: "WhatsApp Reminders", status: "Active" }
  ]);
  const [competitors, setCompetitors] = useState<GenericSetting[]>([
    { _id: "cmp1", name: "Competitor CRM Ltd", status: "Active" }
  ]);

  // Specialization filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [demandFilter, setDemandFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal forms state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"new" | "edit">("new");
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Switch tabs (routes)
  const handleTabChange = (tabId: string) => {
    const path = tabId === "profile" ? "/settings" : `/settings/${tabId}`;
    setSearchQuery("");
    setCategoryFilter("");
    setLevelFilter("");
    setDemandFilter("");
    setStatusFilter("");
    startTransition(() => {
      router.push(path);
    });
  };

  const handleOpenAddModal = () => {
    setFormMode("new");
    if (activePrereq === "specializations") {
      setFormData({
        name: "",
        description: "",
        category: "Technology",
        level: "Expert",
        experience: "3 years",
        certRequired: false,
        salary: 75000,
        professionals: 10,
        demandLevel: "Medium",
        status: "Active"
      });
    } else if (activePrereq === "qualifications") {
      setFormData({ name: "", category: "Undergraduate", level: "Bachelor", field: "", duration: "" });
    } else if (activePrereq === "products_list") {
      setFormData({ name: "", code: "", category: "Software", price: "", tax: "18%", status: "Active" });
    } else if (activePrereq === "employees_list") {
      setFormData({ firstName: "", lastName: "", email: "", department: "Coding", designation: "Senior Lead", role: "Admin", status: "Active" });
    } else {
      setFormData({ name: "", status: "Active" });
    }
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: any) => {
    setFormMode("edit");
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    if (!confirm("Are you sure you want to delete this setting record?")) return;

    if (activePrereq === "specializations") {
      const filtered = specializations.filter(s => s._id !== id);
      setSpecializations(filtered);
      localStorage.setItem("settings_specializations", JSON.stringify(filtered));
    } else if (activePrereq === "qualifications") {
      const filtered = qualifications.filter(q => q._id !== id);
      setQualifications(filtered);
      localStorage.setItem("settings_qualifications", JSON.stringify(filtered));
    } else if (activePrereq === "products_list") {
      const filtered = products.filter(p => p._id !== id);
      setProducts(filtered);
      localStorage.setItem("settings_products", JSON.stringify(filtered));
    } else if (activePrereq === "employees_list") {
      const filtered = employees.filter(e => e._id !== id);
      setEmployees(filtered);
      localStorage.setItem("settings_employees", JSON.stringify(filtered));
    } else {
      // Generic state triggers
      switch (activePrereq) {
        case "categories": {
          const filtered = categories.filter(c => c._id !== id);
          setCategories(filtered);
          localStorage.setItem("settings_categories", JSON.stringify(filtered));
          break;
        }
        case "sources": {
          const filtered = sources.filter(s => s._id !== id);
          setSources(filtered);
          localStorage.setItem("settings_sources", JSON.stringify(filtered));
          break;
        }
        case "locations": {
          const filtered = locations.filter(l => l._id !== id);
          setLocations(filtered);
          localStorage.setItem("settings_locations", JSON.stringify(filtered));
          break;
        }
        case "stages": {
          const filtered = stages.filter(s => s._id !== id);
          setStages(filtered);
          localStorage.setItem("settings_stages", JSON.stringify(filtered));
          break;
        }
        case "complaints": {
          const filtered = complaints.filter(c => c._id !== id);
          setComplaints(filtered);
          localStorage.setItem("settings_complaints", JSON.stringify(filtered));
          break;
        }
        case "transports": {
          const filtered = transports.filter(t => t._id !== id);
          setTransports(filtered);
          localStorage.setItem("settings_transports", JSON.stringify(filtered));
          break;
        }
        case "expense_heads": {
          const filtered = expenseHeads.filter(e => e._id !== id);
          setExpenseHeads(filtered);
          localStorage.setItem("settings_expenseHeads", JSON.stringify(filtered));
          break;
        }
        case "countries": {
          const filtered = countries.filter(c => c._id !== id);
          setCountries(filtered);
          localStorage.setItem("settings_countries", JSON.stringify(filtered));
          break;
        }
        case "definable_masters": {
          const filtered = definableMasters.filter(d => d._id !== id);
          setDefinableMasters(filtered);
          localStorage.setItem("settings_definableMasters", JSON.stringify(filtered));
          break;
        }
        case "definable_parameters": {
          const filtered = definableParameters.filter(d => d._id !== id);
          setDefinableParameters(filtered);
          localStorage.setItem("settings_definableParameters", JSON.stringify(filtered));
          break;
        }
        case "districts": {
          const filtered = districts.filter(d => d._id !== id);
          setDistricts(filtered);
          localStorage.setItem("settings_districts", JSON.stringify(filtered));
          break;
        }
        case "service_providers": {
          const filtered = serviceProviders.filter(s => s._id !== id);
          setServiceProviders(filtered);
          localStorage.setItem("settings_serviceProviders", JSON.stringify(filtered));
          break;
        }
        case "features": {
          const filtered = features.filter(f => f._id !== id);
          setFeatures(filtered);
          localStorage.setItem("settings_features", JSON.stringify(filtered));
          break;
        }
        case "competitors": {
          const filtered = competitors.filter(c => c._id !== id);
          setCompetitors(filtered);
          localStorage.setItem("settings_competitors", JSON.stringify(filtered));
          break;
        }
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      if (formMode === "new") {
        const newRecord = { ...formData, _id: `record_${Date.now()}` };
        if (activePrereq === "specializations") {
          const updated = [...specializations, {
            ...newRecord,
            salary: Number(formData.salary || 0),
            professionals: Number(formData.professionals || 0)
          }];
          setSpecializations(updated);
          localStorage.setItem("settings_specializations", JSON.stringify(updated));
        } else if (activePrereq === "qualifications") {
          const updated = [...qualifications, newRecord];
          setQualifications(updated);
          localStorage.setItem("settings_qualifications", JSON.stringify(updated));
        } else if (activePrereq === "products_list") {
          const updated = [...products, { ...newRecord, price: Number(formData.price || 0) }];
          setProducts(updated);
          localStorage.setItem("settings_products", JSON.stringify(updated));
        } else if (activePrereq === "employees_list") {
          const updated = [...employees, { ...newRecord, joined: new Date().toISOString().split("T")[0] }];
          setEmployees(updated);
          localStorage.setItem("settings_employees", JSON.stringify(updated));
        } else {
          const genericRecord: GenericSetting = { _id: `record_${Date.now()}`, name: formData.name, status: formData.status };
          switch (activePrereq) {
            case "categories": {
              const updated = [...categories, genericRecord];
              setCategories(updated);
              localStorage.setItem("settings_categories", JSON.stringify(updated));
              break;
            }
            case "sources": {
              const updated = [...sources, genericRecord];
              setSources(updated);
              localStorage.setItem("settings_sources", JSON.stringify(updated));
              break;
            }
            case "locations": {
              const updated = [...locations, genericRecord];
              setLocations(updated);
              localStorage.setItem("settings_locations", JSON.stringify(updated));
              break;
            }
            case "stages": {
              const updated = [...stages, genericRecord];
              setStages(updated);
              localStorage.setItem("settings_stages", JSON.stringify(updated));
              break;
            }
            case "complaints": {
              const updated = [...complaints, genericRecord];
              setComplaints(updated);
              localStorage.setItem("settings_complaints", JSON.stringify(updated));
              break;
            }
            case "transports": {
              const updated = [...transports, genericRecord];
              setTransports(updated);
              localStorage.setItem("settings_transports", JSON.stringify(updated));
              break;
            }
            case "expense_heads": {
              const updated = [...expenseHeads, genericRecord];
              setExpenseHeads(updated);
              localStorage.setItem("settings_expenseHeads", JSON.stringify(updated));
              break;
            }
            case "countries": {
              const updated = [...countries, genericRecord];
              setCountries(updated);
              localStorage.setItem("settings_countries", JSON.stringify(updated));
              break;
            }
            case "definable_masters": {
              const updated = [...definableMasters, genericRecord];
              setDefinableMasters(updated);
              localStorage.setItem("settings_definableMasters", JSON.stringify(updated));
              break;
            }
            case "definable_parameters": {
              const updated = [...definableParameters, genericRecord];
              setDefinableParameters(updated);
              localStorage.setItem("settings_definableParameters", JSON.stringify(updated));
              break;
            }
            case "districts": {
              const updated = [...districts, genericRecord];
              setDistricts(updated);
              localStorage.setItem("settings_districts", JSON.stringify(updated));
              break;
            }
            case "service_providers": {
              const updated = [...serviceProviders, genericRecord];
              setServiceProviders(updated);
              localStorage.setItem("settings_serviceProviders", JSON.stringify(updated));
              break;
            }
            case "features": {
              const updated = [...features, genericRecord];
              setFeatures(updated);
              localStorage.setItem("settings_features", JSON.stringify(updated));
              break;
            }
            case "competitors": {
              const updated = [...competitors, genericRecord];
              setCompetitors(updated);
              localStorage.setItem("settings_competitors", JSON.stringify(updated));
              break;
            }
          }
        }
      } else {
        // Edit mode
        if (activePrereq === "specializations") {
          const updated = specializations.map(s => s._id === formData._id ? {
            ...formData,
            salary: Number(formData.salary || 0),
            professionals: Number(formData.professionals || 0)
          } : s);
          setSpecializations(updated);
          localStorage.setItem("settings_specializations", JSON.stringify(updated));
        } else if (activePrereq === "qualifications") {
          const updated = qualifications.map(q => q._id === formData._id ? formData : q);
          setQualifications(updated);
          localStorage.setItem("settings_qualifications", JSON.stringify(updated));
        } else if (activePrereq === "products_list") {
          const updated = products.map(p => p._id === formData._id ? { ...formData, price: Number(formData.price || 0) } : p);
          setProducts(updated);
          localStorage.setItem("settings_products", JSON.stringify(updated));
        } else if (activePrereq === "employees_list") {
          const updated = employees.map(emp => emp._id === formData._id ? formData : emp);
          setEmployees(updated);
          localStorage.setItem("settings_employees", JSON.stringify(updated));
        } else {
          const updatedGeneric = { _id: formData._id, name: formData.name, status: formData.status };
          switch (activePrereq) {
            case "categories": {
              const updated = categories.map(c => c._id === formData._id ? updatedGeneric : c);
              setCategories(updated);
              localStorage.setItem("settings_categories", JSON.stringify(updated));
              break;
            }
            case "sources": {
              const updated = sources.map(s => s._id === formData._id ? updatedGeneric : s);
              setSources(updated);
              localStorage.setItem("settings_sources", JSON.stringify(updated));
              break;
            }
            case "locations": {
              const updated = locations.map(l => l._id === formData._id ? updatedGeneric : l);
              setLocations(updated);
              localStorage.setItem("settings_locations", JSON.stringify(updated));
              break;
            }
            case "stages": {
              const updated = stages.map(s => s._id === formData._id ? updatedGeneric : s);
              setStages(updated);
              localStorage.setItem("settings_stages", JSON.stringify(updated));
              break;
            }
            case "complaints": {
              const updated = complaints.map(c => c._id === formData._id ? updatedGeneric : c);
              setComplaints(updated);
              localStorage.setItem("settings_complaints", JSON.stringify(updated));
              break;
            }
            case "transports": {
              const updated = transports.map(t => t._id === formData._id ? updatedGeneric : t);
              setTransports(updated);
              localStorage.setItem("settings_transports", JSON.stringify(updated));
              break;
            }
            case "expense_heads": {
              const updated = expenseHeads.map(e => e._id === formData._id ? updatedGeneric : e);
              setExpenseHeads(updated);
              localStorage.setItem("settings_expenseHeads", JSON.stringify(updated));
              break;
            }
            case "countries": {
              const updated = countries.map(c => c._id === formData._id ? updatedGeneric : c);
              setCountries(updated);
              localStorage.setItem("settings_countries", JSON.stringify(updated));
              break;
            }
            case "definable_masters": {
              const updated = definableMasters.map(d => d._id === formData._id ? updatedGeneric : d);
              setDefinableMasters(updated);
              localStorage.setItem("settings_definableMasters", JSON.stringify(updated));
              break;
            }
            case "definable_parameters": {
              const updated = definableParameters.map(d => d._id === formData._id ? updatedGeneric : d);
              setDefinableParameters(updated);
              localStorage.setItem("settings_definableParameters", JSON.stringify(updated));
              break;
            }
            case "districts": {
              const updated = districts.map(d => d._id === formData._id ? updatedGeneric : d);
              setDistricts(updated);
              localStorage.setItem("settings_districts", JSON.stringify(updated));
              break;
            }
            case "service_providers": {
              const updated = serviceProviders.map(s => s._id === formData._id ? updatedGeneric : s);
              setServiceProviders(updated);
              localStorage.setItem("settings_serviceProviders", JSON.stringify(updated));
              break;
            }
            case "features": {
              const updated = features.map(f => f._id === formData._id ? updatedGeneric : f);
              setFeatures(updated);
              localStorage.setItem("settings_features", JSON.stringify(updated));
              break;
            }
            case "competitors": {
              const updated = competitors.map(c => c._id === formData._id ? updatedGeneric : c);
              setCompetitors(updated);
              localStorage.setItem("settings_competitors", JSON.stringify(updated));
              break;
            }
          }
        }
      }
      setIsSubmitting(false);
      setIsModalOpen(false);
    }, 300);
  };

  // Get active menu selection list items
  const getPrerequisitesList = () => {
    if (activeTab === "employees") return employeePrerequisites;
    if (activeTab === "customers") return customerPrerequisites;
    if (activeTab === "system") return systemPrerequisites;
    return [];
  };

  // Get current active generic list
  const getGenericList = () => {
    switch (activePrereq) {
      case "categories": return categories;
      case "sources": return sources;
      case "locations": return locations;
      case "stages": return stages;
      case "complaints": return complaints;
      case "transports": return transports;
      case "expense_heads": return expenseHeads;
      case "countries": return countries;
      case "definable_masters": return definableMasters;
      case "definable_parameters": return definableParameters;
      case "districts": return districts;
      case "service_providers": return serviceProviders;
      case "features": return features;
      case "competitors": return competitors;
      default: return [];
    }
  };

  // Filter specializations list
  const filteredSpecializations = specializations.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "" || s.category === categoryFilter;
    const matchesLevel = levelFilter === "" || s.level === levelFilter;
    const matchesDemand = demandFilter === "" || s.demandLevel === demandFilter;
    const matchesStatus = statusFilter === "" || s.status === statusFilter;
    return matchesSearch && matchesCategory && matchesLevel && matchesDemand && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in p-2 lg:p-4 bg-background min-h-screen">
      
      {/* -------------------- MAIN TABS CONTAINER -------------------- */}
      <div className="border-b border-border bg-surface dark:bg-background-secondary p-1 rounded-xl flex flex-wrap gap-1 max-w-fit shadow-sm">
        <button
          onClick={() => handleTabChange("system")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "system" 
              ? "bg-accent text-white shadow-md shadow-accent/15" 
              : "text-foreground-secondary hover:text-foreground hover:bg-surface-hover/50"
          }`}
        >
          <Settings size={16} />
          <span>System</span>
        </button>
        <button
          onClick={() => handleTabChange("products")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "products" 
              ? "bg-accent text-white shadow-md shadow-accent/15" 
              : "text-foreground-secondary hover:text-foreground hover:bg-surface-hover/50"
          }`}
        >
          <Package size={16} />
          <span>Product</span>
        </button>
        <button
          onClick={() => handleTabChange("employees")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "employees" 
              ? "bg-accent text-white shadow-md shadow-accent/15" 
              : "text-foreground-secondary hover:text-foreground hover:bg-surface-hover/50"
          }`}
        >
          <Briefcase size={16} />
          <span>Employee</span>
        </button>
        <button
          onClick={() => handleTabChange("customers")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "customers" 
              ? "bg-accent text-white shadow-md shadow-accent/15" 
              : "text-foreground-secondary hover:text-foreground hover:bg-surface-hover/50"
          }`}
        >
          <Users size={16} />
          <span>Customer</span>
        </button>
      </div>

      {/* -------------------- PROFILE VIEW (CLERK) -------------------- */}
      {activeTab === "profile" && (
        <div className="w-full flex justify-center mt-2">
          <UserProfile
            routing="path"
            path="/settings"
            appearance={{
              elements: {
                rootBox: "w-full max-w-6xl mx-auto flex justify-center",
                card: "w-full bg-transparent border-none shadow-none flex-row",
                navbar: "hidden md:flex w-64 bg-transparent border-none shrink-0 pr-8",
                navbarButton: "text-foreground-secondary hover:text-foreground hover:bg-surface-hover rounded-xl transition-all px-4 py-3 text-sm font-medium",
                navbarButton__active: "text-accent bg-accent-muted font-bold shadow-sm",
                headerTitle: "text-2xl font-bold text-foreground tracking-tight",
                headerSubtitle: "text-foreground-secondary text-sm mb-8",
                profileSectionTitle: "text-lg font-semibold text-foreground border-b border-border pb-3 mb-6 mt-4",
                profileSectionContent: "text-foreground gap-8",
                formFieldLabel: "text-[10px] font-bold text-foreground-muted uppercase tracking-widest mb-2 block",
                formFieldInput: "bg-background-secondary border border-border text-foreground rounded-xl focus:border-accent focus:ring-2 focus:ring-accent-muted transition-all h-11 px-4 text-sm",
                formButtonPrimary: "bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl px-8 py-2.5 transition-all shadow-lg shadow-accent/20 active:scale-95",
                accordionTriggerButton: "text-foreground hover:bg-surface-hover rounded-xl px-4 py-3 transition-colors",
                badge: "bg-accent-muted text-accent border-none rounded-full px-3 py-1 text-[10px] font-bold uppercase",
                userPreviewMainIdentifier: "text-foreground font-bold",
                userPreviewSecondaryIdentifier: "text-foreground-secondary",
                scrollBox: "bg-transparent border-none",
                pageScrollBox: "bg-transparent p-0 pb-12",
                navbarMobileMenuButton: "text-foreground",
                userButtonPopoverFooter: "hidden",
                dividerLine: "bg-border opacity-50",
                identityPreviewText: "text-foreground font-medium",
                identityPreviewEditButtonIcon: "text-foreground-secondary hover:text-accent",
              },
            }}
          />
        </div>
      )}

      {/* -------------------- PRODUCT MASTER VIEW -------------------- */}
      {activeTab === "products" && (
        <div className="space-y-6 opacity-0 animate-fade-in">
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-1">
              <Briefcase size={20} className="text-accent" />
              Product Master Catalog
            </h2>
            <p className="text-xs text-foreground-secondary">Manage products, software licenses, integrations and AMCs</p>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface border border-border rounded-2xl p-4 shadow-sm">
            <div className="relative flex items-center max-w-sm flex-1">
              <Search className="absolute left-3.5 text-foreground-muted" size={15} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background-secondary border border-border rounded-xl pl-10! py-2.5 text-xs text-foreground focus:border-accent outline-none"
              />
            </div>
            <button
              onClick={() => { setActivePrereq("products_list"); handleOpenAddModal(); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Product</span>
            </button>
          </div>

          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-background-secondary/30 text-[10px] font-bold uppercase tracking-wider text-foreground-muted text-left">
                  <th className="px-6 py-3">Product Name</th>
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Tax</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((p, idx) => (
                  <tr key={p._id} className={`hover:bg-surface-hover/30 transition-colors opacity-0 animate-fade-in ${idx < 5 ? `stagger-${idx + 1}` : ""}`}>
                    <td className="px-6 py-3.5 font-bold text-foreground">{p.name}</td>
                    <td className="px-6 py-3.5 font-mono text-foreground-secondary">{p.code}</td>
                    <td className="px-6 py-3.5"><span className="px-2.5 py-0.5 rounded-full bg-accent-muted/40 text-accent font-bold text-[9px] uppercase">{p.category}</span></td>
                    <td className="px-6 py-3.5 font-bold text-foreground">₹{p.price.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-foreground-secondary">{p.tax}</td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${p.status === "Active" ? "bg-success-muted text-success" : "bg-danger-muted text-danger"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.status === "Active" ? "bg-success animate-pulse" : "bg-danger"}`} />
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => { setActivePrereq("products_list"); handleOpenEditModal(p); }} className="w-7 h-7 rounded-full flex items-center justify-center bg-accent-muted/20 border border-accent/10 text-accent hover:bg-accent-muted/40 cursor-pointer"><Edit size={12} /></button>
                        <button onClick={() => { setActivePrereq("products_list"); handleDeleteItem(p._id); }} className="w-7 h-7 rounded-full flex items-center justify-center bg-danger-muted/20 border border-danger/10 text-danger hover:bg-danger-muted/40 cursor-pointer"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------- DYNAMIC MASTER SETTINGS VIEW -------------------- */}
      {activeTab !== "profile" && activeTab !== "products" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start mt-2 opacity-0 animate-fade-in">
          
          {/* Left Column: Prerequisite settings menu */}
          <div className="lg:col-span-1 bg-surface border border-border rounded-2xl p-4 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-foreground capitalize tracking-wide flex items-center gap-2 mb-1">
                <Sliders size={15} className="text-accent" />
                {activeTab === "customers" ? "Customer" : activeTab === "employees" ? "Employee" : "System"}
              </h2>
              <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider block">Prerequisite Settings</span>
            </div>
            
            <div className="flex flex-col gap-1 max-h-125 overflow-y-auto pr-1">
              {getPrerequisitesList().map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActivePrereq(item.id); setSearchQuery(""); setCategoryFilter(""); setLevelFilter(""); setDemandFilter(""); setStatusFilter(""); }}
                  className={`flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer group ${
                    activePrereq === item.id 
                      ? "bg-accent-muted text-accent font-bold" 
                      : "text-foreground-secondary hover:text-foreground hover:bg-surface-hover/40"
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight size={13} className={`transition-transform group-hover:translate-x-0.5 ${activePrereq === item.id ? "text-accent" : "text-foreground-muted"}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Master Details Dashboard Panel */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* 1. Specialization Management Details */}
            {activePrereq === "specializations" && (
              <div className="space-y-6 opacity-0 animate-fade-in">
                
                {/* Header */}
                <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-xl font-black text-foreground flex items-center gap-2.5">
                      Specialization Management
                    </h1>
                    <p className="text-xs text-foreground-secondary font-medium mt-1">
                      Manage professional specializations, expertise areas, and skill requirements
                    </p>
                  </div>
                  <button
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95 shrink-0 self-start md:self-center"
                  >
                    <Plus size={14} className="stroke-[2.5]" />
                    <span>Add Specialization</span>
                  </button>
                </div>

                {/* Metrics Blocks */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-surface border border-border rounded-2xl flex items-center justify-between shadow-sm hover-lift cursor-pointer">
                    <div>
                      <span className="text-[10px] font-bold text-foreground-secondary uppercase tracking-wider block mb-1">Total Specializations</span>
                      <strong className="text-2xl font-black text-foreground">{specializations.length}</strong>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500"><Brain size={20} /></div>
                  </div>
                  <div className="p-4 bg-surface border border-border rounded-2xl flex items-center justify-between shadow-sm hover-lift cursor-pointer">
                    <div>
                      <span className="text-[10px] font-bold text-foreground-secondary uppercase tracking-wider block mb-1">Active Specializations</span>
                      <strong className="text-2xl font-black text-green-500">{specializations.filter(s => s.status === "Active").length}</strong>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500"><Bookmark size={20} /></div>
                  </div>
                  <div className="p-4 bg-surface border border-border rounded-2xl flex items-center justify-between shadow-sm hover-lift cursor-pointer">
                    <div>
                      <span className="text-[10px] font-bold text-foreground-secondary uppercase tracking-wider block mb-1">Total Professionals</span>
                      <strong className="text-2xl font-black text-indigo-500">
                        {specializations.reduce((sum, s) => sum + s.professionals, 0).toLocaleString()}
                      </strong>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500"><UserCheck size={20} /></div>
                  </div>
                  <div className="p-4 bg-surface border border-border rounded-2xl flex items-center justify-between shadow-sm hover-lift cursor-pointer">
                    <div>
                      <span className="text-[10px] font-bold text-foreground-secondary uppercase tracking-wider block mb-1">Avg Salary</span>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-2xl font-black text-amber-600 dark:text-amber-500">
                          ${Math.round(specializations.reduce((sum, s) => sum + s.salary, 0) / specializations.length).toLocaleString()}
                        </strong>
                        <ArrowUpRight size={16} className="text-amber-600 dark:text-amber-500 animate-pulse" />
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-500"><TrendingUp size={20} /></div>
                  </div>
                </div>

                {/* Filters */}
                <div className="bg-surface border border-border rounded-2xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-5 gap-3">
                  <div className="relative flex items-center col-span-1 sm:col-span-2">
                    <Search className="absolute left-3.5 text-foreground-muted" size={15} />
                    <input
                      type="text"
                      placeholder="Search specializations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-background-secondary border border-border rounded-xl pl-10! py-2.5 text-xs text-foreground focus:border-accent outline-none"
                    />
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-background-secondary border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:border-accent outline-none cursor-pointer font-medium"
                  >
                    <option value="">All Categories</option>
                    <option value="Technology">Technology</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Analytics">Analytics</option>
                    <option value="Management">Management</option>
                  </select>
                  <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    className="bg-background-secondary border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:border-accent outline-none cursor-pointer font-medium"
                  >
                    <option value="">All Levels</option>
                    <option value="Expert">Expert</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Beginner">Beginner</option>
                  </select>
                  <select
                    value={demandFilter}
                    onChange={(e) => setDemandFilter(e.target.value)}
                    className="bg-background-secondary border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:border-accent outline-none cursor-pointer font-medium"
                  >
                    <option value="">All Demand Levels</option>
                    <option value="High">High Demand</option>
                    <option value="Medium">Medium Demand</option>
                    <option value="Low">Low Demand</option>
                  </select>
                </div>

                {/* Table */}
                <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-background-secondary/30 text-[10px] font-bold uppercase tracking-wider text-foreground-muted text-left">
                        <th className="px-6 py-4">Specialization</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Level</th>
                        <th className="px-6 py-4">Requirements</th>
                        <th className="px-6 py-4">Market Data</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredSpecializations.map((s, idx) => (
                        <tr key={s._id} className={`hover:bg-surface-hover/30 transition-colors opacity-0 animate-fade-in ${idx < 5 ? `stagger-${idx + 1}` : ""}`}>
                          <td className="px-6 py-4">
                            <div className="font-bold text-foreground text-sm">{s.name}</div>
                            <div className="text-[11px] text-foreground-secondary font-medium mt-0.5">{s.description}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                              s.category === "Technology" ? "bg-blue-500/10 text-blue-500 border-blue-500/10" :
                              s.category === "Marketing" ? "bg-pink-500/10 text-pink-500 border-pink-500/10" :
                              s.category === "Analytics" ? "bg-purple-500/10 text-purple-500 border-purple-500/10" :
                              "bg-emerald-500/10 text-emerald-500 border-emerald-500/10"
                            }`}>
                              {s.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                              s.level === "Expert" ? "bg-violet-500/10 text-violet-500 border-violet-500/10" :
                              s.level === "Intermediate" ? "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/10" :
                              "bg-slate-500/10 text-slate-500 border-slate-500/10"
                            }`}>
                              {s.level}
                            </span>
                          </td>
                          <td className="px-6 py-4 space-y-1">
                            <div className="flex items-center gap-1.5 text-foreground-secondary font-medium">
                              <Clock size={13} className="text-foreground-muted" />
                              <span>{s.experience}</span>
                            </div>
                            <div className="flex items-center gap-1.5 font-bold text-[10px]">
                              <Award size={13} className={s.certRequired ? "text-indigo-500" : "text-foreground-muted"} />
                              <span className={s.certRequired ? "text-indigo-500" : "text-foreground-secondary"}>
                                {s.certRequired ? "Cert Required" : "No Cert Required"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-foreground">
                              <TrendingUp size={13} className="text-green-500" />
                              <span>${s.salary.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-foreground-secondary font-medium">
                              <Users size={13} className="text-foreground-muted" />
                              <span>{s.professionals} professionals</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => handleOpenEditModal(s)} className="w-7 h-7 rounded-full flex items-center justify-center bg-accent-muted/20 border border-accent/10 text-accent hover:bg-accent-muted/40 cursor-pointer"><Edit size={12} /></button>
                              <button onClick={() => handleDeleteItem(s._id)} className="w-7 h-7 rounded-full flex items-center justify-center bg-danger-muted/20 border border-danger/10 text-danger hover:bg-danger-muted/40 cursor-pointer"><Trash2 size={12} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredSpecializations.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-foreground-secondary font-medium">
                            No specializations match the current filter criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* 2. Employee Master Table view */}
            {activePrereq === "employees_list" && (
              <div className="space-y-6 opacity-0 animate-fade-in">
                <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <Users size={20} className="text-accent" />
                      Employee Master Directory
                    </h2>
                    <p className="text-xs text-foreground-secondary">View and configure employee status, designations, and departments</p>
                  </div>
                  <button
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    <Plus size={14} />
                    <span>Add Employee</span>
                  </button>
                </div>

                <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-background-secondary/30 text-[10px] font-bold uppercase tracking-wider text-foreground-muted text-left">
                        <th className="px-6 py-3">Employee</th>
                        <th className="px-6 py-3">Department</th>
                        <th className="px-6 py-3">Designation</th>
                        <th className="px-6 py-3">System Role</th>
                        <th className="px-6 py-3">Joined Date</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {employees.map((e, idx) => (
                        <tr key={e._id} className={`hover:bg-surface-hover/30 transition-colors opacity-0 animate-fade-in ${idx < 5 ? `stagger-${idx + 1}` : ""}`}>
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-accent-muted text-accent font-bold text-[10px] flex items-center justify-center shrink-0 border border-accent/15">
                                {`${e.firstName?.[0] || ""}${e.lastName?.[0] || ""}`}
                              </div>
                              <div>
                                <div className="font-bold text-foreground">{e.firstName} {e.lastName}</div>
                                <div className="text-[10px] text-foreground-secondary font-medium">{e.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3.5"><span className="px-2.5 py-0.5 rounded-full bg-accent-muted/40 text-accent font-bold text-[9px] uppercase">{e.department}</span></td>
                          <td className="px-6 py-3.5 text-foreground-secondary font-medium">{e.designation}</td>
                          <td className="px-6 py-3.5">
                            <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-foreground-muted/10 text-foreground-secondary">
                              {e.role}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 font-bold text-foreground">{e.joined}</td>
                          <td className="px-6 py-3.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${e.status === "Active" ? "bg-success-muted text-success" : "bg-danger-muted text-danger"}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${e.status === "Active" ? "bg-success animate-pulse" : "bg-danger"}`} />
                              {e.status}
                            </span>
                          </td>
                          <td className="px-6 py-3.5">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => handleOpenEditModal(e)} className="w-7 h-7 rounded-full flex items-center justify-center bg-accent-muted/20 border border-accent/10 text-accent hover:bg-accent-muted/40 cursor-pointer"><Edit size={12} /></button>
                              <button onClick={() => handleDeleteItem(e._id)} className="w-7 h-7 rounded-full flex items-center justify-center bg-danger-muted/20 border border-danger/10 text-danger hover:bg-danger-muted/40 cursor-pointer"><Trash2 size={12} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. Qualifications Master Table view */}
            {activePrereq === "qualifications" && (
              <div className="space-y-6 opacity-0 animate-fade-in">
                <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <GraduationCap size={20} className="text-accent" />
                      Qualifications Master Data
                    </h2>
                    <p className="text-xs text-foreground-secondary">Manage qualifications and educational parameters for staff</p>
                  </div>
                  <button
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    <Plus size={14} />
                    <span>Add Qualification</span>
                  </button>
                </div>

                <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-background-secondary/30 text-[10px] font-bold uppercase tracking-wider text-foreground-muted text-left">
                        <th className="px-6 py-3">Qualification Name</th>
                        <th className="px-6 py-3">Category</th>
                        <th className="px-6 py-3">Level</th>
                        <th className="px-6 py-3">Field of Study</th>
                        <th className="px-6 py-3">Duration</th>
                        <th className="px-6 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {qualifications.map((q, idx) => (
                        <tr key={q._id} className={`hover:bg-surface-hover/30 transition-colors opacity-0 animate-fade-in ${idx < 5 ? `stagger-${idx + 1}` : ""}`}>
                          <td className="px-6 py-3.5 font-bold text-foreground">{q.name}</td>
                          <td className="px-6 py-3.5"><span className="px-2.5 py-0.5 rounded-full bg-accent-muted/40 text-accent font-bold text-[9px] uppercase">{q.category}</span></td>
                          <td className="px-6 py-3.5"><span className="px-2.5 py-0.5 rounded-full bg-surface-hover text-foreground-secondary font-semibold text-[9px] uppercase">{q.level}</span></td>
                          <td className="px-6 py-3.5 text-foreground-secondary">{q.field}</td>
                          <td className="px-6 py-3.5 font-bold text-foreground">{q.duration}</td>
                          <td className="px-6 py-3.5">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => handleOpenEditModal(q)} className="w-7 h-7 rounded-full flex items-center justify-center bg-accent-muted/20 border border-accent/10 text-accent hover:bg-accent-muted/40 cursor-pointer"><Edit size={12} /></button>
                              <button onClick={() => handleDeleteItem(q._id)} className="w-7 h-7 rounded-full flex items-center justify-center bg-danger-muted/20 border border-danger/10 text-danger hover:bg-danger-muted/40 cursor-pointer"><Trash2 size={12} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. Generic Parameter list view */}
            {activePrereq !== "specializations" && activePrereq !== "qualifications" && activePrereq !== "employees_list" && activePrereq !== "products_list" && (
              <div className="space-y-6 opacity-0 animate-fade-in">
                <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2 capitalize">
                      <Tag size={20} className="text-accent" />
                      Configure {activePrereq.replace("_", " ")}
                    </h2>
                    <p className="text-xs text-foreground-secondary">Manage parameter indices and status configurations</p>
                  </div>
                  <button
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    <Plus size={14} />
                    <span>Add Parameter</span>
                  </button>
                </div>

                <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-background-secondary/30 text-[10px] font-bold uppercase tracking-wider text-foreground-muted text-left">
                        <th className="px-6 py-3">Parameter Name</th>
                        <th className="px-6 py-3">System Code</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {getGenericList().map((item, idx) => (
                        <tr key={item._id} className={`hover:bg-surface-hover/30 transition-colors opacity-0 animate-fade-in ${idx < 5 ? `stagger-${idx + 1}` : ""}`}>
                          <td className="px-6 py-3.5 font-bold text-foreground flex items-center gap-2">
                            <Layers size={14} className="text-accent" />
                            <span>{item.name}</span>
                          </td>
                          <td className="px-6 py-3.5 font-mono text-[10px] text-foreground-secondary">{item._id.toUpperCase()}</td>
                          <td className="px-6 py-3.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${item.status === "Active" ? "bg-success-muted text-success" : "bg-danger-muted text-danger"}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${item.status === "Active" ? "bg-success animate-pulse" : "bg-danger"}`} />
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-3.5">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => handleOpenEditModal(item)} className="w-7 h-7 rounded-full flex items-center justify-center bg-accent-muted/20 border border-accent/10 text-accent hover:bg-accent-muted/40 cursor-pointer"><Edit size={12} /></button>
                              <button onClick={() => handleDeleteItem(item._id)} className="w-7 h-7 rounded-full flex items-center justify-center bg-danger-muted/20 border border-danger/10 text-danger hover:bg-danger-muted/40 cursor-pointer"><Trash2 size={12} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* -------------------- ADD / EDIT MODALS -------------------- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={formMode === "new" ? "Add Parameter Record" : "Edit Parameter Record"}
        className="max-w-xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          
          {/* Specialization Form */}
          {activePrereq === "specializations" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Specialization Name <span className="text-danger">*</span></label>
                <div className="relative flex items-center">
                  <Brain className="absolute left-3.5 text-foreground-muted" size={16} />
                  <input
                    required
                    placeholder="e.g. Frontend Development"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value.replace(/[^a-zA-Z0-9\s'-]/g, "") })}
                    className="w-full bg-background-secondary border border-border rounded-xl pl-10! py-2.5 text-xs text-foreground focus:border-accent outline-none font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Description <span className="text-danger">*</span></label>
                <textarea
                  required
                  placeholder="Describe focus area and required skill details..."
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full min-h-20 bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:border-accent outline-none font-medium resize-y"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Category</label>
                  <select
                    value={formData.category || "Technology"}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:border-accent outline-none font-medium cursor-pointer"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Analytics">Analytics</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Level</label>
                  <select
                    value={formData.level || "Expert"}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:border-accent outline-none font-medium cursor-pointer"
                  >
                    <option value="Expert">Expert</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Beginner">Beginner</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Experience Requirement <span className="text-danger">*</span></label>
                  <div className="relative flex items-center">
                    <Clock className="absolute left-3.5 text-foreground-muted" size={16} />
                    <input
                      required
                      placeholder="e.g. 5 years"
                      value={formData.experience || ""}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full bg-background-secondary border border-border rounded-xl pl-10! py-2.5 text-xs text-foreground focus:border-accent outline-none font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Certification Required</label>
                  <select
                    value={formData.certRequired ? "true" : "false"}
                    onChange={(e) => setFormData({ ...formData, certRequired: e.target.value === "true" })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:border-accent outline-none font-medium cursor-pointer"
                  >
                    <option value="true">Required</option>
                    <option value="false">No Cert Required</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Average Salary ($) <span className="text-danger">*</span></label>
                  <div className="relative flex items-center">
                    <Coins className="absolute left-3.5 text-foreground-muted" size={16} />
                    <input
                      required
                      type="number"
                      placeholder="e.g. 95000"
                      value={formData.salary || ""}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      className="w-full bg-background-secondary border border-border rounded-xl pl-10! py-2.5 text-xs text-foreground focus:border-accent outline-none font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Total Professionals <span className="text-danger">*</span></label>
                  <div className="relative flex items-center">
                    <Users className="absolute left-3.5 text-foreground-muted" size={16} />
                    <input
                      required
                      type="number"
                      placeholder="e.g. 245"
                      value={formData.professionals || ""}
                      onChange={(e) => setFormData({ ...formData, professionals: e.target.value })}
                      className="w-full bg-background-secondary border border-border rounded-xl pl-10! py-2.5 text-xs text-foreground focus:border-accent outline-none font-medium"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Demand Level</label>
                  <select
                    value={formData.demandLevel || "Medium"}
                    onChange={(e) => setFormData({ ...formData, demandLevel: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:border-accent outline-none font-medium cursor-pointer"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Status</label>
                  <select
                    value={formData.status || "Active"}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:border-accent outline-none font-medium cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Qualification Form */}
          {activePrereq === "qualifications" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Qualification Name <span className="text-danger">*</span></label>
                <div className="relative flex items-center">
                  <BookOpen className="absolute left-3.5 text-foreground-muted" size={16} />
                  <input
                    required
                    placeholder="e.g. Master of Science"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl pl-10! py-2.5 text-xs text-foreground focus:border-accent outline-none font-medium"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Category</label>
                  <select
                    value={formData.category || "Undergraduate"}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:border-accent outline-none font-medium cursor-pointer"
                  >
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                    <option value="Professional Certification">Professional Certification</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Education Level</label>
                  <select
                    value={formData.level || "Bachelor"}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:border-accent outline-none font-medium cursor-pointer"
                  >
                    <option value="Associate">Associate</option>
                    <option value="Bachelor">Bachelor</option>
                    <option value="Master">Master</option>
                    <option value="Doctorate">Doctorate</option>
                    <option value="Professional">Professional</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Field of Study <span className="text-danger">*</span></label>
                  <div className="relative flex items-center">
                    <Sliders className="absolute left-3.5 text-foreground-muted" size={16} />
                    <input
                      required
                      placeholder="e.g. Computer Science"
                      value={formData.field || ""}
                      onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                      className="w-full bg-background-secondary border border-border rounded-xl pl-10! py-2.5 text-xs text-foreground focus:border-accent outline-none font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Course Duration <span className="text-danger">*</span></label>
                  <div className="relative flex items-center">
                    <Clock className="absolute left-3.5 text-foreground-muted" size={16} />
                    <input
                      required
                      placeholder="e.g. 4 years"
                      value={formData.duration || ""}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full bg-background-secondary border border-border rounded-xl pl-10! py-2.5 text-xs text-foreground focus:border-accent outline-none font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Employee Form */}
          {activePrereq === "employees_list" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">First Name <span className="text-danger">*</span></label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3.5 text-foreground-muted" size={16} />
                    <input
                      required
                      placeholder="First name"
                      value={formData.firstName || ""}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value.replace(/[^a-zA-Z\s'-]/g, "") })}
                      className="w-full bg-background-secondary border border-border rounded-xl pl-10! py-2.5 text-xs text-foreground focus:border-accent outline-none font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Last Name <span className="text-danger">*</span></label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3.5 text-foreground-muted" size={16} />
                    <input
                      required
                      placeholder="Last name"
                      value={formData.lastName || ""}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value.replace(/[^a-zA-Z\s'-]/g, "") })}
                      className="w-full bg-background-secondary border border-border rounded-xl pl-10! py-2.5 text-xs text-foreground focus:border-accent outline-none font-medium"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Email Address <span className="text-danger">*</span></label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 text-foreground-muted" size={16} />
                  <input
                    required
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value.trim() })}
                    className="w-full bg-background-secondary border border-border rounded-xl pl-10! py-2.5 text-xs text-foreground focus:border-accent outline-none font-medium"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Department</label>
                  <select
                    value={formData.department || "Coding"}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:border-accent outline-none font-medium cursor-pointer"
                  >
                    <option value="Coding">Coding</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Technical">Technical</option>
                    <option value="HR">HR</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Designation</label>
                  <select
                    value={formData.designation || "Senior Lead"}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:border-accent outline-none font-medium cursor-pointer"
                  >
                    <option value="Senior Lead">Senior Lead</option>
                    <option value="Manager">Manager</option>
                    <option value="Specialist">Specialist</option>
                    <option value="Junior Rep">Junior Rep</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">System Role</label>
                  <select
                    value={formData.role || "Admin"}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:border-accent outline-none font-medium cursor-pointer"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Senior Manager">Senior Manager</option>
                    <option value="Junior Rep">Junior Rep</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Status</label>
                <select
                  value={formData.status || "Active"}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:border-accent outline-none font-medium cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}

          {/* Generic Master Parameter Form */}
          {activePrereq !== "specializations" && activePrereq !== "qualifications" && activePrereq !== "employees_list" && activePrereq !== "products_list" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Parameter Title / Name <span className="text-danger">*</span></label>
                <div className="relative flex items-center">
                  <Tag className="absolute left-3.5 text-foreground-muted" size={16} />
                  <input
                    required
                    placeholder="Enter parameter label"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-background-secondary border border-border rounded-xl pl-10! py-2.5 text-xs text-foreground focus:border-accent outline-none font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Parameter Status</label>
                <select
                  value={formData.status || "Active"}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-background-secondary border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:border-accent outline-none font-medium cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}

          {/* Form Action Controls */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 bg-surface hover:bg-surface-hover border border-border text-foreground-secondary hover:text-foreground rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-7 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={13} />
              )}
              <span>{formMode === "new" ? "Create Record" : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
