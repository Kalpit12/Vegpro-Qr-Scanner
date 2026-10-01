import { z } from "zod";
import {
  DEVELOPMENT_STAGES,
  FLOWER_STATUSES,
  PARAMETER_DATA_TYPES,
} from "@/domain/enums";

export const flowerStatusSchema = z.enum(FLOWER_STATUSES);
export const developmentStageSchema = z.enum(DEVELOPMENT_STAGES);
export const parameterDataTypeSchema = z.enum(PARAMETER_DATA_TYPES);

const parameterValueInputSchema = z.object({
  parameterDefinitionId: z.string().uuid(),
  value: z.string().min(1),
  publicVisible: z.boolean().optional(),
});

const imageInputSchema = z.object({
  id: z.string().uuid().optional(),
  url: z.string().url(),
  altText: z.string().optional(),
  displayOrder: z.number().int().optional(),
  publicVisible: z.boolean().optional(),
  isPrimary: z.boolean().optional(),
});

const varietyRelationInputSchema = z.object({
  relationType: z.enum(["PARENT_OF", "RELATED_TO"]),
  otherFlowerRecordId: z.string().uuid(),
  publicVisible: z.boolean().optional(),
  thisFlowerIsParent: z.boolean().optional(),
});

const breedingInputSchema = z.object({
  breedingCode: z.string().optional(),
  publicSummary: z.string().optional(),
  publicVisible: z.boolean().optional(),
  breederNotesInternal: z.string().optional(),
  trialNotesInternal: z.string().optional(),
});

const breedingYearSchema = z
  .number()
  .int()
  .min(1900, "Breeding year must be 1900 or later")
  .max(2100, "Breeding year must be 2100 or earlier")
  .optional();

export const createFlowerSchema = z.object({
  externalId: z.string().optional(),
  varietyCode: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().optional(),
  categoryId: z.string().uuid(),
  flowerType: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  status: flowerStatusSchema.optional(),
  developmentStage: developmentStageSchema.optional(),
  origin: z.string().optional(),
  breeder: z.string().optional(),
  breedingProgram: z.string().optional(),
  breedingYear: breedingYearSchema,
  publicVisible: z.boolean().optional(),
  featured: z.boolean().optional(),
  parameters: z.array(parameterValueInputSchema).optional(),
  images: z.array(imageInputSchema).optional(),
  breeding: breedingInputSchema.optional(),
  varietyRelations: z.array(varietyRelationInputSchema).optional(),
});

export const updateFlowerSchema = createFlowerSchema.partial();

export const flowerListQuerySchema = z.object({
  search: z.string().optional(),
  status: flowerStatusSchema.optional(),
  categoryId: z.string().uuid().optional(),
  publicVisible: z.coerce.boolean().optional(),
  includeArchived: z.coerce.boolean().optional(),
  sortBy: z.enum(["name", "varietyCode", "updatedAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

export type CreateFlowerInput = z.infer<typeof createFlowerSchema>;
export type UpdateFlowerInput = z.infer<typeof updateFlowerSchema>;
