"use client";

import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  // Leads
  new: { bg: "var(--info-muted)", text: "var(--info)", dot: "var(--info)" },
  contacted: { bg: "var(--warning-muted)", text: "var(--warning)", dot: "var(--warning)" },
  qualified: { bg: "var(--accent-muted)", text: "var(--accent)", dot: "var(--accent)" },
  proposal: { bg: "rgba(168,85,247,0.15)", text: "#a855f7", dot: "#a855f7" },
  negotiation: { bg: "rgba(236,72,153,0.15)", text: "#ec4899", dot: "#ec4899" },
  won: { bg: "var(--success-muted)", text: "var(--success)", dot: "var(--success)" },
  lost: { bg: "var(--danger-muted)", text: "var(--danger)", dot: "var(--danger)" },

  // Orders
  pending: { bg: "var(--warning-muted)", text: "var(--warning)", dot: "var(--warning)" },
  confirmed: { bg: "var(--info-muted)", text: "var(--info)", dot: "var(--info)" },
  processing: { bg: "var(--accent-muted)", text: "var(--accent)", dot: "var(--accent)" },
  shipped: { bg: "rgba(168,85,247,0.15)", text: "#a855f7", dot: "#a855f7" },
  delivered: { bg: "var(--success-muted)", text: "var(--success)", dot: "var(--success)" },
  cancelled: { bg: "var(--danger-muted)", text: "var(--danger)", dot: "var(--danger)" },

  // Tickets
  open: { bg: "var(--warning-muted)", text: "var(--warning)", dot: "var(--warning)" },
  assigned: { bg: "var(--info-muted)", text: "var(--info)", dot: "var(--info)" },
  in_progress: { bg: "var(--accent-muted)", text: "var(--accent)", dot: "var(--accent)" },
  resolved: { bg: "var(--success-muted)", text: "var(--success)", dot: "var(--success)" },
  closed: { bg: "var(--foreground-muted)", text: "var(--foreground-muted)", dot: "var(--foreground-muted)" },

  // Quotes
  draft: { bg: "var(--foreground-muted)", text: "var(--foreground-muted)", dot: "var(--foreground-muted)" },
  sent: { bg: "var(--info-muted)", text: "var(--info)", dot: "var(--info)" },
  accepted: { bg: "var(--success-muted)", text: "var(--success)", dot: "var(--success)" },
  rejected: { bg: "var(--danger-muted)", text: "var(--danger)", dot: "var(--danger)" },
  converted: { bg: "var(--success-muted)", text: "var(--success)", dot: "var(--success)" },

  // Expenses
  approved: { bg: "var(--success-muted)", text: "var(--success)", dot: "var(--success)" },

  // AMC
  active: { bg: "var(--success-muted)", text: "var(--success)", dot: "var(--success)" },
  expired: { bg: "var(--danger-muted)", text: "var(--danger)", dot: "var(--danger)" },
  renewed: { bg: "var(--info-muted)", text: "var(--info)", dot: "var(--info)" },

  // Installation
  scheduled: { bg: "var(--info-muted)", text: "var(--info)", dot: "var(--info)" },
  completed: { bg: "var(--success-muted)", text: "var(--success)", dot: "var(--success)" },

  // Attendance
  check_in: { bg: "var(--success-muted)", text: "var(--success)", dot: "var(--success)" },
  check_out: { bg: "var(--warning-muted)", text: "var(--warning)", dot: "var(--warning)" },
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status] || statusStyles["new"];
  const label = status.replace(/_/g, " ");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap",
        className
      )}
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: style.dot }}
      />
      {label}
    </span>
  );
}
