import { NextResponse, NextRequest } from "next/server";

// middleware.ts
export async function middleware(request: NextRequest) {
  const authToken = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  // Handle root path specifically
  if (pathname === "/") {
    if (!authToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Allow access to dashboard (root path) if authenticated
    return NextResponse.next();
  }

  // Protected sub-routes
  const protectedRoutes = ["/payments", "/profile"];
  if (
    protectedRoutes.some((route) => pathname.startsWith(route)) &&
    !authToken
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect away from auth pages if logged in
  if (["/login", "/register"].includes(pathname) && authToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}
