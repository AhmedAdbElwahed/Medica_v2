import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Public paths - if already logged in, redirect to respective dashboard
    const PUBLIC_PATHS = ["/login", "/register", "/verify-email", "/reset-password"];
    if (PUBLIC_PATHS.some((p) => pathname.startsWith(p)) && token) {
      if (token.role === "ROLE_ADMIN") return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      if (token.role === "ROLE_DOCTOR") return NextResponse.redirect(new URL("/doctor/dashboard", req.url));
      if (token.role === "ROLE_PATIENT") return NextResponse.redirect(new URL("/patient/dashboard", req.url));
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Role-based path enforcement
    if (pathname.startsWith("/admin") && token?.role !== "ROLE_ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (
      pathname.startsWith("/doctor") &&
      !["ROLE_ADMIN", "ROLE_DOCTOR"].includes(token?.role as string)
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (
      pathname.startsWith("/patient") &&
      !["ROLE_ADMIN", "ROLE_PATIENT"].includes(token?.role as string)
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        const PUBLIC_PATHS = ["/login", "/register", "/verify-email", "/reset-password"];
        // If it's a public path, we are "authorized" to see it (but middleware function will redirect if logged in)
        if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return true;
        // Otherwise, need a token
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/doctor/:path*",
    "/patient/:path*",
    "/login",
    "/register",
    "/verify-email/:path*",
    "/reset-password/:path*",
  ],
};
