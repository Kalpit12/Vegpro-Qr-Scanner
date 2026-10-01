import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSessionRole } from "@/lib/authz";
import { AdminLayoutClient } from "@/components/admin/admin-layout-client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  const role = getSessionRole(session);
  if (!role) {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <div className="flex min-h-full w-full min-w-0 flex-1 flex-col bg-background">
      <AdminLayoutClient
        role={role}
        userName={session.user.name}
        userEmail={session.user.email}
      >
        {children}
      </AdminLayoutClient>
    </div>
  );
}
