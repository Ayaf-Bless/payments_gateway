import { cookies } from "next/headers";
import { NextRequest } from "next/server";

// Server Component/API Route helper
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value || null;
}

// Middleware helper (for request-based access)
export function getAuthTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get("auth_token")?.value || null;
}

// Type guard for authenticated requests
export function isAuthenticated(request?: NextRequest): boolean {
  if (request) {
    return !!getAuthTokenFromRequest(request);
  }
  return !!getAuthToken();
}
