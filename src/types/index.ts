// ==========================================
// RVM Infotech CRM — Type Definitions
// ==========================================

export type UserRole = "admin" | "sales" | "service_tech" | "field_agent";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export type LeadSource =
  | "website"
  | "referral"
  | "cold_call"
  | "social_media"
  | "exhibition"
  | "other";

export type Priority = "low" | "medium" | "high" | "urgent";

export type QuoteStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "rejected"
  | "converted";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type TicketCategory =
  | "complaint"
  | "service_request"
  | "installation"
  | "general";

export type TicketStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "closed";

export type AttendanceType = "check_in" | "check_out";

export type ExpenseCategory =
  | "travel"
  | "food"
  | "accommodation"
  | "supplies"
  | "other";

export type ExpenseStatus = "pending" | "approved" | "rejected";

export type AMCStatus = "active" | "expired" | "renewed" | "cancelled";

export type InstallationStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export type DiaryEntryType = "task" | "meeting" | "reminder" | "visit";

// Navigation
export interface NavItem {
  title: string;
  href: string;
  icon: string;
  roles?: UserRole[];
  badge?: number;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

// API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Dashboard Stats
export interface DashboardStats {
  totalLeads: number;
  newLeadsThisMonth: number;
  conversionRate: number;
  openTickets: number;
  activeFieldAgents: number;
  totalRevenue: number;
  pendingOrders: number;
  pendingExpenses: number;
}
