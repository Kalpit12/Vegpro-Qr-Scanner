"use client";

import Link from "next/link";
import { useState } from "react";
import type { UserRole } from "@/domain";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AdminSignOutButton } from "@/components/admin/admin-sign-out-button";
import {
  type AdminNavGroup,
  isAdminNavActive,
} from "@/components/admin/admin-nav-config";

type AdminMobileNavProps = {
  role: UserRole;
  userName?: string | null;
  userEmail?: string | null;
  groups: AdminNavGroup[];
  currentPath?: string;
};

export function AdminMobileNav({
  role,
  userName,
  userEmail,
  groups,
  currentPath,
}: AdminMobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-border bg-card lg:hidden">
      <div className="flex min-w-0 items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="type-editorial-label">VegPro Admin</p>
          <p className="truncate text-sm font-medium">{userName ?? userEmail ?? role}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-expanded={open}
          aria-controls="admin-mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Menu"}
        </Button>
      </div>
      {open ? (
        <nav
          id="admin-mobile-menu"
          className="max-h-[70vh] overflow-y-auto border-t border-border px-3 py-3"
          aria-label="Admin mobile"
        >
          {groups.map((group) => (
            <div key={group.title} className="mb-4 last:mb-0">
              <p className="type-editorial-label mb-2 px-2">{group.title}</p>
              <div className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const active = isAdminNavActive(item.href, currentPath);
                  return (
                    <Link
                      key={`${group.title}-${item.label}`}
                      href={item.href}
                      className={cn(
                        "rounded-sm px-3 py-3 text-sm font-medium",
                        active
                          ? "bg-botanical-soft text-botanical"
                          : "text-muted-foreground",
                      )}
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="mt-3 border-t border-border pt-3">
            <AdminSignOutButton />
          </div>
        </nav>
      ) : null}
    </header>
  );
}
