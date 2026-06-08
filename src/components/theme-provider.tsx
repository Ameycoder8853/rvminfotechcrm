"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ui } from "@clerk/ui";

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
        ui={ui}
        appearance={{
          theme: theme === "dark" ? dark : undefined,
          variables: {
            colorPrimary: "#6366f1",
            colorBackground: theme === "dark" ? "#1c1f32" : "#ffffff",
            colorForeground: theme === "dark" ? "#f1f5f9" : "#0f172a",
            colorMutedForeground: theme === "dark" ? "#94a3b8" : "#475569",
            colorInput: theme === "dark" ? "#111320" : "#f8f9fc",
            colorInputForeground: theme === "dark" ? "#f1f5f9" : "#0f172a",
            borderRadius: "8px",
          },
          elements: {
            formButtonPrimary: "bg-accent hover:bg-accent-hover text-white border-none",
            card: "bg-surface border border-border shadow-xl",
            headerTitle: "text-foreground",
            headerSubtitle: "text-foreground-secondary",
            userButtonPopoverCard: "bg-surface border border-border shadow-2xl",
            userButtonPopoverActionButton: "text-foreground hover:bg-surface-hover",
            userButtonPopoverActionButtonText: "text-foreground",
            userButtonPopoverActionButtonIcon: "text-foreground-secondary",
            userPreviewMainIdentifier: "text-foreground font-bold",
            userPreviewSecondaryIdentifier: "text-foreground-secondary",
            footerActionLink: "text-accent hover:text-accent-hover",
            identityPreviewText: "text-foreground",
          },
        }}
      >
        {children}
      </ClerkProvider>
    </ThemeContext.Provider>
  );
}
