import type { UserRole } from "@/domain";
import type { Session } from "next-auth";

export function getSessionRole(session: Session | null): UserRole | null {
  const role = session?.user?.role;
  if (role === "ADMIN" || role === "BREEDER" || role === "VIEWER") {
    return role;
  }
  return null;
}

export function hasRole(
  session: Session | null,
  allowed: UserRole[],
): boolean {
  const role = getSessionRole(session);
  return role !== null && allowed.includes(role);
}

export function requireRole(
  session: Session | null,
  allowed: UserRole[],
): UserRole {
  const role = getSessionRole(session);
  if (!role || !allowed.includes(role)) {
    throw new Error("FORBIDDEN");
  }
  return role;
}
