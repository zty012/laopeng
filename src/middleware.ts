import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-at-least-32-chars-long",
);

export async function middleware(request: NextRequest) {
  return NextResponse.next();

  // const { pathname } = request.nextUrl;

  // // 1. Exclude paths that don't need auth
  // if (
  //   pathname.startsWith("/login") ||
  //   pathname.startsWith("/api/auth") ||
  //   pathname.startsWith("/api/sso") ||
  //   pathname.startsWith("/api/bsch-login") ||
  //   pathname.startsWith("/api/bsch-authapi")
  // ) {
  //   return NextResponse.next();
  // }

  // // 2. Check for token in cookies
  // const token = request.cookies.get("auth_token")?.value;

  // if (!token) {
  //   const url = request.nextUrl.clone();
  //   url.pathname = "/login";
  //   return NextResponse.redirect(url);
  // }

  // // 3. Verify JWT
  // try {
  //   await jwtVerify(token, SECRET);
  //   return NextResponse.next();
  // } catch (error) {
  //   // 4. Verification failed, redirect to login
  //   const url = request.nextUrl.clone();
  //   url.pathname = "/login";
  //   return NextResponse.redirect(url);
  // }
}

// Config to specify matching paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes except auth/session)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)",
  ],
};
