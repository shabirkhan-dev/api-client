import { z } from "zod";

export const createWorkspaceSchema = z.object({
	name: z.string().min(1).max(100),
	slug: z
		.string()
		.min(2)
		.max(60)
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
});

export const updateWorkspaceSchema = z.object({
	name: z.string().min(1).max(100).optional(),
});
