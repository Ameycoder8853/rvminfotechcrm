import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-[var(--foreground-secondary)] text-sm -mt-6">
        Create your account to get started
      </p>
      <SignUp
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
