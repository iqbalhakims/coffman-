import type { StaffRole } from "@/generated/prisma/client";

// Pages each role can access
export const ROLE_PAGES: Record<StaffRole, string[]> = {
  OWNER: ["/dashboard", "/staff", "/inventory", "/menu", "/sales", "/reports"],
  MANAGER: ["/dashboard", "/staff", "/inventory", "/menu", "/sales", "/reports"],
  BARISTA: ["/dashboard", "/staff", "/inventory", "/menu", "/sales", "/reports"],
};

// API routes that require write access (POST/PUT/DELETE) — BARISTA is read-only except /api/sales
export const WRITE_RESTRICTED_ROUTES: Record<StaffRole, string[]> = {
  OWNER: [],
  MANAGER: [],
  BARISTA: ["/api/staff", "/api/ingredients", "/api/menu", "/api/reports", "/api/attendance"],
};

export function canWrite(role: StaffRole, pathname: string): boolean {
  const restricted = WRITE_RESTRICTED_ROUTES[role];
  return !restricted.some((r) => pathname.startsWith(r));
}
