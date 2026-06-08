"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
  description?: string;
}

export default function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "var(--accent)",
  description,
}: StatsCardProps) {
  return (
    <div className="group relative bg-surface border border-border rounded-xl p-5 hover:border-border-hover transition-all duration-300 hover:shadow-shadow-md card-hover">
      {/* Hover glow effect */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(300px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${iconColor}10, transparent 60%)`,
        }}
      />

      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
            {title}
          </p>
          <p className="text-2xl lg:text-3xl font-bold text-foreground">
            {value}
          </p>
          {change && (
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "text-xs font-semibold px-1.5 py-0.5 rounded",
                  changeType === "positive" && "text-success bg-success-muted",
                  changeType === "negative" && "text-danger bg-danger-muted",
                  changeType === "neutral" && "text-foreground-muted bg-surface-hover"
                )}
              >
                {change}
              </span>
              {description && (
                <span className="text-xs text-foreground-muted">
                  {description}
                </span>
              )}
            </div>
          )}
        </div>

        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${iconColor}15`, color: iconColor }}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}
