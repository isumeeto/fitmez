import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow next internals, static files, images, and api routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/mock") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get("dripcheck_session")?.value;
  const onboarded = request.cookies.get("dripcheck_onboarded")?.value;

  const isAuthRoute = pathname === "/login";
  const isOnboardingRoute = pathname === "/onboarding";

  if (!session) {
    if (!isOnboardingRoute && !isAuthRoute) {
      if (!onboarded) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // If logged in, avoid login / onboarding screens
  if (isAuthRoute || isOnboardingRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
