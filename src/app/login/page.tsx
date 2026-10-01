"use client";

import { Suspense } from "react";
import LoginForm from "@/components/admin/login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="flex flex-1 items-center justify-center p-8">Loading…</main>}>
      <LoginForm />
    </Suspense>
  );
}
