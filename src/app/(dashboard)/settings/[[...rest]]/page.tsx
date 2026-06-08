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
    </div>
  );
}
