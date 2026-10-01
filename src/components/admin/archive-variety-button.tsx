"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ArchiveVarietyButton({ recordId }: { recordId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function archive() {
    if (!confirm("Archive this variety? The public identifier will be retained.")) {
      return;
    }
    setLoading(true);
    const response = await fetch(`/api/flowers/${recordId}/archive`, {
      method: "POST",
    });
    setLoading(false);
    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <Button type="button" variant="destructive" size="sm" onClick={archive} disabled={loading}>
      {loading ? "Archiving…" : "Archive"}
    </Button>
  );
}
