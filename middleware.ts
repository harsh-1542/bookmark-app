import { type NextRequest, NextResponse } from "next/server";

/**
 * Middleware for route protection.
 *
 * Protected routes (require authentication):
 * - /dashboard
 * - /bookmarks/*
 * - /profile/*
 *
 * Public routes (no auth required):
 * - /login
 * - /signup
 * - /onboarding
 * - / (homepage)
 *
 * Behavior:
 * - Unauthenticated users accessing protected routes → redirect to /login
 * - Authenticated users accessing /login or /signup → redirect to /dashboard
 */

const protectedRoutes = ["/dashboard", "/bookmarks", "/profile"];
const authRoutes = ["/login", "/signup"];
const onboardingRoute = "/onboarding";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static assets and API routes
  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Check if user is authenticated via Supabase cookie
  // The Supabase auth cookie is automatically included in requests
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isOnboardingRoute = pathname.startsWith(onboardingRoute);

  try {
    // Verify session by checking for Supabase auth cookie
    // Supabase sets 'sb-auth-token' cookie on successful login
    const supabaseAuthToken = request.cookies.get("sb-auth-token");
    const hasAuth = !!supabaseAuthToken;

    // Rule 1: Redirect unauthenticated users away from protected routes
    if (isProtectedRoute && !hasAuth) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Rule 2: Redirect authenticated users away from auth routes
    // (they should go to dashboard or onboarding instead)
    if (isAuthRoute && hasAuth) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Rule 3: Allow onboarding route for newly authenticated users
    // (checked server-side in the page itself)

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // On error, allow request to proceed (fail open)
    return NextResponse.next();
  }
}

export const config = {
  // Run middleware on all routes except _next and static files
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
