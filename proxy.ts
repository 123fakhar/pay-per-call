import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hasAdminCookie } from "@/lib/auth/cookie";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("X-DNS-Prefetch-Control", "off");

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!hasAdminCookie(request.headers.get("cookie"))) {
      const login = new URL("/admin/login", request.url);
      return NextResponse.redirect(login);
    }
  }

  if (pathname.startsWith("/api/admin") && pathname !== "/api/admin/login") {
    if (!hasAdminCookie(request.headers.get("cookie"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/applications", "/api/internal/:path*"],
};
