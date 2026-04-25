import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[var(--accent)] opacity-[0.07] blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-purple-500 opacity-[0.05] blur-[100px]" />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Branding */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center">
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
          <p className="text-[var(--foreground-secondary)] text-sm">
            Sign in to your account to continue
          </p>
        </div>

        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full max-w-md",
              card: "bg-[var(--surface)] border border-[var(--border)] shadow-2xl",
            },
          }}
        />
      </div>
    </div>
  );
}
