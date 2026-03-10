import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/", "/login", "/register"];
const authPaths = ["/login", "/register", "/verify-email"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const userCookie = request.cookies.get("user")?.value;
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Parse user data to get role
  let user = null;
  if (userCookie) {
    try {
      user = JSON.parse(userCookie);
    } catch (e) {
      // Invalid user cookie
      console.error("Failed to parse user cookie");
    }
  }

  // If user is authenticated and tries to access auth pages, redirect to dashboard
  if (token && user && authPaths.some((path) => pathname.startsWith(path))) {
    const dashboardPath =
      user.role === "ADMIN"
        ? "/admin/dashboard"
        : user.role === "EMPLOYER"
        ? "/employer/dashboard"
        : "/candidate/dashboard";
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  // Protect dashboard routes
  if (
    pathname.startsWith("/candidate") ||
    pathname.startsWith("/employer") ||
    pathname.startsWith("/admin")
  ) {
    if (!token || !user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Role-based access control
    if (pathname.startsWith("/candidate") && user.role !== "CANDIDATE") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (pathname.startsWith("/employer") && user.role !== "EMPLOYER") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (pathname.startsWith("/admin") && user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

// Specify which routes should be processed by middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
