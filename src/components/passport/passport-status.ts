import type { FlowerStatus, SourceSystem } from "@/domain/flower";

const STATUS_LABELS: Record<FlowerStatus, string> = {
  DRAFT: "Draft",
  TRIAL: "Trial",
  EVALUATION: "Evaluation",
  APPROVED: "Approved",
  COMMERCIAL: "Commercial",
  ARCHIVED: "Archived",
};

export function getPublicStatusLabel(status: FlowerStatus): string {
  return STATUS_LABELS[status];
}

export function getPassportVerificationLabel(
  source: SourceSystem,
  status: FlowerStatus,
): { title: string; detail: string } {
  if (source === "Demo") {
    return {
      title: "Demo passport",
      detail:
        "Illustrative demo data for platform testing. Not a live VegPro record.",
    };
  }

  return {
    title: "VegPro passport",
    detail: `Public variety record · ${getPublicStatusLabel(status)}`,
  };
}

export function formatPassportTimestamp(iso: string): string {
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) {
    return iso;
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(parsed));
}
