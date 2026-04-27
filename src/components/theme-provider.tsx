"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem("rvm-crm-theme") as Theme | null;
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
    }
    setMounted(true);
  }, []);

  // Apply theme to <html> element
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem("rvm-crm-theme", theme);
  }, [theme, mounted]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <ClerkProvider
        userProfileMode="navigation"
        userProfileUrl="/settings"
        appearance={{
          baseTheme: theme === "dark" ? dark : undefined,
          variables: {
            colorPrimary: "#6366f1",
            colorBackground: theme === "dark" ? "#1c1f32" : "#ffffff",
            colorText: theme === "dark" ? "#f1f5f9" : "#0f172a",
            colorTextSecondary: theme === "dark" ? "#94a3b8" : "#475569",
            colorInputBackground: theme === "dark" ? "#111320" : "#f8f9fc",
            colorInputText: theme === "dark" ? "#f1f5f9" : "#0f172a",
            borderRadius: "8px",
          },
          elements: {
            formButtonPrimary: "bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white border-none",
            card: "bg-[var(--surface)] border border-[var(--border)] shadow-xl",
            headerTitle: "text-[var(--foreground)]",
            headerSubtitle: "text-[var(--foreground-secondary)]",
            userButtonPopoverCard: "bg-[var(--surface)] border border-[var(--border)] shadow-2xl",
            userButtonPopoverActionButton: "text-[var(--foreground)] hover:bg-[var(--surface-hover)]",
            userButtonPopoverActionButtonText: "text-[var(--foreground)]",
            userButtonPopoverActionButtonIcon: "text-[var(--foreground-secondary)]",
            userPreviewMainIdentifier: "text-[var(--foreground)] font-bold",
            userPreviewSecondaryIdentifier: "text-[var(--foreground-secondary)]",
            footerActionLink: "text-[var(--accent)] hover:text-[var(--accent-hover)]",
            identityPreviewText: "text-[var(--foreground)]",
          },
        }}
      >
        {children}
      </ClerkProvider>
    </ThemeContext.Provider>
  );
}
