"use client";

import { UserButton } from "@clerk/nextjs";
import { Bell, Search, Menu, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/components/theme-provider";
import ThemeToggle from "@/components/theme-toggle";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 h-[var(--header-height)] border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left: Mobile menu + Search */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>

          {/* Search Bar */}
          <div className="hidden sm:flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 w-64 lg:w-80 transition-all duration-200 focus-within:border-[var(--border-focus)] focus-within:shadow-[var(--shadow-glow)]">
            <Search size={16} className="text-[var(--foreground-muted)] shrink-0" />
            <input
              type="text"
              placeholder="Search leads, contacts, tickets..."
              className="bg-transparent border-none outline-none text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] w-full"
            />
            <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-[var(--foreground-muted)] bg-[var(--background)] border border-[var(--border)]">
              ⌘K
            </kbd>
          </div>

          {/* Mobile search toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="sm:hidden p-2 rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
          >
            <Search size={20} />
          </button>
        </div>

        {/* Right: Theme Toggle + Notifications + Profile */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Notification Bell */}
          <button className="relative p-2 rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--danger)] ring-2 ring-[var(--background)]" />
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-[var(--border)] mx-1" />

          {/* Clerk User Button */}
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8 rounded-lg",
              },
            }}
          />
        </div>
      </div>

      {/* Mobile Search Expanded */}
      {searchOpen && (
        <div className="sm:hidden px-4 pb-3 animate-fade-in">
          <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2">
            <Search size={16} className="text-[var(--foreground-muted)]" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] w-full"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}
