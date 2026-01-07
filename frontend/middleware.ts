import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Check for access token in cookies or headers
  const token = request.cookies.get("dekut_access_token")?.value;

  // Protect /user and /sell routes
  if (
    request.nextUrl.pathname.startsWith("/user") ||
    request.nextUrl.pathname.startsWith("/sell")
  ) {
    if (!token) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*", "/sell/:path*"],
};
