"use client";



import ThemeToggle from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[var(--background)] overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[var(--accent)] opacity-[0.05] blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500 opacity-[0.05] blur-[120px]" />

      {/* Theme Toggle in top-right */}
      <div className="absolute top-6 right-6 z-50 animate-fade-in">
        <div className="bg-[var(--surface)]/50 backdrop-blur-md border border-[var(--border)] rounded-xl shadow-lg p-1 hover:border-[var(--border-hover)] transition-all">
          <ThemeToggle />
        </div>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center gap-8 py-12">
        {/* Branding */}
        <div className="text-center space-y-2 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center shadow-lg shadow-[var(--accent)]/20">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              RVM <span className="gradient-text">CRM</span>
            </h1>
          </div>
        </div>

        <main className="w-full flex justify-center px-4 animate-fade-in-up">
          {children}
        </main>
      </div>
    </div>
  );
}
