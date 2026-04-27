import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-[var(--foreground-secondary)] text-sm -mt-6">
        Sign in to your account to continue
      </p>
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full max-w-md mx-auto",
            card: "bg-[var(--surface)] border border-[var(--border)] shadow-2xl rounded-2xl",
          },
        }}
      />
    </div>
  );
}
