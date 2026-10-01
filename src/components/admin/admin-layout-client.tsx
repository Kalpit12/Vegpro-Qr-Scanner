"use client";

import { usePathname } from "next/navigation";
import type { UserRole } from "@/domain";
import { AdminShell } from "@/components/admin/admin-shell";

export function AdminLayoutClient({
  children,
  role,
  userName,
  userEmail,
}: {
  children: React.ReactNode;
  role: UserRole;
  userName?: string | null;
  userEmail?: string | null;
}) {
  const pathname = usePathname();

  return (
    <AdminShell
      role={role}
      userName={userName}
      userEmail={userEmail}
      currentPath={pathname}
    >
      {children}
    </AdminShell>
  );
}
