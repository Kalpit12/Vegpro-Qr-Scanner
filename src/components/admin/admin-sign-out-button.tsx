"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function AdminSignOutButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Sign out
    </Button>
  );
}
