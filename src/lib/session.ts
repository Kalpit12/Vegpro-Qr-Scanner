import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/authz";
import type { UserRole } from "@/domain";

export async function getAuthSession() {
  return auth();
}

export async function requireAuthSession() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireAuthRoles(allowed: UserRole[]) {
  const session = await requireAuthSession();
  if (!hasRole(session, allowed)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

export async function getAuthUserId(): Promise<string | undefined> {
  const session = await auth();
  return session?.user?.id;
}
