import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthPage =
    pathname.includes("/login") || pathname.includes("/register");
  const isDashboardPage =
    pathname.includes("/dashboard") || pathname.includes("/quizzes");

  // Get auth tokens from cookies or headers
  const accessToken = request.cookies.get("accessToken")?.value;
  const user = request.cookies.get("user")?.value;

  // If accessing auth pages while already authenticated, redirect to dashboard
  if (isAuthPage && accessToken && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If accessing protected pages without authentication, redirect to login
  if (isDashboardPage && (!accessToken || !user)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
