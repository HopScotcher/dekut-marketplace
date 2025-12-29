import { auth } from "./auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();

  // Protect /user and /sell routes
  if (
    request.nextUrl.pathname.startsWith("/user") ||
    request.nextUrl.pathname.startsWith("/sell")
  ) {
    if (!session) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*", "/sell/:path*"],
};
