import { z } from "zod";
import { PARAMETER_DATA_TYPES } from "@/domain/enums";

export const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createParameterDefinitionSchema = z.object({
  name: z.string().min(1),
  key: z
    .string()
    .min(1)
    .regex(/^[a-z0-9_]+$/, "Key must be lowercase letters, numbers, and underscores"),
  category: z.string().min(1),
  dataType: z.enum(PARAMETER_DATA_TYPES),
  unit: z.string().optional(),
  displayOrder: z.number().int().optional(),
  publicVisibility: z.boolean().optional(),
  isActive: z.boolean().optional(),
  validationConfig: z.string().optional(),
});

export const updateParameterDefinitionSchema =
  createParameterDefinitionSchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateParameterDefinitionInput = z.infer<
  typeof createParameterDefinitionSchema
>;
export type UpdateParameterDefinitionInput = z.infer<
  typeof updateParameterDefinitionSchema
>;
