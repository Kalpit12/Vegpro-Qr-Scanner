import type { Flower } from "@/domain/flower";
import { FLOWER_STATUS_LABELS } from "@/domain/enums";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "botanical" | "neutral" | "dim" | "whisper";
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 rounded-full px-2.5 text-[0.6875rem] font-medium normal-case tracking-normal",
        tone === "botanical" &&
          "border-botanical/25 bg-botanical-soft text-botanical",
        tone === "dim" && "border-border bg-transparent text-muted-foreground",
        tone === "neutral" && "border-border bg-background text-foreground/80",
        tone === "whisper" &&
          "border-transparent bg-transparent px-2 text-muted-foreground/75",
      )}
    >
      {children}
    </Badge>
  );
}

export function VarietyStatusBadges({ flower }: { flower: Flower }) {
  const statusLabel = FLOWER_STATUS_LABELS[flower.status];
  const statusTone =
    flower.status === "APPROVED" || flower.status === "COMMERCIAL"
      ? "botanical"
      : flower.status === "ARCHIVED" || flower.status === "DRAFT"
        ? "dim"
        : "neutral";

  return (
    <div className="flex flex-wrap gap-1.5">
      <StatusBadge tone={statusTone}>{statusLabel}</StatusBadge>
      {flower.publicVisible ? (
        <StatusBadge tone="botanical">Public</StatusBadge>
      ) : (
        <StatusBadge tone="neutral">Private</StatusBadge>
      )}
      {flower.source.system === "Demo" ? (
        <StatusBadge tone="whisper">Demo</StatusBadge>
      ) : null}
    </div>
  );
}
