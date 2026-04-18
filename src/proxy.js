import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

/**
 * Server-side route guard for all /admin/* pages.
 *
 * Reads the `admin_token` httpOnly cookie, verifies the JWT, and redirects to
 * /admin/login for any request that fails auth — before the page ever renders.
 *
 * This runs on the Edge runtime (no Node.js crypto) so we use `jose` instead
 * of `jsonwebtoken`.
 */
export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Allow the login page through — otherwise we get an infinite redirect loop
  if (pathname === "/admin/login") return NextResponse.next();

  const token  = request.cookies.get("admin_token")?.value;
  const secret = new TextEncoder().encode(
    process.env.NEXTAUTH_SECRET || "dev_secret"
  );

  if (token) {
    try {
      await jwtVerify(token, secret);
      return NextResponse.next(); // valid token — proceed
    } catch {
      // Expired or tampered — fall through to redirect
    }
  }

  // No token or invalid — redirect to login, preserving the intended destination
  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Only run on /admin/* pages (not API routes — those handle auth themselves)
  matcher: ["/admin/:path*"],
};
