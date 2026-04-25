import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RVM CRM — All-in-One Business Management",
  description:
    "Comprehensive CRM for Sales, Service & Team Operations. Manage leads, orders, tickets, and field teams from one powerful platform.",
  keywords: ["CRM", "Sales", "Service", "RVM Infotech", "Business Management"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#6366f1",
          colorBackground: "#1c1f32",
          colorText: "#f1f5f9",
          colorTextSecondary: "#94a3b8",
          colorTextOnPrimaryBackground: "#ffffff",
          colorInputBackground: "#111320",
          colorInputText: "#f1f5f9",
          colorNeutral: "#f1f5f9",
          colorDanger: "#ef4444",
          colorSuccess: "#22c55e",
          borderRadius: "8px",
        },
        elements: {
          formButtonPrimary: "bg-[#6366f1] hover:bg-[#818cf8] text-white",
          card: "bg-[#1c1f32] border border-[#2a2d44]",
          headerTitle: "text-[#f1f5f9]",
          headerSubtitle: "text-[#94a3b8]",
          socialButtonsBlockButton: "bg-[#111320] border-[#2a2d44] text-[#f1f5f9]",
          socialButtonsBlockButtonText: "text-[#f1f5f9]",
          dividerLine: "bg-[#2a2d44]",
          dividerText: "text-[#94a3b8]",
          formFieldLabel: "text-[#f1f5f9]",
          formFieldInput: "bg-[#111320] border-[#2a2d44] text-[#f1f5f9]",
          footerActionLink: "text-[#818cf8] hover:text-[#a5b4fc]",
          footerActionText: "text-[#94a3b8]",
          identityPreviewText: "text-[#f1f5f9]",
          identityPreviewEditButtonIcon: "text-[#94a3b8]",
        },
      }}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
