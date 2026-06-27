import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// Next.js 16 Proxy (renamed Middleware). Two responsibilities:
//  1. Optimistic auth: redirect anon users off the dashboard and logged-in
//     users off the login page (real authz is re-checked server-side).
//  2. Per-request CSP nonce + security policy. Nonce-based script-src with
//     'strict-dynamic' blocks injected inline scripts; Next.js auto-applies the
//     nonce to its own framework scripts when it sees the CSP request header.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // ---- Auth redirects ----
  const isOnDashboard = nextUrl.pathname.startsWith("/admin-dashboard");
  const isOnLogin = nextUrl.pathname === "/secure-admin-login";
  if (isOnDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/secure-admin-login", nextUrl));
  }
  if (isOnLogin && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin-dashboard", nextUrl));
  }

  // ---- CSP with per-request nonce ----
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";
  const csp = [
    `default-src 'self'`,
    // 'unsafe-eval' is only needed by React's dev tooling.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // Inline styles: the injected brand-color <style> tag + framework styles.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data:`,
    `font-src 'self'`,
    `connect-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("content-security-policy", csp);
  return response;
});

export const config = {
  matcher: [
    {
      // Run on all pages except API routes and static assets; skip prefetches.
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
