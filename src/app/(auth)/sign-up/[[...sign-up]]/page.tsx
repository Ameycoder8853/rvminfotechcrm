import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const { userId } = await auth();
  if (userId) {
    const resolvedParams = await searchParams;
    const redirectUrl = resolvedParams.redirect_url;
    if (redirectUrl && redirectUrl.startsWith("/")) {
      redirect(redirectUrl);
    }
    redirect("/dashboard");
  }

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
