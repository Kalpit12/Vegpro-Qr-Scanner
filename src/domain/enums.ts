export const FLOWER_STATUSES = [
  "DRAFT",
  "TRIAL",
  "EVALUATION",
  "APPROVED",
  "COMMERCIAL",
  "ARCHIVED",
] as const;

export const DEVELOPMENT_STAGES = [
  "PARENT",
  "CROSS",
  "SEEDLING",
  "TRIAL",
  "EVALUATION",
  "SELECTED",
  "APPROVED",
  "COMMERCIAL",
] as const;

export const PARAMETER_DATA_TYPES = [
  "text",
  "number",
  "decimal",
  "boolean",
  "date",
  "percentage",
  "range",
  "select",
] as const;

export const FLOWER_STATUS_LABELS: Record<
  (typeof FLOWER_STATUSES)[number],
  string
> = {
  DRAFT: "Draft",
  TRIAL: "Trial",
  EVALUATION: "Evaluation",
  APPROVED: "Approved",
  COMMERCIAL: "Commercial",
  ARCHIVED: "Archived",
};

export const DEVELOPMENT_STAGE_LABELS: Record<
  (typeof DEVELOPMENT_STAGES)[number],
  string
> = {
  PARENT: "Parent",
  CROSS: "Cross",
  SEEDLING: "Seedling",
  TRIAL: "Trial",
  EVALUATION: "Evaluation",
  SELECTED: "Selected",
  APPROVED: "Approved",
  COMMERCIAL: "Commercial",
};
