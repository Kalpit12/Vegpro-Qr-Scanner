"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const DEMO_ADMIN_EMAIL = "admin@demo.vegpro.local";
const DEMO_ADMIN_PASSWORD = "DemoAdmin123!";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";
  const [email, setEmail] = useState(DEMO_ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(
        "Invalid email or password. Use the demo admin account after running db:seed.",
      );
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <main className="flex min-h-[calc(100dvh-1px)] w-full flex-1 items-center justify-center bg-background px-4 py-12 sm:py-16">
      <Card className="w-full max-w-md border-border shadow-none">
        <CardHeader className="space-y-2">
          <p className="type-editorial-label">VegPro · Flower Passport</p>
          <CardTitle className="type-page-title text-2xl sm:text-3xl">Sign in</CardTitle>
          <CardDescription>
            Internal access for VegPro Digital Flower Passport administration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2 border-t border-border/60 bg-muted/20 px-6 py-4 text-xs leading-relaxed text-muted-foreground">
          <p className="font-medium text-foreground/80">Demo admin (after seed)</p>
          <p>
            Email:{" "}
            <span className="font-mono text-foreground">{DEMO_ADMIN_EMAIL}</span>
          </p>
          <p>
            Password:{" "}
            <span className="font-mono text-foreground">{DEMO_ADMIN_PASSWORD}</span>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
