import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

export const proxy = clerkMiddleware(async (auth, req) => {
  // Check authentication status first
  const { userId } = await auth();

  // If the user is already logged in, redirect them to the page they wanted to visit, or dashboard
  if (userId && (req.nextUrl.pathname.startsWith("/sign-in") || req.nextUrl.pathname.startsWith("/sign-up") || req.nextUrl.pathname === "/")) {
    const redirectUrl = req.nextUrl.searchParams.get("redirect_url");
    if (redirectUrl) {
      try {
        const safeUrl = new URL(redirectUrl, req.url);
        // Only allow internal redirects (same origin) to prevent open redirect vulnerabilities
        if (safeUrl.origin === req.nextUrl.origin) {
          return NextResponse.redirect(safeUrl);
        }
      } catch (e) {
        // If it's a relative path (e.g. "/contacts?action=add"), prepend requesting host
        if (redirectUrl.startsWith("/")) {
          return NextResponse.redirect(new URL(redirectUrl, req.url));
        }
      }
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Allow other public routes for unauthenticated users
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // If unauthorized and calling an API route, return 401 JSON instead of HTML redirect
  if (!userId && req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Your session has expired. Please sign in again." },
      { status: 401 }
    );
  }

  // All other pages require authentication (redirect to sign-in page with redirect_url parameter)
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    // Preserving the full original path and search query parameters (e.g. /contacts?action=add)
    signInUrl.searchParams.set("redirect_url", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export default proxy;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
