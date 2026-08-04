import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

async function verifyEdgeToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const token = req.cookies.get("token")?.value;
    if (!token) return redirectOrUnauthorized(req);
    const payload = await verifyEdgeToken(token);
    if (!payload || payload.role !== "ADMIN") return redirectOrUnauthorized(req);
  }

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/checkout")) {
    const token = req.cookies.get("token")?.value;
    if (!token) return redirectOrUnauthorized(req);
    const payload = await verifyEdgeToken(token);
    if (!payload) return redirectOrUnauthorized(req);
  }

  return NextResponse.next();
}

function redirectOrUnauthorized(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const loginUrl = new URL("/login", req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/dashboard/:path*", "/checkout/:path*"],
};
