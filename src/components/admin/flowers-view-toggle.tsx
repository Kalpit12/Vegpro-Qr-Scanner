"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function FlowersViewToggle() {
  const searchParams = useSearchParams();
  const current = searchParams.get("view") === "list" ? "list" : "grid";

  function hrefFor(view: "grid" | "list") {
    const params = new URLSearchParams(searchParams.toString());
    if (view === "grid") {
      params.delete("view");
    } else {
      params.set("view", "list");
    }
    const query = params.toString();
    return query ? `/admin/flowers?${query}` : "/admin/flowers";
  }

  return (
    <div
      className="inline-flex border border-border text-sm"
      role="group"
      aria-label="Catalog view"
    >
      <Link
        href={hrefFor("grid")}
        className={cn(
          "px-3 py-1.5 font-medium transition-colors",
          current === "grid"
            ? "bg-botanical-soft text-botanical"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        )}
      >
        Grid
      </Link>
      <Link
        href={hrefFor("list")}
        className={cn(
          "border-l border-border px-3 py-1.5 font-medium transition-colors",
          current === "list"
            ? "bg-botanical-soft text-botanical"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        )}
      >
        List
      </Link>
    </div>
  );
}
