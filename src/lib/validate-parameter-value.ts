import { z } from "zod";
import type { ParameterDataType } from "@/domain/flower";

export const parameterValidationConfigSchema = z.object({
  options: z.array(z.string().min(1)).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
});

export type ParameterValidationConfig = z.infer<
  typeof parameterValidationConfigSchema
>;

export function parseParameterValidationConfig(
  raw: string | null | undefined,
): ParameterValidationConfig | null {
  if (!raw?.trim()) {
    return null;
  }
  try {
    const parsed = parameterValidationConfigSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

type DefinitionLike = {
  name: string;
  dataType: ParameterDataType;
  validationConfig: string | null;
};

export function validateParameterValue(
  definition: DefinitionLike,
  value: string,
): { valid: true } | { valid: false; message: string } {
  const trimmed = value.trim();
  if (!trimmed) {
    return { valid: false, message: `${definition.name}: value is required` };
  }

  const config = parseParameterValidationConfig(definition.validationConfig);

  switch (definition.dataType) {
    case "text":
      return { valid: true };

    case "number": {
      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed) || !/^-?\d+$/.test(trimmed)) {
        return { valid: false, message: `${definition.name}: must be a whole number` };
      }
      if (config?.min !== undefined && parsed < config.min) {
        return { valid: false, message: `${definition.name}: must be >= ${config.min}` };
      }
      if (config?.max !== undefined && parsed > config.max) {
        return { valid: false, message: `${definition.name}: must be <= ${config.max}` };
      }
      return { valid: true };
    }

    case "decimal": {
      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed)) {
        return { valid: false, message: `${definition.name}: must be a valid decimal` };
      }
      if (config?.min !== undefined && parsed < config.min) {
        return { valid: false, message: `${definition.name}: must be >= ${config.min}` };
      }
      if (config?.max !== undefined && parsed > config.max) {
        return { valid: false, message: `${definition.name}: must be <= ${config.max}` };
      }
      return { valid: true };
    }

    case "boolean": {
      if (!["true", "false"].includes(trimmed.toLowerCase())) {
        return { valid: false, message: `${definition.name}: must be true or false` };
      }
      return { valid: true };
    }

    case "date": {
      const parsed = Date.parse(trimmed);
      if (Number.isNaN(parsed)) {
        return { valid: false, message: `${definition.name}: must be a valid date` };
      }
      return { valid: true };
    }

    case "percentage": {
      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
        return {
          valid: false,
          message: `${definition.name}: must be a percentage between 0 and 100`,
        };
      }
      return { valid: true };
    }

    case "select": {
      if (!config?.options?.length) {
        return {
          valid: false,
          message: `${definition.name}: select options are not configured`,
        };
      }
      if (!config.options.includes(trimmed)) {
        return {
          valid: false,
          message: `${definition.name}: must be one of configured options`,
        };
      }
      return { valid: true };
    }

    case "range": {
      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed)) {
        return { valid: false, message: `${definition.name}: must be a number` };
      }
      if (config?.min === undefined || config?.max === undefined) {
        return {
          valid: false,
          message: `${definition.name}: range min/max are not configured`,
        };
      }
      if (parsed < config.min || parsed > config.max) {
        return {
          valid: false,
          message: `${definition.name}: must be between ${config.min} and ${config.max}`,
        };
      }
      return { valid: true };
    }

    default:
      return { valid: true };
  }
}
