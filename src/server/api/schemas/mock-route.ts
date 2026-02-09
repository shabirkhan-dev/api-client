import { z } from "zod";

export const createMockRouteSchema = z.object({
	workspaceId: z.string().min(1),
	method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"]).default("GET"),
	path: z.string().min(1).max(500),
	status: z.number().int().min(100).max(599).default(200),
	contentType: z.string().max(100).default("application/json"),
	body: z.string().default("{}"),
	latency: z.number().int().min(0).max(30000).default(0),
	isActive: z.boolean().default(true),
});

export const updateMockRouteSchema = z.object({
	method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"]).optional(),
	path: z.string().min(1).max(500).optional(),
	status: z.number().int().min(100).max(599).optional(),
	contentType: z.string().max(100).optional(),
	body: z.string().optional(),
	latency: z.number().int().min(0).max(30000).optional(),
	isActive: z.boolean().optional(),
});
