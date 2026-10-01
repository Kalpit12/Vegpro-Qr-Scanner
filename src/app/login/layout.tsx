import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in · VegPro Admin",
  description: "Sign in to the VegPro Digital Flower Passport administration.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full w-full flex-1 flex-col bg-muted/20">
      {children}
    </div>
  );
}
