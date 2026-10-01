import Link from "next/link";
import type { UserRole } from "@/domain";
import { cn } from "@/lib/utils";
import { AdminSignOutButton } from "@/components/admin/admin-sign-out-button";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import {
  getVisibleAdminNavGroups,
  isAdminNavActive,
} from "@/components/admin/admin-nav-config";

type AdminShellProps = {
  children: React.ReactNode;
  role: UserRole;
  userName?: string | null;
  userEmail?: string | null;
  currentPath?: string;
};

export function AdminShell({
  children,
  role,
  userName,
  userEmail,
  currentPath,
}: AdminShellProps) {
  const navGroups = getVisibleAdminNavGroups(role);

  return (
    <div className="flex min-h-full w-full min-w-0 flex-1 flex-col lg:flex-row">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
        <div className="border-b border-border px-6 py-6">
          <p className="type-editorial-label">VegPro</p>
          <p className="mt-2 font-display text-2xl font-semibold leading-none text-foreground">
            Flower Passport
          </p>
          <p className="mt-2 type-meta">Internal administration · Demo data</p>
        </div>
        <nav className="flex flex-1 flex-col gap-6 p-4" aria-label="Admin">
          {navGroups.map((group) => (
            <div key={group.title}>
              <p className="type-editorial-label mb-2 px-2">{group.title}</p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = isAdminNavActive(item.href, currentPath);
                  return (
                    <Link
                      key={`${group.title}-${item.label}`}
                      href={item.href}
                      className={cn(
                        "rounded-sm px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-botanical-soft text-botanical"
                          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-border p-4">
          <p className="truncate text-sm font-medium text-foreground">
            {userName ?? "Signed in"}
          </p>
          <p className="truncate type-meta">{userEmail}</p>
          <p className="mt-1 type-meta uppercase tracking-wide">{role}</p>
          <div className="mt-3">
            <AdminSignOutButton />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminMobileNav
          role={role}
          userName={userName}
          userEmail={userEmail}
          groups={navGroups}
          currentPath={currentPath}
        />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
