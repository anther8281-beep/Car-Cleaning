import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// Edge-safe proxy (Next.js 16's renamed Middleware). This is an *optimistic*
// auth check that redirects unauthenticated visitors away from the dashboard
// and authenticated ones away from the login page. Real authorization is
// re-enforced server-side in the admin layout and API routes.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isOnDashboard = nextUrl.pathname.startsWith("/admin-dashboard");
  const isOnLogin = nextUrl.pathname === "/secure-admin-login";

  if (isOnDashboard && !isLoggedIn) {
    const url = new URL("/secure-admin-login", nextUrl);
    return NextResponse.redirect(url);
  }

  if (isOnLogin && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin-dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin-dashboard/:path*", "/secure-admin-login"],
};
