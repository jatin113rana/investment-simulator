import { z } from "zod";

/**
 * Zod validation schema for Teacher classroom creation.
 */
export const createClassroomSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Classroom name must be at least 3 characters." })
    .max(50, { message: "Classroom name must not exceed 50 characters." }),
  startingBalance: z
    .number()
    .min(1000, { message: "Starting balance must be at least ₹1,000." })
    .max(1000000, { message: "Starting balance cannot exceed ₹10,00,000." })
    .default(10000),
});

export type CreateClassroomInput = z.infer<typeof createClassroomSchema>;

/**
 * Zod validation schema for Student joining a classroom by code.
 */
export const joinClassroomSchema = z.object({
  code: z
    .string()
    .length(6, { message: "Join code must be exactly 6 characters." })
    .transform((val) => val.trim().toUpperCase()),
});

export type JoinClassroomInput = z.infer<typeof joinClassroomSchema>;
