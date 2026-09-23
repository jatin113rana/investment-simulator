import { z } from "zod";

/**
 * Common Zod validation schemas for system health & inputs.
 */
export const healthResponseSchema = z.object({
  status: z.literal("ok"),
  timestamp: z.string(),
  environment: z.string(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;
