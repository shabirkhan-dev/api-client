import { z } from "zod";

export const createEnvironmentSchema = z.object({
	workspaceId: z.string().min(1),
	name: z.string().min(1).max(100),
	variables: z.record(z.string(), z.string()).default({}),
	isActive: z.boolean().default(false),
});

export const updateEnvironmentSchema = z.object({
	name: z.string().min(1).max(100).optional(),
	variables: z.record(z.string(), z.string()).optional(),
	isActive: z.boolean().optional(),
	sortOrder: z.number().int().min(0).optional(),
});
