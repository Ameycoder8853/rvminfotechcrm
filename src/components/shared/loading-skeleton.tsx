"use client";

import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

export function SkeletonLine({ className }: { className?: string }) {
  return <div className={cn("skeleton h-4 rounded", className)} />;
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 space-y-4",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="skeleton h-3 w-24 rounded" />
          <div className="skeleton h-8 w-20 rounded" />
        </div>
        <div className="skeleton w-11 h-11 rounded-xl" />
      </div>
      <div className="skeleton h-3 w-32 rounded" />
    </div>
  );
}

export function SkeletonTable({ className, count = 5 }: LoadingSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex gap-4 px-4 py-3">
        <div className="skeleton h-4 w-32 rounded" />
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-4 w-20 rounded" />
        <div className="skeleton h-4 w-28 rounded hidden lg:block" />
      </div>
      {/* Rows */}
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 px-4 py-3 border border-[var(--border)] rounded-lg"
        >
          <div className="skeleton h-4 w-32 rounded" />
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-4 w-20 rounded" />
          <div className="skeleton h-4 w-28 rounded hidden lg:block" />
        </div>
      ))}
    </div>
  );
}

export default function LoadingSkeleton({ className, count = 4 }: LoadingSkeletonProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
