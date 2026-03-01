import { NextResponse, type NextRequest } from "next/server";
import { verifyToken, type SessionPayload } from "./auth";
import { canWrite } from "./permissions";
import type { StaffRole } from "@/generated/prisma/client";

type AuthHandler = (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> },
  session: SessionPayload
) => Promise<NextResponse>;

export function withAuth(handler: AuthHandler, allowedRoles?: StaffRole[]) {
  return async (
    req: NextRequest,
    context: { params: Promise<Record<string, string>> }
  ) => {
    const token = req.cookies.get("coffman_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await verifyToken(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (allowedRoles && !allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const isWriteMethod = ["POST", "PUT", "DELETE", "PATCH"].includes(req.method);
    if (isWriteMethod && !canWrite(session.role, req.nextUrl.pathname)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return handler(req, context, session);
  };
}
