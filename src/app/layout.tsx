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
          colorInputBackground: "#111320",
          colorInputText: "#f1f5f9",
          borderRadius: "8px",
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
