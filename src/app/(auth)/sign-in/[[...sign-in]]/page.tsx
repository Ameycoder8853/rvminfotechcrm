import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-foreground-secondary text-sm -mt-6">
        Sign in to your account to continue
      </p>
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full max-w-md mx-auto",
            card: "bg-surface border border-border shadow-2xl rounded-2xl",
          },
        }}
      />
    </div>
  );
}
