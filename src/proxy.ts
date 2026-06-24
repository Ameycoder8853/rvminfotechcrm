import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rate-limiter";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

export const proxy = clerkMiddleware(async (auth, req) => {
  // Check authentication
  const { userId } = await auth();

  // Apply API Rate Limiting (except webhook endpoints)
  if (req.nextUrl.pathname.startsWith("/api/") && !req.nextUrl.pathname.startsWith("/api/webhooks")) {
    const rateLimitKey = userId || req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    
    // Allow max 100 requests per minute per user/IP
    if (isRateLimited(rateLimitKey, 100, 60000)) {
      return NextResponse.json(
        { error: "Too Many Requests", message: "You have exceeded the rate limit. Please try again in a minute." },
        { status: 429 }
      );
    }
  }

  // Allow public routes
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

  // All other pages require authentication
  await auth.protect();

  return NextResponse.next();
});

export default proxy;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
