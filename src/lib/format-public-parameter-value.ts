import type { PublicFlowerParameter } from "@/domain/flower";

export function formatPublicParameterValue(
  parameter: PublicFlowerParameter,
): string {
  const trimmed = parameter.value.trim();
  const { dataType, unit } = parameter;

  switch (dataType) {
    case "boolean":
      return trimmed.toLowerCase() === "true" ? "Yes" : "No";
    case "percentage":
      return trimmed.endsWith("%") ? trimmed : `${trimmed}%`;
    case "date": {
      const parsed = Date.parse(trimmed);
      if (Number.isNaN(parsed)) {
        return trimmed;
      }
      return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(
        new Date(parsed),
      );
    }
    case "range":
    case "select":
    case "text":
      return unit ? `${trimmed} ${unit}` : trimmed;
    case "number":
    case "decimal":
      return unit ? `${trimmed} ${unit}` : trimmed;
    default:
      return unit ? `${trimmed} ${unit}` : trimmed;
  }
}

export function groupPublicParameters(parameters: PublicFlowerParameter[]) {
  const sorted = [...parameters].sort(
    (left, right) => left.displayOrder - right.displayOrder,
  );
  const groups = new Map<string, PublicFlowerParameter[]>();

  for (const parameter of sorted) {
    const label = parameter.category.trim() || "Parameters";
    const bucket = groups.get(label);
    if (bucket) {
      bucket.push(parameter);
    } else {
      groups.set(label, [parameter]);
    }
  }

  return [...groups.entries()];
}
