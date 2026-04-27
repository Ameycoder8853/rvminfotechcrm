"use client";

import { UserProfile } from "@clerk/nextjs";

export default function SettingsPage() {
  return (
    <div className="animate-fade-in">
      <div className="w-full">
        <UserProfile
          routing="path"
          path="/settings"
          appearance={{
            elements: {
              rootBox: "w-full max-w-6xl mx-auto flex justify-center",
              card: "w-full bg-transparent border-none shadow-none flex-row",
              navbar: "hidden md:flex w-64 bg-transparent border-none shrink-0 pr-8",
              navbarButton: "text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] rounded-xl transition-all px-4 py-3 text-sm font-medium",
              navbarButton__active: "text-[var(--accent)] bg-[var(--accent-muted)] font-bold shadow-sm",
              headerTitle: "text-2xl font-bold text-[var(--foreground)] tracking-tight",
              headerSubtitle: "text-[var(--foreground-secondary)] text-sm mb-8",
              profileSectionTitle: "text-lg font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-3 mb-6 mt-4",
              profileSectionContent: "text-[var(--foreground)] gap-8",
              formFieldLabel: "text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest mb-2 block",
              formFieldInput: "bg-[var(--background-secondary)] border border-[var(--border)] text-[var(--foreground)] rounded-xl focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-muted)] transition-all h-11 px-4 text-sm",
              formButtonPrimary: "bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold rounded-xl px-8 py-2.5 transition-all shadow-lg shadow-[var(--accent)]/20 active:scale-95",
              accordionTriggerButton: "text-[var(--foreground)] hover:bg-[var(--surface-hover)] rounded-xl px-4 py-3 transition-colors",
              badge: "bg-[var(--accent-muted)] text-[var(--accent)] border-none rounded-full px-3 py-1 text-[10px] font-bold uppercase",
              userPreviewMainIdentifier: "text-[var(--foreground)] font-bold",
              userPreviewSecondaryIdentifier: "text-[var(--foreground-secondary)]",
              scrollBox: "bg-transparent border-none",
              pageScrollBox: "bg-transparent p-0 pb-12",
              navbarMobileMenuButton: "text-[var(--foreground)]",
              userButtonPopoverFooter: "hidden",
              dividerLine: "bg-[var(--border)] opacity-50",
              identityPreviewText: "text-[var(--foreground)] font-medium",
              identityPreviewEditButtonIcon: "text-[var(--foreground-secondary)] hover:text-[var(--accent)]",
            },
          }}
        />
      </div>
    </div>
  );
}
