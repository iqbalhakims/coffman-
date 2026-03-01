import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { canWrite } from "@/lib/permissions";

const PUBLIC_PATHS = ["/login", "/api/auth/login"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths and Next.js internals
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("coffman_session")?.value;
  const session = token ? await verifyToken(token) : null;
  const isApiRoute = pathname.startsWith("/api/");

  if (!session) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Block BARISTA write access to restricted API routes
  const isWriteMethod = ["POST", "PUT", "DELETE", "PATCH"].includes(req.method);
  if (isApiRoute && isWriteMethod && !canWrite(session.role, pathname)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
