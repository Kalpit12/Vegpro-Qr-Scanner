import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/authz";

export default async function AdminCategoriesGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || !hasRole(session, ["ADMIN"])) {
    redirect("/admin/flowers");
  }
  return children;
}
