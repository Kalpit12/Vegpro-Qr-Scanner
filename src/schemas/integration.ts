import { z } from "zod";

export const syncRequestSchema = z.object({
  mode: z.enum(["full", "incremental", "single"]),
  source: z.enum(["Demo", "VegPro"]),
  externalId: z.string().min(1).max(128).optional(),
});

export type SyncRequestBody = z.infer<typeof syncRequestSchema>;
